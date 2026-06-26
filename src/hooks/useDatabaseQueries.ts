import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@storage/database';

export function useWorkspaces() {
  return useLiveQuery(() => db.workspaces.toArray(), []) ?? [];
}

export function useResources() {
  return useLiveQuery(() => db.resources.toArray(), []) ?? [];
}

export function useSessions() {
  return useLiveQuery(() => db.sessions.toArray(), []) ?? [];
}

export function useCategories(workspaceId?: string | null) {
  return useLiveQuery(
    () => (workspaceId ? db.categories.where('workspaceId').equals(workspaceId).toArray() : Promise.resolve([])),
    [workspaceId]
  ) ?? [];
}

export function useHealthStats() {
  const all = useLiveQuery(() => db.resources.toArray(), []) ?? [];
  const total = all.length;
  const byState: Record<string, number> = {};
  for (const r of all) {
    const s = r.healthStatus?.state ?? 'unknown';
    byState[s] = (byState[s] ?? 0) + 1;
  }
  return { total, byState };
}
