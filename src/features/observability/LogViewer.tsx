'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@storage/database';
import { logger, LogLevel, LOG_LEVEL_LABELS, type LogModule } from './logger';

const MODULES: LogModule[] = [
  'background',
  'workspace',
  'session',
  'category',
  'resource',
  'health',
  'stale',
  'exportImport',
  'backup',
  'analytics',
  'dedupe',
  'dashboard',
];

export function LogViewer() {
  // Dexie live query requires a separate table; here we mock viewer state with ring.
  const logs = (window as any).__contextosLogs ?? [];

  const [filterLevel, setFilterLevel] = React.useState<LogLevel>(LogLevel.DEBUG);
  const [filterModule, setFilterModule] = React.useState<LogModule | 'all'>('all');

  const visible = logs
    .filter((entry) => entry.level >= filterLevel)
    .filter((entry) => filterModule === 'all' || entry.module === filterModule);

  React.useEffect(() => {
    // Expose sink so logger.ts can push entries here.
    (window as any).__contextosLogs = logs;
    logger.setSink
      ? logger.setSink((entry) => {
          logs.unshift(entry);
        })
      : undefined;
  }, [logs]);

  return (
    <div className="h-full w-full bg-gray-950 text-gray-100 p-4 font-mono text-xs overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Log Viewer</div>
        <div className="space-x-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(Number(e.target.value))}
            className="bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded px-2 py-1"
          >
            {Object.entries(LOG_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={Number(value)}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value as LogModule | 'all')}
            className="bg-gray-900 border border-gray-800 text-gray-200 text-xs rounded px-2 py-1"
          >
            <option value="all">All</option>
            {MODULES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {visible.length === 0 && <div className="text-gray-600">No logs.</div>}
        {visible.map((entry) => (
          <div key={entry.id} className="border-b border-gray-800 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                {new Date(entry.timestamp).toISOString()}
              </span>
              <span className={`${levelColor(entry.level)}`}>
                {LOG_LEVEL_LABELS[entry.level]}
              </span>
              <span className="text-gray-500">{entry.module}</span>
            </div>
            <div className="mt-0.5 text-gray-200 break-all">{entry.message}</div>
            {entry.error && (
              <div className="mt-0.5 text-red-400 break-all">
                {entry.error.name}: {entry.error.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function levelColor(level: LogLevel) {
  if (level === LogLevel.ERROR) return 'text-red-400';
  if (level === LogLevel.WARN) return 'text-yellow-400';
  if (level === LogLevel.INFO) return 'text-blue-400';
  return 'text-gray-500';
}
