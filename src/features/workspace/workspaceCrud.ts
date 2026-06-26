import {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  archiveWorkspace,
  listWorkspaces,
} from '@/features/workspace/repository';

export async function addWorkspace(name: string) {
  return createWorkspace({ name });
}

export async function renameWorkspace(id: string, name: string) {
  return updateWorkspace(id, { name });
}

export async function removeWorkspace(id: string) {
  return deleteWorkspace(id);
}

export async function toggleArchiveWorkspace(id: string) {
  return archiveWorkspace(id);
}

export async function loadWorkspaces() {
  return listWorkspaces();
}
