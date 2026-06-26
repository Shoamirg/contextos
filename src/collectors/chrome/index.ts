import type { Resource, ResourceCollector } from './types';

export class ChromeCollector implements ResourceCollector {
  id = 'chrome';
  name = 'Chrome';
  capabilities = { tabs: true, windows: false, history: false, bookmarks: false };

  async connect(): Promise<void> {
    // No-op: Chrome runtime is available in extension context.
  }

  async sync(): Promise<Resource[]> {
    const tabs = await chrome.tabs.query({});
    const now = Date.now();
    return tabs.map((tab) => ({
      resourceId: `res-${tab.windowId}-${tab.id}`,
      chromeTabId: tab.id,
      windowId: tab.windowId,
      type: 'browser-tab' as const,
      title: tab.title ?? 'Untitled',
      url: tab.url ?? '',
      favicon: tab.favIconUrl ?? '',
      tags: [],
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: tab.active ? now : undefined,
      workspaceId: undefined,
      categoryId: undefined,
    })) as Resource[];
  }

  async disconnect(): Promise<void> {
    // No-op
  }
}

export const chromeCollector = new ChromeCollector();
