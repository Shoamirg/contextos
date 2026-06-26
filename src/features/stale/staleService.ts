import { db } from '@storage/database';

export enum StaleState {
  ACTIVE = 'ACTIVE',
  STALE_7 = 'STALE_7',
  STALE_30 = 'STALE_30',
  STALE_90 = 'STALE_90',
  STALE_180 = 'STALE_180',
}

function classifyStale(lastOpenedAt?: number): StaleState {
  if (!lastOpenedAt) return StaleState.STALE_180;
  const days = (Date.now() - lastOpenedAt) / (1000 * 60 * 60 * 24);
  if (days <= 7) return StaleState.ACTIVE;
  if (days <= 30) return StaleState.STALE_7;
  if (days <= 90) return StaleState.STALE_30;
  if (days <= 180) return StaleState.STALE_90;
  return StaleState.STALE_180;
}

export async function computeStaleResources() {
  const all = await db.resources.toArray();
  return all.map((r) => ({
    ...r,
    staleState: classifyStale(r.lastOpenedAt),
    daysSinceOpened: r.lastOpenedAt
      ? Math.floor((Date.now() - r.lastOpenedAt) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

export async function archiveStale(states: StaleState[]): Promise<number> {
  const stale = await computeStaleResources();
  const toArchive = stale.filter((s) => states.includes(s.staleState));
  let count = 0;
  for (const item of toArchive) {
    await db.resources.update(item.resourceId, {
      closedAt: Date.now(),
      updatedAt: Date.now(),
    });
    count += 1;
  }
  return count;
}
