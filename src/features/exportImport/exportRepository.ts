import { db } from '@storage/database';
import type { ExportPayload } from '@config/schemas';

export async function exportWorkspace(workspaceId: string): Promise<ExportPayload> {
  const [workspaces, categories, resources, sessions] = await Promise.all([
    db.workspaces.where('id').equals(workspaceId).toArray(),
    db.categories.where('workspaceId').equals(workspaceId).toArray(),
    db.resources.where('workspaceId').equals(workspaceId).toArray(),
    db.sessions.where('workspaceId').equals(workspaceId).toArray(),
  ]);

  const payload: ExportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    workspaces,
    categories,
    resources,
    sessions,
  };

  return payload;
}

export async function exportAll(): Promise<ExportPayload> {
  const [workspaces, categories, resources, sessions] = await Promise.all([
    db.workspaces.toArray(),
    db.categories.toArray(),
    db.resources.toArray(),
    db.sessions.toArray(),
  ]);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    workspaces,
    categories,
    resources,
    sessions,
  };
}

export function serializeExport(payload: ExportPayload): string {
  return JSON.stringify(payload, null, 2);
}
