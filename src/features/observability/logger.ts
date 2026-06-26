import type { LogEntry, LogLevel, LogModule } from './types';

const MAX_RING = 300;
const ring: LogEntry[] = [];
let sink: ((entry: LogEntry) => void) | null = null;

export function setSink(fn: (entry: LogEntry) => void) {
  sink = fn;
}

export function clearSink() {
  sink = null;
}

export function log(
  level: LogLevel,
  module: LogModule,
  message: string,
  error?: unknown,
  meta?: Record<string, unknown>
) {
  const entry: LogEntry = {
    id: 'log-' + Math.random().toString(36).slice(2) + '-' + Date.now(),
    timestamp: Date.now(),
    level,
    module,
    message,
    error: error
      ? {
          name: (error as Error)?.name,
          message: (error as Error)?.message,
          stack: (error as Error)?.stack,
        }
      : undefined,
    meta,
  };

  ring.push(entry);
  if (ring.length > MAX_RING) ring.shift();

  if (sink) {
    try {
      sink(entry);
    } catch {
      // never throw from logger
    }
  }
}

export function getRecent() {
  return [...ring];
}

export const logger = {
  debug: (module: LogModule, message: string, meta?: Record<string, unknown>) =>
    log(LogLevel.DEBUG, module, message, undefined, meta),
  info: (module: LogModule, message: string, meta?: Record<string, unknown>) =>
    log(LogLevel.INFO, module, message, undefined, meta),
  warn: (module: LogModule, message: string, meta?: Record<string, unknown>) =>
    log(LogLevel.WARN, module, message, undefined, meta),
  error: (module: LogModule, error: unknown, message?: string, meta?: Record<string, unknown>) =>
    log(LogLevel.ERROR, module, message ?? (error as Error)?.message ?? 'Unknown error', error, meta),
};
