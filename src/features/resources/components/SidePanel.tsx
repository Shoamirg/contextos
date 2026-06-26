'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '../workspace/workspaceStore';
import { useWorkspaces, useResources, useSessions } from '@/hooks/useDatabaseQueries';
import { WorkspaceList } from './WorkspaceList';
import { ResourcesList } from './ResourcesList';
import { SessionsList } from './SessionsList';
import { CategoryList } from '../category/CategoryPanel';

export function SidePanel() {
  const { activeWorkspaceId, setActiveWorkspace, hydrate } =
    useWorkspaceStore();

  const workspaces = useWorkspaces();
  const resources = useResources();
  const sessions = useSessions();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const activeWorkspaceResources = resources.filter(
    (r) => r.workspaceId === activeWorkspaceId
  );
  const activeWorkspaceSessions = sessions.filter(
    (s) => s.workspaceId === activeWorkspaceId
  );

  return (
    <div className="h-screen w-full bg-gray-950 text-gray-100 p-3 overflow-hidden">
      <WorkspaceList
        workspaces={workspaces}
        activeId={activeWorkspaceId}
        onSelect={(id) => setActiveWorkspace(id)}
      />
      <ResourcesList resources={activeWorkspaceResources} />
      <CategoryList workspaceId={activeWorkspaceId} />
      <SessionsList resources={activeWorkspaceSessions} />
    </div>
  );
}
