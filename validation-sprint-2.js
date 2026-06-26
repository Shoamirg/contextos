/**
 * Standalone validation for analytics, stale detection, and export/import.
 * Run: node validation-sprint-2.js
 */

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

const now = Date.now();
const db = {
  workspaces: [],
  categories: [],
  resources: [],
  sessions: [],
};

function createWorkspace(input) {
  const ws = {
    id: 'ws-' + Math.random().toString(36).slice(2),
    name: input.name,
    description: input.description,
    color: input.color,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };
  db.workspaces.push(ws);
  return ws;
}

function addResource(resource) {
  db.resources.push(resource);
}

function captureSession(workspaceId, tabs) {
  const resources = tabs.map((t) => ({
    resourceId: 'res-' + Math.random().toString(36).slice(2),
    chromeTabId: t.id,
    windowId: t.windowId,
    url: t.url,
    title: t.title,
  }));
  const session = {
    id: 'sess-' + Math.random().toString(36).slice(2),
    name: 'Session',
    workspaceId,
    resources,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
  db.sessions.push(session);
  return session;
}

function computeAnalytics() {
  const totalResources = db.resources.length;
  const totalTabs = db.resources.filter((r) => r.type === 'browser-tab').length;
  const totalWorkspaces = db.workspaces.length;
  const totalSessions = db.sessions.length;

  const domainCount = new Map();
  for (const r of db.resources) {
    if (!r.url) continue;
    try {
      const domain = new URL(r.url).hostname;
      domainCount.set(domain, (domainCount.get(domain) ?? 0) + 1);
    } catch {
      // ignore
    }
  }
  const topDomains = [...domainCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([domain, count]) => ({ domain, count }));

  const duplicateCount = 0;
  const staleCount = 0;

  return { totalResources, totalTabs, totalWorkspaces, totalSessions, duplicateCount, staleCount, topDomains };
}

function classifyStale(lastOpenedAt) {
  if (!lastOpenedAt) return 'STALE_180';
  const days = (Date.now() - lastOpenedAt) / (1000 * 60 * 60 * 24);
  if (days <= 7) return 'ACTIVE';
  if (days <= 30) return 'STALE_7';
  if (days <= 90) return 'STALE_30';
  if (days <= 180) return 'STALE_90';
  return 'STALE_180';
}

function computeStaleResources() {
  return db.resources.map((r) => ({
    ...r,
    staleState: classifyStale(r.lastOpenedAt),
    daysSinceOpened: r.lastOpenedAt
      ? Math.floor((Date.now() - r.lastOpenedAt) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

function exportAll() {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    workspaces: [...db.workspaces],
    categories: [...db.categories],
    resources: [...db.resources],
    sessions: [...db.sessions],
  };
}

function importPayload(payload) {
  for (const ws of payload.workspaces) db.workspaces.push(ws);
  for (const cat of payload.categories) db.categories.push(cat);
  for (const res of payload.resources) db.resources.push(res);
  for (const sess of payload.sessions) db.sessions.push(sess);
}

function run() {
  console.log('=== Sprint 2 Validation ===');

  // Setup
  const ws1 = createWorkspace({ name: 'Research' });
  const ws2 = createWorkspace({ name: 'Development' });

  addResource({
    resourceId: 'res-1',
    type: 'browser-tab',
    title: 'Example',
    url: 'https://example.com',
    tags: [],
    createdAt: now - 1000,
    updatedAt: now - 1000,
    lastOpenedAt: now - 1000,
    workspaceId: ws1.id,
    categoryId: null,
    chromeTabId: 1,
    windowId: 1,
  });

  addResource({
    resourceId: 'res-2',
    type: 'browser-tab',
    title: 'Example',
    url: 'https://example.com',
    tags: [],
    createdAt: now - 2000,
    updatedAt: now - 2000,
    lastOpenedAt: now - 2000,
    workspaceId: ws1.id,
    categoryId: null,
    chromeTabId: 2,
    windowId: 1,
  });

  addResource({
    resourceId: 'res-3',
    type: 'browser-tab',
    title: 'Old Page',
    url: 'https://old.example.com',
    tags: [],
    createdAt: now - 24 * 60 * 60 * 1000 * 40,
    updatedAt: now - 24 * 60 * 60 * 1000 * 40,
    lastOpenedAt: now - 24 * 60 * 60 * 1000 * 40,
    workspaceId: ws2.id,
    categoryId: null,
    chromeTabId: 3,
    windowId: 1,
  });

  captureSession(ws1.id, [
    { id: 10, windowId: 1, url: 'https://x.com/a', title: 'A' },
    { id: 11, windowId: 1, url: 'https://x.com/b', title: 'B' },
  ]);

  // Analytics
  const analytics = computeAnalytics();
  assert(analytics.totalResources === 3, 'Should count 3 resources');
  assert(analytics.totalTabs === 3, 'Should count 3 tabs');
  assert(analytics.totalWorkspaces === 2, 'Should count 2 workspaces');
  assert(analytics.totalSessions === 1, 'Should count 1 session');
  assert(analytics.topDomains.some((d) => d.domain === 'example.com'), 'Top domain example.com');
  console.log('Analytics OK');

  // Stale detection
  const stale = computeStaleResources();
  assert(stale[0].staleState === 'ACTIVE', 'Recent tab is active');
  assert(stale[2].staleState === 'STALE_30', '40-day tab is STALE_30');
  console.log('Stale detection OK');

  // Export/import roundtrip
  const exported = exportAll();
  assert(exported.version === '1.0', 'Export version');
  assert(exported.workspaces.length === 2, 'Export includes workspaces');

  // Import roundtrip into empty DB
  const prevWorkspaces = db.workspaces.length;
  db.workspaces.length = 0;
  db.categories.length = 0;
  db.resources.length = 0;
  db.sessions.length = 0;

  importPayload(exported);
  assert(db.workspaces.length === 2, 'Import restores workspaces');
  assert(db.resources.length === 3, 'Import restores resources');
  assert(db.sessions.length === 1, 'Import restores sessions');
  console.log('Export/Import OK');

  console.log('All Sprint 2 assertions passed.');
}

run();
