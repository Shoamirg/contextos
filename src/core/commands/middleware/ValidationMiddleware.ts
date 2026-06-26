import { z } from 'zod';
import { commandBus, type Command } from '../CommandBus';

export const ValidationMiddleware = {
  async execute<T extends Command>(
    command: T,
    next: (command: T) => Promise<{ success: boolean; data?: unknown; error?: string }>
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const schema = schemaFor(command.type);
    if (!schema) return next(command);

    const parsed = schema.safeParse(command.payload);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }
    return next({ ...command, payload: parsed.data } as T);
  },
};

function schemaFor(type: string) {
  switch (type) {
    case 'workspace.create':
      return z.object({ name: z.string().min(1).max(120), description: z.string().optional(), color: z.string().optional() });
    case 'workspace.rename':
      return z.object({ workspaceId: z.string().min(1), name: z.string().min(1).max(120) });
    case 'workspace.archive':
      return z.object({ workspaceId: z.string().min(1), archived: z.boolean() });
    case 'workspace.delete':
      return z.object({ workspaceId: z.string().min(1) });
    case 'resource.move':
      return z.object({ resourceId: z.string().min(1), workspaceId: z.string().optional().nullable(), categoryId: z.string().optional().nullable() });
    case 'category.assign':
      return z.object({ resourceId: z.string().min(1), categoryId: z.string().optional().nullable() });
    case 'session.save':
      return z.object({ workspaceId: z.string().min(1), name: z.string().min(1), resourceIds: z.array(z.string().min(1)) });
    case 'session.restore':
      return z.object({ sessionId: z.string().min(1) });
    case 'session.delete':
      return z.object({ sessionId: z.string().min(1) });
    case 'export.workspace':
      return z.object({ workspaceId: z.string().min(1) });
    case 'export.all':
      return z.object({});
    case 'import.workspace':
      return z.object({ json: z.string().min(1) });
    default:
      return null;
  }
}
