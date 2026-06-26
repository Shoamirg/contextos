'use client';

import React from 'react';
import { useSessions, useResources } from '@/hooks/useDatabaseQueries';
import { useSessionStore } from './sessionStore';
import { useResourceStore } from '../resources/resourceStore';
import type { Session } from '@types/index';

export function SessionPanel({ workspaceId }: { workspaceId: string | null }) {
  const { items, loadSessions, selectedSessionId, setSelectedSession, remove, restore } =
    useSessionStore();
  const resources = useResources();

  React.useEffect(() => {
    if (workspaceId) {
      void loadSessions(workspaceId);
    }
  }, [workspaceId, loadSessions]);

  const selectedResources = resources.filter((r) =>
    (items.find((s) => s.id === selectedSessionId)?.resources ?? []).some(
      (sr) => sr.resourceId === r.resourceId
    )
  );

  if (!workspaceId) {
    return <div className="text-xs text-gray-500 mt-2">Select a workspace first.</div>;
  }

  return (
    <div className="mt-3 border-t border-gray-800 pt-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-gray-400">Sessions</div>
        <button
          className="text-xs text-blue-300 hover:text-blue-200"
          onClick={async () => {
            const session = await useSessionStore.getState().saveCurrent(workspaceId);
            console.log('Saved session', session);
          }}
        >
          + Save
        </button>
      </div>
      <div className="space-y-1 max-h-48 overflow-auto pr-1">
        {items.length === 0 && (
          <div className="text-xs text-gray-600">No sessions yet.</div>
        )}
        {items.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between rounded border px-2 py-1.5 text-xs cursor-pointer ${
              s.id === selectedSessionId
                ? 'border-blue-500 bg-blue-950/40 text-blue-100'
                : 'border-gray-800 bg-gray-900/50 text-gray-200 hover:border-gray-700'
            }`}
            onClick={() => setSelectedSession(s.id)}
          >
            <div className="truncate pr-2">{s.name}</div>
            <div className="flex gap-1 shrink-0">
              <button
                className="text-gray-400 hover:text-gray-200"
                onClick={async (e) => {
                  e.stopPropagation();
                  await restore(s);
                }}
              >
                Restore
              </button>
              <button
                className="text-gray-500 hover:text-red-300"
                onClick={async (e) => {
                  e.stopPropagation();
                  await remove(s.id);
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
