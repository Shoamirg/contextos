import React from 'react';
import { useWorkspaceStore } from '@/features/workspace/workspaceStore';
import { useCategoryStore } from '@/features/category/categoryStore';
import { db } from '@/storage/database';
import { useLiveQuery } from 'dexie-react-hooks';

interface SidebarProps {
  workspaces: any[];
  categories: any[];
}

export function Sidebar({ workspaces, categories }: SidebarProps) {
  const ws = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>ContextOS</h1>
      </div>
      <nav>
        <button
          className={`nav-item ${activeWorkspaceId === null ? 'active' : ''}`}
          onClick={() => setActiveWorkspace(null)}
        >
          All Resources
        </button>
        {ws.map((w) => (
          <button
            key={w.id}
            className={`nav-item ${activeWorkspaceId === w.id ? 'active' : ''}`}
            onClick={() => setActiveWorkspace(w.id)}
          >
            <span
              className="workspace-dot"
              style={{ backgroundColor: w.color || '#888' }}
            />
            {w.name}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <small>V1 Alpha</small>
      </div>
    </aside>
  );
}
