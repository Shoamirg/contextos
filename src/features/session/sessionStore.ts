import { create } from 'zustand';
import type { Session } from '@types/index';
import { commandBus } from '@/core/commands/CommandBus';
import type { SaveSessionCommand, RestoreSessionCommand, DeleteSessionCommand } from '@/core/commands';

interface SessionState {
  items: Session[];
  selectedSessionId: string | null;
  setSelectedSession: (id: string | null) => void;
  loadSessions: (workspaceId: string) => Promise<void>;
  saveCurrent: (workspaceId: string, name?: string) => Promise<Session>;
  restore: (sessionId: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  items: [],
  selectedSessionId: null,
  setSelectedSession: (id) => set({ selectedSessionId: id }),
  loadSessions: async (workspaceId) => {
    const { getSessions } = await import('./repository');
    const items = await getSessions(workspaceId);
    set({ items });
  },
  saveCurrent: async (workspaceId, name) => {
    const resourceIds: string[] = [];
    const result = await commandBus.dispatch(
      new SaveSessionCommand({ workspaceId, name: name ?? 'Session', resourceIds })
    );
    if (!result.success || !result.data) throw new Error(result.error || 'Failed to save session');
    const session = result.data as Session;
    set((state) => ({ items: [session, ...state.items] }));
    return session;
  },
  restore: async (sessionId) => {
    const result = await commandBus.dispatch(
      new RestoreSessionCommand({ sessionId })
    );
    if (!result.success) throw new Error(result.error || 'Failed to restore session');
  },
  remove: async (id) => {
    const result = await commandBus.dispatch(
      new DeleteSessionCommand({ sessionId: id })
    );
    if (!result.success) throw new Error(result.error || 'Failed to delete session');
    set((state) => ({ items: state.items.filter((s) => s.id !== id) }));
  },
  rename: async (id, name) => {
    const { updateSessionName } = await import('./repository');
    await updateSessionName(id, name);
    set((state) => ({
      items: state.items.map((s) => (s.id === id ? { ...s, name, updatedAt: Date.now() } : s)),
    }));
  },
}));
