import type { Workspace, Category, Resource, Session } from '@types/index';
import { db } from '@storage/database';

export async function listWorkspaces(): Promise<Workspace[]> {
  return db.workspaces.orderBy('updatedAt').reverse().toArray();
}

export async function createWorkspace(input: {
  name: string;
  description?: string;
  color?: string;
}): Promise<Workspace> {
  const workspace: Workspace = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description,
    color: input.color,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    archived: false,
  };
  await db.workspaces.add(workspace);
  return workspace;
}

export async function updateWorkspace(
  id: string,
  patch: Partial<Workspace>
): Promise<void> {
  await db.workspaces.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteWorkspace(id: string): Promise<void> {
  await db.workspaces.delete(id);
}

export async function archiveWorkspace(id: string): Promise<void> {
  await db.workspaces.update(id, { archived: true, updatedAt: Date.now() });
}

export async function getCategories(workspaceId: string): Promise<Category[]> {
  return db.categories.where('workspaceId').equals(workspaceId).toArray();
}

export async function getResourcesByWorkspace(
  workspaceId: string
): Promise<Resource[]> {
  return db.resources.where('workspaceId').equals(workspaceId).toArray();
}

export async function addResource(resource: Resource): Promise<void> {
  await db.resources.add(resource);
}

export async function updateResource(
  id: string,
  patch: Partial<Resource>
): Promise<void> {
  await db.resources.update(id, { ...patch, updatedAt: Date.now() });
}

export async function saveSession(session: Session): Promise<void> {
  await db.sessions.put(session);
}

export async function getLatestSession(
  workspaceId: string
): Promise<Session | undefined> {
  return db.sessions
    .where('workspaceId')
    .equals(workspaceId)
    .reverse()
    .sortBy('updatedAt')
    .then((arr) => arr[0]);
}
