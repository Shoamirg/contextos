export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

export type LogModule =
  | 'background'
  | 'workspace'
  | 'session'
  | 'category'
  | 'resource'
  | 'health'
  | 'stale'
  | 'exportImport'
  | 'backup'
  | 'analytics'
  | 'dedupe'
  | 'dashboard';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  module: LogModule;
  message: string;
  error?: { name?: string; message?: string; stack?: string };
  meta?: Record<string, unknown>;
}
