import { describe, it, expect } from 'vitest';
import { validateExport } from '@/features/exportImport/importRepository';

describe('importRepository', () => {
  it('rejects payloads with unknown fields when strict', () => {
    const bad = '{"version":"2.0","workspaces":[]}';
    const result = validateExport(bad, true);
    expect(result.valid).toBe(false);
  });
});
