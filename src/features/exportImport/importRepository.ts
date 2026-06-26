import { db } from '@storage/database';
import { ExportPayloadSchema, type ExportPayload } from '@config/schemas';

export async function importPayload(json: string): Promise<ExportPayload> {
  const parsed = JSON.parse(json) as unknown;
  const payload = ExportPayloadSchema.parse(parsed);

  // Future migration hook can go here once schema versions diverge.
  if (payload.version !== '1.0') {
    throw new Error(`Unsupported export version: ${payload.version}`);
  }

  // Upsert to preserve existing IDs.
  for (const ws of payload.workspaces) {
    await db.workspaces.put(ws);
  }
  for (const cat of payload.categories) {
    await db.categories.put(cat);
  }
  for (const res of payload.resources) {
    await db.resources.put(res);
  }
  for (const sess of payload.sessions) {
    await db.sessions.put(sess);
  }

  return payload;
}

export async function importFile() {
  // Upload handled in UI layer; this module accepts parsed JSON only.
  return {
    importPayload,
  };
}
