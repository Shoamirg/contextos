import { db } from '@storage/database';
import type { AnalyticsSnapshot } from '@config/schemas';

export async function computeAnalytics(): Promise<AnalyticsSnapshot> {
  const [resources, workspaces, sessions] = await Promise.all([
    db.resources.toArray(),
    db.workspaces.toArray(),
    db.sessions.toArray(),
  ]);

  const totalResources = resources.length;
  const totalTabs = resources.filter((r) => r.type === 'browser-tab').length;
  const totalWorkspaces = workspaces.length;
  const totalSessions = sessions.length;

  // Duplicates
  const duplicateCount = await computeDuplicateCount();

  // Stale: no-op if feature disabled
  const staleCount = 0;

  const domainCount = new Map<string, number>();
  for (const r of resources) {
    if (!r.url) continue;
    try {
      const domain = new URL(r.url).hostname;
      domainCount.set(domain, (domainCount.get(domain) ?? 0) + 1);
    } catch {
      // ignore
    }
  }
  const topDomains = [...domainCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([domain, count]) => ({ domain, count }));

  const activity = new Map<string, number>();
  for (const s of sessions) {
    activity.set(s.workspaceId, (activity.get(s.workspaceId) ?? 0) + 1);
  }
  const workspaceActivity = [...activity.entries()]
    .map(([workspaceId, count]) => ({
      workspaceId,
      name: workspaces.find((w) => w.id === workspaceId)?.name ?? 'Unknown',
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalResources,
    totalTabs,
    totalWorkspaces,
    totalSessions,
    duplicateCount,
    staleCount,
    topDomains,
    workspaceActivity,
  };
}

export async function computeDuplicateCount(): Promise<number> {
  const all = await db.resources.toArray();
  const byUrl = new Map<string, number>();
  for (const r of all) {
    const key = (r.url ?? '').toLowerCase();
    if (!key) continue;
    byUrl.set(key, (byUrl.get(key) ?? 0) + 1);
  }
  return [...byUrl.values()].filter((n) => n > 1).length;
}
