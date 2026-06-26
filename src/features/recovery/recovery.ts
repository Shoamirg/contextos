import { db } from '@storage/database';
import { eventBus, EVENTS } from '../features/events/eventBus';

export async function safeDbOperation<T>(operation: () => Promise<T>, label: string): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`DB Operation [${label}] failed:`, error);
    return null;
  }
}

export async function withRetry<T>(
  op: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 500,
  label = 'retry'
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await op();
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error(`[${label}] all ${maxAttempts} attempts failed:`, error);
        return null;
      }
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  return null;
}

export async function transactionalImport(payload: any) {
  // Pre-validate
  const { ExportPayloadSchema } = await import('@config/schemas');
  const parsed = ExportPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Import validation failed: ${parsed.error.message}`);
  }

  const data = parsed.data;
  try {
    await db.transaction('rw', db.workspaces, db.categories, db.resources, db.sessions, async () => {
      for (const ws of data.workspaces) await db.workspaces.put(ws);
      for (const cat of data.categories) await db.categories.put(cat);
      for (const res of data.resources) await db.resources.put(res);
      for (const sess of data.sessions) await db.sessions.put(sess);
    });

    await eventBus.emit(EVENTS.IMPORT_COMPLETED, { payload: data });
    return data;
  } catch (error) {
    // Rollback handled by Dexie transaction abort; just rethrow.
    throw error;
  }
}
