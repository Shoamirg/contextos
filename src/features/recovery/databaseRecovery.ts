import Dexie from 'dexie';
import { logger, LogLevel, LogModule } from '../observability/logger';

export async function initializeDatabase(): Promise<Dexie | null> {
  try {
    const { db } = await import('@storage/database');
    await db.open();
    logger.info('database', 'IndexedDB initialized successfully');
    return db;
  } catch (error) {
    logger.error('database', error, 'IndexedDB initialization failed');
    return null;
  }
}

export function handleDatabaseError(error: any): 'recover' | 'reset' | 'fatal' {
  if (!error || !error.name) return 'fatal';
  if (error.name === 'InvalidStateError' || error.name === 'QuotaExceededError') return 'reset';
  if (error.name === 'VersionChangeError') return 'recover';
  return 'fatal';
}
