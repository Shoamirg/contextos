'use client';

import React from 'react';
import type { Session } from '@types/index';

const fmt = (ts: number) =>
  new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function SessionsList({ resources }: { resources: Session[] }) {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-gray-800 pt-2">
      <div className="text-xs text-gray-400 mb-1">
        Sessions ({resources.length})
      </div>
      <div className="space-y-1 max-h-40 overflow-auto pr-1">
        {resources.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded border border-gray-800 bg-gray-900/50 px-2 py-1.5 text-xs"
          >
            <div className="truncate text-gray-200">{s.name}</div>
            <div className="text-gray-500 shrink-0 ml-2">
              {fmt(s.updatedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
