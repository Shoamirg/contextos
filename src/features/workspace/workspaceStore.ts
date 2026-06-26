import { create } from 'zustand';
import type { Workspace } from '@types/index';
import { commandBus } from '@/core/commands/CommandBus';
import type { CreateWorkspaceCommand, RenameWorkspaceCommand, ArchiveWorkspaceCommand, DeleteWorkspaceCommand } from '@/core/commands';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setWorkspaces: (items: Workspace[]) => void;
  addWorkspace: (name: string, description?: string, color?: string) => Promise<Workspace>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  archiveWorkspace: (id: string, archived?: boolean) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setActiveWorkspace: (id: string | null) => void;
  hydrate: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  setWorkspaces: (items) => set({ workspaces: items }),
  addWorkspace: async (name, description, color) => {
    const result = await commandBus.dispatch(
      new CreateWorkspaceCommand({ name, description, color })
    );
    if (!result.success || !result.data) throw new Error(result.error || 'Failed to create workspace');
    set((state) => ({ workspaces: [...state.workspaces, result.data as Workspace] }));
    return result.data as Workspace;
  },
  renameWorkspace: async (id, name) => {
    const result = await commandBus.dispatch(
      new RenameWorkspaceCommand({ workspaceId: id, name })
    );
    if (!result.success) throw new Error(result.error || 'Failed to rename workspace');
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, name, updatedAt: Date.now() } : w
      ),
    }));
  },
  archiveWorkspace: async (id, archived = true) => {
    const result = await commandBus.dispatch(
      new ArchiveWorkspaceCommand({ workspaceId: id, archived })
    );
    if (!result.success) throw new Error(result.error || 'Failed to archive workspace');
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, archived, updatedAt: Date.now() } : w
      ),
    }));
  },
  deleteWorkspace: async (id) => {
    const result = await commandBus.dispatch(
      new DeleteWorkspaceCommand({ workspaceId: id })
    );
    if (!result.success) throw new Error(result.error || 'Failed to delete workspace');
    set((state) => ({ workspaces: state.workspaces.filter((w) => w.id !== id) }));
  },
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  hydrate: async () => {
    const { listWorkspaces } = await import('../workspace/repository');
    const items = await listWorkspaces();
    set({ workspaces: items });
  },
}));
