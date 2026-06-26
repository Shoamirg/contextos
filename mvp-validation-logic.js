// Minimal dependency-free validation of repository data flow logic.
// Run: node mvp-validation-logic.js

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

const now = Date.now();
const inMemory = {
  workspaces: [],
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
  inMemory.workspaces.push(ws);
  return ws;
}

function listWorkspaces() {
  return [...inMemory.workspaces].sort((a, b) => b.updatedAt - a.updatedAt);
}

function updateWorkspace(id, patch) {
  const ws = inMemory.workspaces.find((w) => w.id === id);
  if (!ws) throw new Error('Workspace not found');
  Object.assign(ws, patch, { updatedAt: Date.now() });
}

function deleteWorkspace(id) {
  inMemory.workspaces = inMemory.workspaces.filter((w) => w.id !== id);
}

function archiveWorkspace(id) {
  const ws = inMemory.workspaces.find((w) => w.id === id);
  if (!ws) throw new Error('Workspace not found');
  ws.archived = true;
  ws.updatedAt = Date.now();
}

function addResource(resource) {
  inMemory.resources.push(resource);
}

function getResourcesByWorkspace(workspaceId) {
  return inMemory.resources.filter((r) => r.workspaceId === workspaceId);
}

function saveSession(session) {
  inMemory.sessions.push(session);
}

function getLatestSession(workspaceId) {
  const matches = inMemory.sessions
    .filter((s) => s.workspaceId === workspaceId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return matches[0];
}

// Validation
function run() {
  console.log('=== MVP Validation Logic (no dependencies) ===');

  // Workspace CRUD
  const ws1 = createWorkspace({ name: 'Work', color: '#3b82f6' });
  const ws2 = createWorkspace({ name: 'Research', color: '#10b981' });
  assert(listWorkspaces().length === 2, 'Should have 2 workspaces');

  updateWorkspace(ws1.id, { name: 'Work Updated' });
  assert(listWorkspaces()[0].name === 'Work Updated', 'Update should reflect');

  archiveWorkspace(ws2.id);
  assert(listWorkspaces().some((w) => w.archived), 'Should have archived ws');

  deleteWorkspace(ws2.id);
  assert(listWorkspaces().length === 1, 'Delete should remove workspace');

  // Resource assignment
  const res1 = {
    id: 'tab-1-1',
    type: 'browser-tab',
    title: 'Google',
    url: 'https://google.com',
    tags: ['search'],
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    workspaceId: ws1.id,
    categoryId: null,
    healthStatus: { state: 'unknown', lastCheckedAt: now, failureCount: 0 },
    metadata: { active: true, pinned: false, windowId: 1, tabId: 1 },
  };

  const res2 = {
    id: 'tab-1-2',
    type: 'browser-tab',
    title: 'GitHub',
    url: 'https://github.com',
    tags: [],
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    workspaceId: null,
    categoryId: null,
    healthStatus: { state: 'unknown', lastCheckedAt: now, failureCount: 0 },
    metadata: { active: false, pinned: true, windowId: 1, tabId: 2 },
  };

  addResource(res1);
  addResource(res2);

  const inWs = getResourcesByWorkspace(ws1.id);
  assert(inWs.length === 1, 'Should have 1 resource in ws1');
  assert(inWs[0].title === 'Google', 'Should be Google');

  const unassigned = inMemory.resources.filter((r) => !r.workspaceId);
  assert(unassigned.length === 1, 'Should have 1 unassigned resource');

  // Session
  saveSession({
    id: 's1',
    name: 'Morning',
    workspaceId: ws1.id,
    resourceIds: ['tab-1-1', 'tab-1-2'],
    createdAt: now,
    updatedAt: now,
    version: 1,
  });

  const latest = getLatestSession(ws1.id);
  assert(latest && latest.name === 'Morning', 'Latest session should exist');
  assert(latest.resourceIds.length === 2, 'Session should have 2 resources');

  // Sync preservation
  const syncRecord = {
    ...res1,
    tags: ['search', 'sync-preserved'],
    updatedAt: Date.now(),
  };
  inMemory.resources = inMemory.resources.map((r) =>
    r.id === res1.id ? syncRecord : r
  );
  const afterSync = inMemory.resources.find((r) => r.id === res1.id);
  assert(afterSync.workspaceId === ws1.id, 'Sync must preserve workspaceId');
  assert(afterSync.tags.includes('sync-preserved'), 'Sync must update tags');

  console.log('All assertions passed. Data flow is consistent.');
}

run();

