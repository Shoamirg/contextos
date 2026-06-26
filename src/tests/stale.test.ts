import { describe, it, expect } from 'vitest';
import { classifyStale, shouldArchive } from '@/features/stale/staleService';

describe('staleService', () => {
  it('classifies resources by lastAccessedAt', () => {
    const now = Date.now();
    expect(classifyStale(now - 2 * 86400000).state).toBe('STALE_7');
    expect(classifyStale(now - 10 * 86400000).state).toBe('STALE_30');
    expect(classifyStale(now - 45 * 86400000).state).toBe('STALE_90');
    expect(classifyStale(now - 200 * 86400000).state).toBe('STALE_180');
  });
  it('archives after threshold', () => {
    const item = { id: 'r1', lastAccessedAt: Date.now() - 60 * 86400000, state: 'STALE_90' };
    expect(shouldArchive(item, 30)).toBe(true);
  });
});
