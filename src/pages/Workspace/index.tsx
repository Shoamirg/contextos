import { useWorkspaceStore } from '@/features/workspace/workspaceStore';
import { useSessionStore } from '@/features/session/sessionStore';
import { useResourceStore } from '@/features/resources/resourceStore';

export function Workspace() {
  const ws = useWorkspaceStore((s) => s.workspaces);
  const resources = useResourceStore((s) => s.resources);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const selectedWorkspace = useWorkspaceStore((s) => s.selectedWorkspace);

  const active = ws.find((w) => w.id === activeWorkspaceId) ?? selectedWorkspace;
  const wsResources = active ? resources.filter((r) => r.workspaceId === active.id) : [];

  return (
    <div className="workspace-page">
      <div className="workspace-header">
        <h2>{active ? active.name : 'All Resources'}</h2>
      </div>
      <div className="workspace-grid">
        {wsResources.map((r) => (
          <div
            key={r.resourceId}
            className="resource-card"
            draggable
          >
            <div className="resource-title">{r.title}</div>
            <div className="resource-url">{r.url}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
