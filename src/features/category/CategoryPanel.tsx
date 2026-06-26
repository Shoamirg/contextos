'use client';

import React from 'react';
import { useCategories, useResources } from '@/hooks/useDatabaseQueries';
import { useCategoryStore } from './categoryStore';
import { useResourceStore } from '../resources/resourceStore';
import * as categoryRepo from './repository';
import type { Resource, Category } from '@types/index';

export function CategoryList({ workspaceId }: { workspaceId: string | null }) {
  const { categories, loadCategories, removeCategory } = useCategoryStore();
  const resources = useResources();
  const { selectedIds, setSelectedResource } = useResourceStore();

  React.useEffect(() => {
    if (workspaceId) {
      void loadCategories(workspaceId);
    }
  }, [workspaceId, loadCategories]);

  const items = categories;

  const handleDrop = async (categoryId: string | null) => {
    for (const id of selectedIds) {
      const res = resources.find((r) => r.resourceId === id);
      if (!res) continue;
      await categoryRepo.moveResourceToCategory(id, categoryId);
    }
    // Clear selection after move
    useResourceStore.setState({ selectedIds: [] });
  };

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-400 mb-1">Categories</div>
      <div className="space-y-1">
        <DropZone onDrop={() => handleDrop(null)} label="Uncategorized" />
        {items.map((cat: Category) => (
          <DropZone key={cat.id} onDrop={() => handleDrop(cat.id)} label={cat.name} />
        ))}
      </div>
      <SelectedCount count={selectedIds.length} />
    </div>
  );
}

function DropZone({
  onDrop,
  label,
}: {
  onDrop: () => void;
  label: string;
}) {
  const [over, setOver] = React.useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDrop();
      }}
      className={`rounded border px-2 py-1 text-xs cursor-default ${
        over ? 'border-blue-500 bg-blue-950/40' : 'border-gray-800 bg-gray-900/50'
      }`}
    >
      {label}
    </div>
  );
}

function SelectedCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="mt-2 text-xs text-gray-500">
      {count} selected — drop into a category above
    </div>
  );
}
