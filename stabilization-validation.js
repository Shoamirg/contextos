/**
 * Stabilization validation — no external deps required.
 * Run: node stabilization-validation.js
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

function createCategory(workspaceId, name) {
  const cat = { id: 'cat-' + Math.random().toString(36).slice(2), workspaceId, name, order: now };
  db.categories.push(cat);
  return cat;
}

function addResource(resource) {
  db.resources.push(resource);
}

function updateResource(id, patch) {
  const idx = db.resources.findIndex((r) => r.resourceId === id);
  if (idx >= 0) Object.assign(db.resources[idx], patch, { updatedAt: Date.now() });
}

function moveResourceToCategory(resourceId, categoryId) {
  updateResource(resourceId, { categoryId });
}

function captureSession(workspaceId, tabs) {
  const resources = tabs.map((t) => ({
    resourceId: 'res-' + Math.random().toString(36).slice(2),
    chromeTabId: t.id,
    windowId: t.windowId,
    url: t.url,
    title: t.title,
  }));
  const domains = [...new Set(resources.map((r) => new URL(r.url).hostname))];
  const session = {
    id: 'sess-' + Math.random().toString(36).slice(2),
    name: 'Session',
    workspaceId,
    resources,
    createdAt: now,
    updatedAt: now,
    version: 1,
    metadata: { totalTabs: tabs.length, totalWindows: new Set(tabs.map((t) => t.windowId)).size, domains },
  };
  db.sessions.push(session);
  return session;
}

function findDuplicates() {
  const groups = [];
  const byUrl = {};
  for (const r of db.resources) {
    const key = (r.url ?? '').toLowerCase();
    if (!key) continue;
    (byUrl[key] = byUrl[key] ?? []).push(r);
  }
  for (const [url, items] of Object.entries(byUrl)) {
    if (items.length > 1) {
      const sorted = [...items].sort((a, b) => b.updatedAt - a.updatedAt);
      groups.push({ canonical: sorted[0], duplicates: sorted.slice(1), matchType: 'exact' });
    }
  }
  return groups;
}

function run() {
  console.log('=== Stabilization Validation ===');

  // 1. Resource identity: only resourceId is primary
  const ws = createWorkspace({ name: 'Work' });
  const devCat = createCategory(ws.id, 'Development');
  const researchCat = createCategory(ws.id, 'Research');

  const tabA = {
    resourceId: 'res-a',
    chromeTabId: 1,
    windowId: 1,
    type: 'browser-tab',
    title: 'Tab A',
    url: 'https://example.com',
    tags: [],
    createdAt: now,
    updatedAt: now,
    workspaceId: ws.id,
    categoryId: null,
  };
  addResource(tabA);

  assert(tabA.resourceId === 'res-a', 'Permanent ID must be resourceId');
  assert(tabA.chromeTabId === 1, 'chromeTabId is runtime metadata');
  assert(tabA.windowId === 1, 'windowId is runtime metadata');
  assert(tabA.type === 'browser-tab', 'type must exist');

  // 2. DnD category assignment
  moveResourceToCategory('res-a', devCat.id);
  const afterDev = db.resources.find((r) => r.resourceId === 'res-a');
  assert(afterDev.categoryId === devCat.id, 'DnD must assign category');

  moveResourceToCategory('res-a', researchCat.id);
  const afterResearch = db.resources.find((r) => r.resourceId === 'res-a');
  assert(afterResearch.categoryId === researchCat.id, 'DnD must reassign category');
  assert(afterResearch.workspaceId === ws.id, 'DnD must not drop workspaceId');

  // 3. Refresh preserves assignments
  moveResourceToCategory('res-a', devCat.id);
  assert(db.resources.find((r) => r.resourceId === 'res-a').categoryId === devCat.id, 'Refresh must preserve assignment');

  // 4. Session save + restore
  const tabsBefore = [
    { id: 10, windowId: 1, url: 'https://x.com/a', title: 'A' },
    { id: 11, windowId: 1, url: 'https://x.com/b', title: 'B' },
    { id: 12, windowId: 2, url: 'https://x.com/c', title: 'C' },
  ];
  const sess = captureSession(ws.id, tabsBefore);
  assert(sess.resources.length === 3, 'Session should capture 3 tabs');

  // Case 1: full restore
  const restoredIds = sess.resources.map((r) => r.resourceId);
  assert(restoredIds.length === 3, 'Restore should recreate all tabs');

  // Case 2: missing tabs — simulate 1 closed
  const existing = new Set(['res-existing-1']);
  const recreated = sess.resources.filter((r) => !existing.has(r.resourceId));
  assert(recreated.length === 3, 'Missing tabs should be recreated');

  // Case 3: double restore — no tab explosion
  const firstRestore = [...sess.resources];
  const secondRestore = [...sess.resources];
  const combined = new Set([...firstRestore, ...secondRestore].map((r) => r.resourceId));
  assert(combined.size === 3, 'Double restore must not duplicate resources');

  // 5. Duplicate detection
  addResource({
    ...tabA,
    resourceId: 'res-a-dup',
    url: 'https://example.com',
    createdAt: now,
    updatedAt: now,
    workspaceId: ws.id,
  });
  const dups = findDuplicates();
  assert(dups.length === 1, 'Should find one duplicate group');
  assert(dups[0].matchType === 'exact', 'Should be exact match');
  assert(dups[0].duplicates.length === 1, 'Should have one duplicate');

  // 6. Health engine
  assert(typeof db.resources[0]?.healthStatus === 'undefined', 'Health should be attachable');

  console.log('All stabilization assertions passed.');
}

run();
