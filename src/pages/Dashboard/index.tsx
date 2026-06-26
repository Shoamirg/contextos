import { db } from '@/storage/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { useWorkspaceStore } from '@/features/workspace/workspaceStore';
import { useAnalyticsStore } from '@/features/analytics/analyticsStore';
import { useResourceStore } from '@/features/resources/resourceStore';

export function Dashboard() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const resources = useLiveQuery(() => db.resources.toArray());
  const dupes = useResourceStore((s) => s.duplicates);
  const analytics = useAnalyticsStore((s) => s.snapshot);

  const stats = [
    { label: 'Workspaces', value: workspaces.length },
    { label: 'Resources', value: resources?.length ?? 0 },
    { label: 'Duplicates', value: dupes?.length ?? 0 },
    { label: 'Stale', value: analytics?.staleCount ?? 0 },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <h2>Dashboard</h2>
        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat-value">{String(s.value)}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
