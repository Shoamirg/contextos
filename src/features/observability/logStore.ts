import { db } from '@storage/database';
import type { LogEntry, LogLevel } from './types';

const STORE = 'logEntries';

export async function persistLog(entry: LogEntry) {
  try {
    await db.open();
    const tx = db.transaction(STORE, 'readwrite');
    tx.store.put(entry);
  } catch {
    // ignore persistence failures; logger must never throw
  }
}

export async function loadRecentLogs(limit = 200) {
  try {
    await db.open();
    const all = await db[STORE].toArray();
    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function clearLogs() {
  try {
    await db.open();
    await db[STORE].clear();
  } catch {
    // ignore
  }
}
