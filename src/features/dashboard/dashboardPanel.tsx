import React from 'react';
import { useWorkspaces, useResources, useHealthStats } from '@/hooks/useDatabaseQueries';
import { useWorkspaceStore } from '../workspace/workspaceStore';
import { useAnalyticsStore } from '../analytics/analyticsStore';

export function Dashboard() {
  const resources = useResources();
  const workspaces = useWorkspaces();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { snapshot: analytics, loading: analyticsLoading, refresh } = useAnalyticsStore();

  const { total, byState } = useHealthStats();

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const count = resources.length;
  const wsCount = workspaces.length;

  return (
    <div className="h-full w-full bg-gray-950 text-gray-100 p-4 overflow-auto">
      <div className="text-lg font-semibold mb-3">ContextOS Dashboard</div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Resources" value={count} />
        <StatCard label="Workspaces" value={wsCount} />
        <StatCard label="Healthy" value={byState.healthy ?? 0} />
        <StatCard label="Offline" value={byState.offline ?? 0} />
      </div>

      <Section title="Recent Workspaces">
        <div className="space-y-1 max-h-40 overflow-auto">
          {workspaces.length === 0 && (
            <div className="text-xs text-gray-600">No workspaces yet.</div>
          )}
          {workspaces
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 5)
            .map((ws) => (
              <div key={ws.id} className="rounded border border-gray-800 bg-gray-900/50 px-2 py-1 text-xs">
                <div className="truncate text-gray-200">{ws.name}</div>
                <div className="text-gray-600">{ws.archived ? 'Archived' : 'Active'}</div>
              </div>
            ))}
        </div>
      </Section>

      <Section title="Top Domains">
        {analyticsLoading && <div className="text-xs text-gray-500">Updating analytics…</div>}
        {!analyticsLoading && (!analytics?.topDomains || analytics.topDomains.length === 0) && (
          <div className="text-xs text-gray-600">No data yet.</div>
        )}
        <div className="space-y-1 max-h-40 overflow-auto">
          {analytics?.topDomains.slice(0, 8).map((d) => (
            <div key={d.domain} className="flex items-center justify-between rounded border border-gray-800 bg-gray-900/50 px-2 py-1 text-xs">
              <div className="truncate">{d.domain}</div>
              <div className="text-gray-500 shrink-0 ml-2">{d.count}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-gray-800 bg-gray-900/50 p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xl font-bold text-gray-100">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-sm text-gray-300 mb-1">{title}</div>
      {children}
    </div>
  );
}
