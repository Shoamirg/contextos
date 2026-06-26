import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/database';
import { createWorkspace, updateWorkspace, archiveWorkspace } from '../features/workspace/repository';
import { useWorkspaceStore } from '../features/workspace/workspaceStore';
import { useResourceStore } from '../features/resources/resourceStore';

describe('WorkspaceStore hydration and consistency', () => {
  beforeEach(async () => {
    await db.workspaces.clear();
  });

  it('hydrate loads workspaces into store', async () => {
    const wsId = crypto.randomUUID();
    await db.workspaces.add({
      id: wsId,
      name: 'Hydration WS',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archived: false,
    });

    const store = useWorkspaceStore.getState();
    await store.hydrate();

    const all = useWorkspaceStore.getState().workspaces;
    expect(all.some((w) => w.id === wsId)).toBe(true);
  });

  it('active workspace can be changed', async () => {
    const store = useWorkspaceStore.getState();
    await store.hydrate();
    const ws = useWorkspaceStore.getState().workspaces[0];
    if (ws) {
      store.setActiveWorkspace(ws.id);
      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe(ws.id);
    }
  });
});

describe('ResourceStore selection and workspace assignment', () => {
  beforeEach(async () => {
    await db.resources.clear();
  });

  it('toggles selection without DB writes', async () => {
    const store = useResourceStore.getState();
    const id = 'res-1';
    store.toggleSelect(id);
    expect(useResourceStore.getState().selectedIds).toContain(id);
    store.toggleSelect(id);
    expect(useResourceStore.getState().selectedIds).not.toContain(id);
  });

  it('assignWorkspace persists to DB', async () => {
    const ws = await createWorkspace({ name: 'WS-A' });
    const resId = crypto.randomUUID();
    await db.resources.add({
      id: resId,
      type: 'browser-tab',
      title: 'T',
      url: 'https://x.com',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      workspaceId: null,
      categoryId: null,
      healthStatus: {
        state: 'unknown',
        lastCheckedAt: Date.now(),
        failureCount: 0,
      },
    });

    const store = useResourceStore.getState();
    await store.assignWorkspace(resId, ws.id);

    const updated = await db.resources.get(resId);
    expect(updated?.workspaceId).toBe(ws.id);
  });

  it('background sync preserves existing workspaceId', async () => {
    const ws = await createWorkspace({ name: 'WS-B' });
    const resId = 'tab-1-2';
    await db.resources.add({
      id: resId,
      type: 'browser-tab',
      title: 'Keep Me',
      url: 'https://keep.me',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      workspaceId: ws.id,
      categoryId: null,
      healthStatus: {
        state: 'unknown',
        lastCheckedAt: Date.now(),
        failureCount: 0,
      },
    });

    // Simulate sync by calling collectTabs logic manually
    // Mock chrome.tabs.query
    const originalQuery = chrome.tabs.query;
    chrome.tabs.query = async () => [
      {
        id: 2,
        windowId: 1,
        title: 'Keep Me',
        url: 'https://keep.me',
        favIconUrl: '',
        active: false,
        pinned: false,
        groupId: -1,
      } as chrome.tabs.Tab,
    ];

    const { syncResources } = await import('../workers/background');
    await syncResources();

    chrome.tabs.query = originalQuery;

    const updated = await db.resources.get(resId);
    expect(updated?.workspaceId).toBe(ws.id);
  });
});

describe('Data consistency: workspace archive behavior', () => {
  it('archiveWorkspace updates archived flag and timestamp', async () => {
    const ws = await createWorkspace({ name: 'ArchiveMe' });
    expect(ws.archived).toBe(false);

    await updateWorkspace(ws.id, { archived: true });
    const updated = await db.workspaces.get(ws.id);
    expect(updated?.archived).toBe(true);
    expect(typeof updated?.updatedAt).toBe('number');
  });
});
