import { describe, it, expect } from 'vitest';
import { computeAnalytics } from '@/features/analytics/analyticsService';
import type { AnalyticsSnapshot } from '@/config/schemas';

describe('computeAnalytics', () => {
  it('computes basic metrics', async () => {
    const snapshot: AnalyticsSnapshot = await computeAnalytics();
    expect(snapshot.totalResources).toBeGreaterThanOrEqual(0);
    expect(snapshot.totalWorkspaces).toBeGreaterThanOrEqual(0);
    expect(snapshot.totalSessions).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(snapshot.topDomains)).toBe(true);
    expect(Array.isArray(snapshot.workspaceActivity)).toBe(true);
  });
});
