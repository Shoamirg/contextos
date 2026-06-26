import { useAnalyticsStore } from '@/features/analytics/analyticsStore';

export function Analytics() {
  const snapshot = useAnalyticsStore((s) => s.snapshot);

  return (
    <div className="analytics-page">
      <h2>Analytics</h2>
      <div className="analytics-grid">
        <div className="metric">
          <div className="metric-value">{String(snapshot.totalResources)}</div>
          <div className="metric-label">Resources</div>
        </div>
        <div className="metric">
          <div className="metric-value">{String(snapshot.totalWorkspaces)}</div>
          <div className="metric-label">Workspaces</div>
        </div>
      </div>
    </div>
  );
}
