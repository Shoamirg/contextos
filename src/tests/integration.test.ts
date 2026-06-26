import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/database';
import {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  archiveWorkspace,
  listWorkspaces,
  addResource,
  getResourcesByWorkspace,
  saveSession,
  getLatestSession,
} from '../features/workspace/repository';

function makeWorkspace(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: 'Test WS',
    description: 'desc',
    color: '#ff0000',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    archived: false,
    ...overrides,
  };
}

function makeResource(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    type: 'browser-tab',
    title: 'Tab',
    url: 'https://example.com',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastOpenedAt: Date.now(),
    healthStatus: {
      state: 'unknown',
      lastCheckedAt: Date.now(),
      failureCount: 0,
    } as const,
    ...overrides,
  };
}

describe('Workspace repository', () => {
  beforeEach(async () => {
    await db.workspaces.clear();
    await db.resources.clear();
    await db.sessions.clear();
  });

  it('creates and lists workspaces', async () => {
    const ws = await createWorkspace({ name: 'Alpha' });
    expect(ws.id).toBeTruthy();
    const all = await listWorkspaces();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Alpha');
  });

  it('updates workspace', async () => {
    const ws = await createWorkspace({ name: 'Alpha' });
    await updateWorkspace(ws.id, { name: 'Beta' });
    const all = await listWorkspaces();
    expect(all[0].name).toBe('Beta');
  });

  it('archives workspace', async () => {
    const ws = await createWorkspace({ name: 'Alpha' });
    await archiveWorkspace(ws.id);
    const all = await listWorkspaces();
    expect(all[0].archived).toBe(true);
  });

  it('deletes workspace', async () => {
    const ws = await createWorkspace({ name: 'Alpha' });
    await deleteWorkspace(ws.id);
    const all = await listWorkspaces();
    expect(all).toHaveLength(0);
  });
});

describe('Resource + Workspace consistency', () => {
  it('assigns resources to workspace and queries them', async () => {
    const ws = await createWorkspace({ name: 'WS1' });
    await addResource(makeResource({ workspaceId: ws.id }));
    await addResource(makeResource({ workspaceId: null }));

    const inWs = await getResourcesByWorkspace(ws.id);
    expect(inWs).toHaveLength(1);
    expect(inWs[0].workspaceId).toBe(ws.id);
  });

  it('does not leak unassigned resources into workspace filter', async () => {
    const ws = await createWorkspace({ name: 'WS1' });
    await addResource(makeResource({ workspaceId: null }));

    const inWs = await getResourcesByWorkspace(ws.id);
    expect(inWs).toHaveLength(0);
  });
});

describe('Session lifecycle', () => {
  it('saves and restores latest session per workspace', async () => {
    const ws = await createWorkspace({ name: 'WS1' });
    const session = {
      id: crypto.randomUUID(),
      name: 'Morning',
      workspaceId: ws.id,
      resourceIds: ['r1', 'r2'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };
    await saveSession(session);

    const latest = await getLatestSession(ws.id);
    expect(latest?.name).toBe('Morning');
    expect(latest?.resourceIds).toEqual(['r1', 'r2']);
  });
});
