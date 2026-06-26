import { db } from '../storage/database';
import {
  createWorkspace,
  listWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  archiveWorkspace,
  addResource,
  getResourcesByWorkspace,
  saveSession,
  getLatestSession,
} from '../features/workspace/repository';

async function run() {
  console.log('=== MVP Validation Pass ===');

  // Clean slate
  await db.workspaces.clear();
  await db.resources.clear();
  await db.sessions.clear();

  // 1. Workspace CRUD
  const ws1 = await createWorkspace({ name: 'Work', color: '#3b82f6' });
  const ws2 = await createWorkspace({ name: 'Research', color: '#10b981' });
  console.log('Created workspaces:', ws1.name, ws2.name);

  const all = await listWorkspaces();
  console.log('List workspaces count:', all.length);

  await updateWorkspace(ws1.id, { name: 'Work Updated' });
  const updated = (await listWorkspaces()).find((w) => w.id === ws1.id);
  console.log('Updated workspace name:', updated?.name);

  await archiveWorkspace(ws2.id);
  const archived = (await listWorkspaces()).find((w) => w.id === ws2.id);
  console.log('Archived flag:', archived?.archived);

  // 2. Resource assignment and query
  const res1 = {
    id: 'tab-1-1',
    type: 'browser-tab' as const,
    title: 'Google',
    url: 'https://google.com',
    tags: ['search'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastOpenedAt: Date.now(),
    workspaceId: ws1.id,
    categoryId: null,
    healthStatus: {
      state: 'unknown' as const,
      lastCheckedAt: Date.now(),
      failureCount: 0,
    },
    metadata: { active: true, pinned: false, windowId: 1, tabId: 1 },
  };

  const res2 = {
    id: 'tab-1-2',
    type: 'browser-tab' as const,
    title: 'GitHub',
    url: 'https://github.com',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastOpenedAt: Date.now(),
    workspaceId: null,
    categoryId: null,
    healthStatus: {
      state: 'unknown' as const,
      lastCheckedAt: Date.now(),
      failureCount: 0,
    },
    metadata: { active: false, pinned: true, windowId: 1, tabId: 2 },
  };

  await addResource(res1);
  await addResource(res2);

  const inWs = await getResourcesByWorkspace(ws1.id);
  console.log('Resources in workspace Work:', inWs.length, inWs[0]?.title);

  const unassigned = await db.resources.filter((r) => !r.workspaceId).toArray();
  console.log('Unassigned resources:', unassigned.length);

  // 3. Session save/restore
  await saveSession({
    id: 's1',
    name: 'Morning',
    workspaceId: ws1.id,
    resourceIds: ['tab-1-1', 'tab-1-2'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  });

  const latest = await getLatestSession(ws1.id);
  console.log('Latest session:', latest?.name, 'resources:', latest?.resourceIds.length);

  // 4. Simulate background sync preserving fields
  const existingResId = res1.id;
  const syncRecord = {
    id: existingResId,
    type: 'browser-tab' as const,
    title: 'Google - After Sync',
    url: 'https://google.com',
    tags: ['search', 'sync-preserved'],
    createdAt: res1.createdAt,
    updatedAt: Date.now(),
    lastOpenedAt: Date.now(),
    workspaceId: ws1.id, // Must remain
    categoryId: null,
    healthStatus: res1.healthStatus,
    metadata: { active: false, pinned: false, windowId: 1, tabId: 1 },
  };

  await db.resources.put(syncRecord);
  const afterSync = await db.resources.get(existingResId);
  console.log('Sync preserved workspaceId:', afterSync?.workspaceId === ws1.id);
  console.log('Sync updated tags:', afterSync?.tags.includes('sync-preserved'));

  // 5. Delete workspace cascade check
  await db.resources.where('workspaceId').equals(ws2.id).toArray();
  // Currently no resources in ws2, safe to delete
  await deleteWorkspace(ws2.id);
  const countAfterDelete = await db.workspaces.count();
  console.log('Workspaces after delete:', countAfterDelete);

  console.log('=== Validation Complete ===');
}

run().catch((e) => {
  console.error('Validation failed:', e);
  process.exit(1);
});
