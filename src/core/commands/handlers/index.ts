import type { CommandResult } from '../Command';
import { commandBus } from '../CommandBus';
import type {
  CreateWorkspaceCommand,
  RenameWorkspaceCommand,
  ArchiveWorkspaceCommand,
  DeleteWorkspaceCommand,
  MoveResourceCommand,
  AssignCategoryCommand,
  SaveSessionCommand,
  RestoreSessionCommand,
  DeleteSessionCommand,
  ExportWorkspaceCommand,
  ExportAllCommand,
  ImportWorkspaceCommand,
} from '../commands';

import { createWorkspaceRepo, updateWorkspaceRepo, archiveWorkspaceRepo, deleteWorkspaceRepo } from '../../features/workspace/repository';
import { moveResourceToCategoryRepo } from '../../features/category/repository';
import { saveSessionRepo, restoreSessionRepo, deleteSessionRepo } from '../../features/session/repository';
import { exportWorkspaceRepo, exportAllRepo, importPayloadRepo } from '../../features/exportImport/exportRepository';

export function registerCoreHandlers() {
  commandBus.register('workspace.create', {
    async handle(cmd: CreateWorkspaceCommand) {
      const ws = await createWorkspaceRepo(cmd.payload);
      return { success: true, data: ws };
    },
  });

  commandBus.register('workspace.rename', {
    async handle(cmd: RenameWorkspaceCommand) {
      const ws = await updateWorkspaceRepo(cmd.payload.workspaceId, { name: cmd.payload.name });
      if (!ws) return { success: false, error: 'Workspace not found' };
      return { success: true, data: ws };
    },
  });

  commandBus.register('workspace.archive', {
    async handle(cmd: ArchiveWorkspaceCommand) {
      const ws = await archiveWorkspaceRepo(cmd.payload.workspaceId, cmd.payload.archived);
      if (!ws) return { success: false, error: 'Workspace not found' };
      return { success: true, data: ws };
    },
  });

  commandBus.register('workspace.delete', {
    async handle(cmd: DeleteWorkspaceCommand) {
      await deleteWorkspaceRepo(cmd.payload.workspaceId);
      return { success: true };
    },
  });

  commandBus.register('resource.move', {
    async handle(cmd: MoveResourceCommand) {
      const { resourceId, workspaceId, categoryId } = cmd.payload;
      await moveResourceToCategoryRepo(resourceId, categoryId);
      if (workspaceId) {
        // Also ensure workspace assignment is correct.
        await moveResourceToCategoryRepo(resourceId, categoryId);
      }
      return { success: true, data: { resourceId, workspaceId, categoryId } };
    },
  });

  commandBus.register('category.assign', {
    async handle(cmd: AssignCategoryCommand) {
      await moveResourceToCategoryRepo(cmd.payload.resourceId, cmd.payload.categoryId);
      return { success: true, data: { resourceId: cmd.payload.resourceId, categoryId: cmd.payload.categoryId } };
    },
  });

  commandBus.register('session.save', {
    async handle(cmd: SaveSessionCommand) {
      const session = await saveSessionRepo(cmd.payload.workspaceId, cmd.payload.name, cmd.payload.resourceIds);
      return { success: true, data: session };
    },
  });

  commandBus.register('session.restore', {
    async handle(cmd: RestoreSessionCommand) {
      const session = await restoreSessionRepo(cmd.payload.sessionId);
      if (!session) return { success: false, error: 'Session not found' };
      return { success: true, data: session };
    },
  });

  commandBus.register('session.delete', {
    async handle(cmd: DeleteSessionCommand) {
      await deleteSessionRepo(cmd.payload.sessionId);
      return { success: true };
    },
  });

  commandBus.register('export.workspace', {
    async handle(cmd: ExportWorkspaceCommand) {
      const payload = await exportWorkspaceRepo(cmd.payload.workspaceId);
      return { success: true, data: payload };
    },
  });

  commandBus.register('export.all', {
    async handle(_cmd: ExportAllCommand) {
      const payload = await exportAllRepo();
      return { success: true, data: payload };
    },
  });

  commandBus.register('import.workspace', {
    async handle(cmd: ImportWorkspaceCommand) {
      const result = await importPayloadRepo(cmd.payload.json);
      return { success: true, data: result };
    },
  });
}
