import React from 'react';
import { Sidebar } from '@/layouts/Sidebar';
import { Topbar } from '@/layouts/Topbar';
import { Inspector } from '@/layouts/Inspector';
import { Content } from '@/layouts/Content';
import { useWorkspaceStore } from '@/features/workspace/workspaceStore';
import { db } from '@/storage/database';
import { useLiveQuery } from 'dexie-react-hooks';

export function AppLayout() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const resources = useLiveQuery(() => db.resources.toArray()) || [];

  return (
    <div className="app-layout">
      <Sidebar workspaces={workspaces} categories={categories} />
      <div className="main">
        <Topbar />
        <Content />
        <Inspector resources={resources} categories={categories} />
      </div>
    </div>
  );
}
