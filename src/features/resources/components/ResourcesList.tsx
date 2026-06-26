'use client';

import React from 'react';
import type { Resource } from '@types/index';

export function ResourcesList({ resources }: { resources: Resource[] }) {
  if (!resources || resources.length === 0) {
    return (
      <div className="text-xs text-gray-500 mt-2">
        No resources in this workspace.
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-400 mb-1">
        Resources ({resources.length})
      </div>
      <div className="space-y-1 max-h-60 overflow-auto pr-1">
        {resources.map((r) => (
          <div
            key={r.id}
            className="flex items-start gap-2 rounded border border-gray-800 bg-gray-900/50 px-2 py-1.5 text-sm"
          >
            <div className="mt-0.5 h-4 w-4 rounded-full border border-gray-700 bg-gray-800 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-gray-100">{r.title}</div>
              {r.url && (
                <div className="truncate text-xs text-gray-500">{r.url}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
