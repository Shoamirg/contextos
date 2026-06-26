import { db } from '@storage/database';
import type { Resource, DuplicateGroup } from '@types/index';
import { normalizeUrl, sameDomain } from '../workers/background';

export async function findDuplicates(): Promise<DuplicateGroup[]> {
  const all = await db.resources.toArray();
  const groups: DuplicateGroup[] = [];

  // 1. Exact URL match
  const byUrl: Record<string, Resource[]> = {};
  for (const r of all) {
    const key = (r.url ?? '').toLowerCase();
    if (!key) continue;
    byUrl[key] = byUrl[key] ?? [];
    byUrl[key].push(r);
  }
  for (const [url, items] of Object.entries(byUrl)) {
    if (items.length > 1) {
      const [canonical, ...dupes] = items.sort((a, b) => b.updatedAt - a.updatedAt);
      groups.push({ canonical, duplicates: dupes, matchType: 'exact' });
    }
  }

  // 2. Normalized URL match (strip tracking params, lowercase)
  const byNorm: Record<string, Resource[]> = {};
  for (const r of all) {
    if (!r.url) continue;
    const norm = normalizeUrl(r.url);
    byNorm[norm] = byNorm[norm] ?? [];
    byNorm[norm].push(r);
  }
  for (const [norm, items] of Object.entries(byNorm)) {
    if (items.length > 1) {
      const canonical = items.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      const dupes = items.filter((x) => x !== canonical);
      if (dupes.length && !groups.some((g) => g.canonical.resourceId === canonical.resourceId)) {
        groups.push({ canonical, duplicates: dupes, matchType: 'normalized' });
      }
    }
  }

  // 3. Same-domain duplicate detection (secondary)
  const byDomain: Record<string, Resource[]> = {};
  for (const r of all) {
    if (!r.url) continue;
    try {
      const domain = new URL(r.url).hostname;
      byDomain[domain] = byDomain[domain] ?? [];
      byDomain[domain].push(r);
    } catch {
      // ignore malformed URLs
    }
  }
  for (const [domain, items] of Object.entries(byDomain)) {
    if (items.length > 3) {
      const canonical = items.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      const dupes = items.filter((x) => x !== canonical);
      if (dupes.length && !groups.some((g) => g.canonical.resourceId === canonical.resourceId)) {
        groups.push({
          canonical,
          duplicates: dupes,
          matchType: 'domain',
        });
      }
    }
  }

  return groups;
}

export async function mergeDuplicates(group: DuplicateGroup): Promise<void> {
  const { db } = await import('@storage/database');
  for (const dup of group.duplicates) {
    await db.resources.update(dup.resourceId, {
      closedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}
