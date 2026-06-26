import { db } from '@storage/database';
import type { Session, SessionResource } from '@types/index';
import { captureSession, restoreSession, listSessions, getSession, deleteSession } from '../workers/background';

export async function createSession(
  workspaceId: string,
  name?: string
): Promise<Session> {
  return captureSession(workspaceId, name);
}

export async function getSessions(workspaceId: string): Promise<Session[]> {
  return listSessions(workspaceId);
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  return getSession(id);
}

export async function removeSession(id: string): Promise<void> {
  await deleteSession(id);
}

export async function reopenSession(session: Session): Promise<void> {
  await restoreSession(session);
}

export async function updateSessionName(id: string, name: string): Promise<void> {
  await db.sessions.update(id, { name, updatedAt: Date.now() });
}
