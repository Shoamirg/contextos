import { create } from 'zustand';
import type { AnalyticsSnapshot } from '@config/schemas';
import { computeAnalytics } from './analyticsService';

interface AnalyticsState {
  snapshot: AnalyticsSnapshot | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  snapshot: null,
  loading: false,
  refresh: async () => {
    set({ loading: true });
    try {
      const snapshot = await computeAnalytics();
      set({ snapshot, loading: false });
    } catch (error) {
      console.error('Analytics refresh failed:', error);
      set({ loading: false });
    }
  },
}));
