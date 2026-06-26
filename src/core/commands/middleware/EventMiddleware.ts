import { eventBus, EVENTS } from '../events/eventBus';

export const EventMiddleware = {
  async execute<T extends { type: string; payload: Record<string, unknown> }>(
    command: T,
    next: (command: T) => Promise<{ success: boolean; data?: unknown; error?: string }>
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const before = Date.now();
    const result = await next(command);
    const durationMs = Date.now() - before;

    if (result.success) {
      const eventName = mapCommandToEvent(command.type);
      if (eventName) {
        await eventBus.emit(eventName, { command, result: result.data, durationMs });
      }
    }

    return result;
  },
};

function mapCommandToEvent(type: string) {
  switch (type) {
    case 'workspace.create':
      return EVENTS.WORKSPACE_CREATED;
    case 'workspace.rename':
      return EVENTS.WORKSPACE_UPDATED;
    case 'workspace.archive':
      return EVENTS.WORKSPACE_ARCHIVED;
    case 'resource.move':
      return EVENTS.RESOURCE_MOVED;
    case 'category.assign':
      return EVENTS.CATEGORY_ASSIGNED;
    case 'session.save':
      return EVENTS.SESSION_SAVED;
    case 'session.restore':
      return EVENTS.SESSION_RESTORED;
    case 'import.workspace':
      return EVENTS.IMPORT_COMPLETED;
    default:
      return null;
  }
}
