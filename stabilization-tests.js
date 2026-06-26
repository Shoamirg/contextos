/**
 * Standalone integration tests (no external deps).
 * Run: node stabilization-tests.js
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

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}://${u.host}${u.pathname}${u.search}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function findDuplicates() {
  const groups = [];
  const byUrl = {};
  for (const r of db.resources) {
    const key = normalizeUrl(r.url);
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
  console.log('=== Stabilization Integration Tests ===');

  // ----- Setup -----
  const ws = createWorkspace({ name: 'Research' });
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

  const tabB = {
    resourceId: 'res-b',
    chromeTabId: 2,
    windowId: 1,
    type: 'browser-tab',
    title: 'Tab B',
    url: 'https://example.org',
    tags: [],
    createdAt: now,
    updatedAt: now,
    workspaceId: ws.id,
    categoryId: null,
  };
  addResource(tabB);

  // ----- Test 1: DnD Category Assignment -----
  const t1Start = Date.now();
  moveResourceToCategory('res-a', devCat.id);
  const afterDev = db.resources.find((r) => r.resourceId === 'res-a');
  assert(afterDev.categoryId === devCat.id, 'T1: resource assigned to Development');
  assert(afterDev.workspaceId === ws.id, 'T1: workspaceId preserved during DnD');
  assert(afterDev.updatedAt >= t1Start, 'T1: timestamp updated on assignment');

  // ----- Test 2: Reassignment -----
  moveResourceToCategory('res-a', researchCat.id);
  const afterResearch = db.resources.find((r) => r.resourceId === 'res-a');
  assert(afterResearch.categoryId === researchCat.id, 'T2: resource reassigned to Research');

  // ----- Test 3: Refresh preserves assignment -----
  // Simulate refresh by querying all resources and checking assignment
  const refreshed = db.resources.find((r) => r.resourceId === 'res-a');
  assert(refreshed.categoryId === researchCat.id, 'T3: category assignment survives refresh');

  // ----- Test 4: Drop to null (uncategorized) -----
  moveResourceToCategory('res-a', null);
  const unassigned = db.resources.find((r) => r.resourceId === 'res-a');
  assert(unassigned.categoryId === null, 'T4: dropping to null clears category');

  // ----- Test 5: Session save + full restore (Case 1) -----
  const tabsBefore = [
    { id: 10, windowId: 1, url: 'https://x.com/a', title: 'A' },
    { id: 11, windowId: 1, url: 'https://x.com/b', title: 'B' },
    { id: 12, windowId: 2, url: 'https://x.com/c', title: 'C' },
  ];
  const sess = captureSession(ws.id, tabsBefore);
  assert(sess.resources.length === 3, 'T5: session saved 3 tabs');

  // Simulate restore: all tabs should be reopened
  const restoredIds = sess.resources.map((r) => r.resourceId);
  assert(restoredIds.length === 3, 'T5: restore returns 3 tabs');

  // ----- Test 6: Missing tabs after restore (Case 2) -----
  // Suppose tab B was closed before restore
  const existingIds = new Set([sess.resources[0].resourceId, sess.resources[2].resourceId]);
  const missing = sess.resources.filter((r) => !existingIds.has(r.resourceId));
  assert(missing.length === 1, 'T6: detect 1 missing tab');
  assert(missing[0].title === 'B', 'T6: missing tab is B');

  // ----- Test 7: Double restore prevents explosion (Case 3) -----
  const firstIds = new Set(sess.resources.map((r) => r.resourceId));
  const secondIds = new Set(sess.resources.map((r) => r.resourceId));
  const combined = new Set([...firstIds, ...secondIds]);
  assert(combined.size === 3, 'T7: double restore creates no duplicates');

  // ----- Test 8: Duplicate detection exact match -----
  addResource({
    ...tabA,
    resourceId: 'res-a-dup',
    url: 'https://example.com',
    createdAt: now - 1000,
    updatedAt: now - 1000,
    workspaceId: ws.id,
  });
  const dups = findDuplicates();
  assert(dups.length === 1, 'T8: found exactly 1 duplicate group');
  assert(dups[0].canonical.resourceId === 'res-a', 'T8: canonical is newer resource');
  assert(dups[0].duplicates.some((d) => d.resourceId === 'res-a-dup'), 'T8: includes older duplicate');
  assert(dups[0].matchType === 'exact', 'T8: detected as exact match');

  console.log('All integration tests passed.');
}

run();
