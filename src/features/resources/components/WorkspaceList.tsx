import { useWorkspaces } from '@/hooks/useDatabaseQueries';
import { useWorkspaceStore } from '../workspace/workspaceStore';
import type { Workspace } from '@types/index';

export function WorkspaceList({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const workspaces = useWorkspaces();
  const hydrate = useWorkspaceStore((s) => s.hydrate);

  return (
    <div className="mb-3">
      <div className="text-xs text-gray-400 mb-1">Workspaces</div>
      <div className="space-y-1 max-h-40 overflow-auto pr-1">
        {workspaces.length === 0 ? (
          <div className="text-xs text-gray-500">No workspaces yet.</div>
        ) : (
          workspaces.map((ws: Workspace) => (
            <button
              key={ws.id}
              onClick={() => onSelect(ws.id)}
              className={`w-full text-left text-sm rounded px-2 py-1 border ${
                ws.id === activeId
                  ? 'border-blue-500 bg-blue-950/40 text-blue-100'
                  : 'border-gray-800 bg-gray-900/50 text-gray-200 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{ws.name}</span>
                {ws.color && (
                  <span
                    className="h-2 w-2 rounded-full ml-2 shrink-0"
                    style={{ backgroundColor: ws.color }}
                  />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
