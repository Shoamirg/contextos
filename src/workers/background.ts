import type { Resource, HealthStatus, SessionResource } from '@types/index';
import { db } from '@storage/database';

function stableWindowKey(tab: chrome.tabs.Tab): string {
  return `${tab.windowId ?? 'win-unknown'}-${tab.id ?? 'tab-new'}`;
}

export async function upsertTab(tab: chrome.tabs.Tab): Promise<Resource> {
  const now = Date.now();
  const winKey = stableWindowKey(tab);
  const url = tab.url ?? '';

  // Try exact match by runtime key first (within same session).
  const byRuntime = await db.resources
    .where('url')
    .equals(url)
    .and((r) => r.windowId === tab.windowId && r.chromeTabId === tab.id)
    .first();

  let resource: Resource;

  if (byRuntime) {
    resource = {
      ...byRuntime,
      title: tab.title ?? byRuntime.title,
      favicon: tab.favIconUrl ?? byRuntime.favicon,
      updatedAt: now,
      lastOpenedAt: now,
      chromeTabId: tab.id,
      windowId: tab.windowId,
      metadata: {
        ...(byRuntime.metadata ?? {}),
        active: tab.active,
        pinned: tab.pinned,
        groupId: tab.groupId,
      },
    };
  } else {
    // Try normalized URL match within same window to recover permanent resourceId across restarts.
    const normalizedUrl = normalizeUrl(url);
    const recovered = await db.resources
      .where('url')
      .equals(normalizedUrl)
      .and((r) => r.windowId === tab.windowId || !r.windowId)
      .first();

    const resourceId = recovered?.resourceId ?? crypto.randomUUID();

    resource = {
      resourceId,
      type: 'browser-tab',
      title: tab.title ?? '',
      url,
      favicon: tab.favIconUrl,
      tags: recovered?.tags ?? [],
      createdAt: recovered?.createdAt ?? now,
      updatedAt: now,
      lastOpenedAt: now,
      closedAt: undefined,
      workspaceId: recovered?.workspaceId,
      categoryId: recovered?.categoryId,
      healthStatus: recovered?.healthStatus ?? {
        state: 'unknown',
        lastCheckedAt: now,
        failureCount: 0,
      } as HealthStatus,
      chromeTabId: tab.id,
      windowId: tab.windowId,
      metadata: {
        active: tab.active,
        pinned: tab.pinned,
        groupId: tab.groupId,
        windowKey: winKey,
      },
    };
  }

  await db.resources.put(resource);
  return resource;
}

export async function markClosed(tabId: number, windowId: number): Promise<void> {
  const existing = await db.resources
    .where('url')
    .startsWith('http')
    .and((r) => r.chromeTabId === tabId && r.windowId === windowId)
    .first();

  if (existing) {
    await db.resources.update(existing.resourceId, {
      closedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

export async function syncResources(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  const now = Date.now();

  for (const tab of tabs) {
    await upsertTab(tab);
  }
}

export async function checkHealth(_resource: Resource): Promise<HealthStatus> {
  const start = Date.now();
  try {
    // Placeholder: real impl would ping via fetch/go2rtc/etc.
    await new Promise((resolve) => setTimeout(resolve, 50));
    const responseMs = Date.now() - start;
    return {
      state: responseMs > 1000 ? 'slow' : 'healthy',
      lastCheckedAt: Date.now(),
      responseMs,
      failureCount: 0,
    } as HealthStatus;
  } catch {
    return {
      state: 'offline',
      lastCheckedAt: Date.now(),
      failureCount: 1,
    } as HealthStatus;
  }
}

export async function captureSession(
  workspaceId: string,
  name?: string
): Promise<Session> {
  const tabs = await chrome.tabs.query({});
  const now = Date.now();
  const resources: SessionResource[] = [];
  const domains: string[] = [];

  for (const tab of tabs) {
    if (!tab.url) continue;
    const existing = await db.resources
      .where('url')
      .equals(tab.url)
      .and((r) => r.windowId === tab.windowId && r.chromeTabId === tab.id)
      .first();

    const resourceId = existing?.resourceId ?? crypto.randomUUID();
    const urlObj = new URL(tab.url);
    const domain = urlObj.hostname;
    if (!domains.includes(domain)) domains.push(domain);

    resources.push({
      resourceId,
      chromeTabId: tab.id,
      windowId: tab.windowId,
      url: tab.url,
      title: tab.title ?? '',
    });
  }

  const session: Session = {
    id: crypto.randomUUID(),
    name: name ?? `Session ${new Date(now).toLocaleString()}`,
    workspaceId,
    resources,
    createdAt: now,
    updatedAt: now,
    version: 1,
    metadata: {
      totalTabs: tabs.length,
      totalWindows: new Set(tabs.map((t) => t.windowId)).size,
      domains,
    },
  };

  await db.sessions.put(session);
  return session;
}

export async function restoreSession(session: Session): Promise<void> {
  for (const res of session.resources) {
    if (!res.url) continue;
    await chrome.tabs.create({ url: res.url, active: false });
  }
}

export async function listSessions(workspaceId: string): Promise<Session[]> {
  return db.sessions.where('workspaceId').equals(workspaceId).toArray();
}

export async function getSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id);
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}://${u.host}${u.pathname}${u.search}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function sameDomain(a: string, b: string): boolean {
  try {
    return new URL(a).hostname === new URL(b).hostname;
  } catch {
    return false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void chrome.alarms.create('sync-resources', { periodInMinutes: 5 });
  void chrome.alarms.create('health-check', { periodInMinutes: 15 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'sync-resources') {
    await syncResources();
  } else if (alarm.name === 'health-check') {
    const all = await db.resources.toArray();
    for (const res of all) {
      const health = await checkHealth(res);
      await db.resources.update(res.resourceId, {
        healthStatus: health,
        updatedAt: Date.now(),
      });
    }
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  void upsertTab(tab);
});

chrome.tabs.onRemoved.addListener((tabId, { windowId }) => {
  void markClosed(tabId, windowId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {
    void upsertTab(tab);
  }
});

chrome.tabs.onMoved.addListener((tabId, { windowId }) => {
  void chrome.tabs.get(tabId, { windowId }).then((tab) => {
    void upsertTab(tab);
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'CAPTURE_SESSION') {
    captureSession(msg.workspaceId, msg.name).then(sendResponse);
    return true;
  }
  if (msg.type === 'RESTORE_SESSION') {
    restoreSession(msg.session).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'SYNC_NOW') {
    syncResources().then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});
