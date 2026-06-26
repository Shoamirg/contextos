import Fuse from 'fuse.js';
import type { Resource } from '@types/index';

export function createFuse(items: Resource[]) {
  return new Fuse(items, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'url', weight: 0.2 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    includeScore: true,
  });
}

export async function searchResources(query: string): Promise<Resource[]> {
  const { db } = await import('@storage/database');
  const all = await db.resources.toArray();
  if (!query.trim()) return all;
  const fuse = createFuse(all);
  return fuse.search(query).map((r) => r.item);
}
