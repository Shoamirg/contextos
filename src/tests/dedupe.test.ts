import { describe, it, expect } from 'vitest';
import { findDuplicates } from '@/features/dedupe/index';

describe('dedupe', () => {
  it('groups exact matching URLs', async () => {
    const items = [
      { id: 'a', url: 'https://example.com/a' },
      { id: 'b', url: 'https://example.com/a' },
      { id: 'c', url: 'https://other.com/b' },
    ];
    const groups = await findDuplicates(items);
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });
});
