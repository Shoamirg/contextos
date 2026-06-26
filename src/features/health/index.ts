import { db } from '@storage/database';
import type { HealthStatus, Resource } from '@types/index';
import { checkHealth } from '../workers/background';

export async function updateHealth(
  resourceId: string
): Promise<HealthStatus> {
  const resource = await db.resources.get(resourceId);
  if (!resource?.url) {
    return {
      state: 'unknown',
      lastCheckedAt: Date.now(),
      failureCount: 0,
    };
  }
  const status = await checkHealth(resource);
  await db.resources.update(resourceId, {
    healthStatus: status,
    updatedAt: Date.now(),
  });
  return status;
}

export async function bulkHealthCheck(): Promise<void> {
  const all = await db.resources.toArray();
  for (const resource of all) {
    await updateHealth(resource.resourceId);
  }
}

export async function getUnhealthy(): Promise<Resource[]> {
  return db.resources
    .filter((r) => r.healthStatus?.state === 'offline' || r.healthStatus?.state === 'slow')
    .toArray();
}

export async function getHealthStats() {
  const all = await db.resources.toArray();
  const total = all.length;
  const byState: Record<string, number> = {};
  for (const r of all) {
    const s = r.healthStatus?.state ?? 'unknown';
    byState[s] = (byState[s] ?? 0) + 1;
  }
  return { total, byState };
}
