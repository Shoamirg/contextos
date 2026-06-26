export const EVENTS = {
  RESOURCE_CREATED: 'RESOURCE_CREATED',
  RESOURCE_UPDATED: 'RESOURCE_UPDATED',
  RESOURCE_MOVED: 'RESOURCE_MOVED',
  CATEGORY_ASSIGNED: 'CATEGORY_ASSIGNED',
  WORKSPACE_CREATED: 'WORKSPACE_CREATED',
  WORKSPACE_UPDATED: 'WORKSPACE_UPDATED',
  WORKSPACE_ARCHIVED: 'WORKSPACE_ARCHIVED',
  SESSION_SAVED: 'SESSION_SAVED',
  SESSION_RESTORED: 'SESSION_RESTORED',
  HEALTH_CHECK_COMPLETED: 'HEALTH_CHECK_COMPLETED',
  BACKUP_CREATED: 'BACKUP_CREATED',
  IMPORT_COMPLETED: 'IMPORT_COMPLETED',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export interface EventPayloadMap {
  [EVENTS.RESOURCE_CREATED]: { resource: any };
  [EVENTS.RESOURCE_UPDATED]: { resource: any; changes: Partial<any> };
  [EVENTS.RESOURCE_MOVED]: { resourceId: string; fromCategoryId?: string | null; toCategoryId?: string | null };
  [EVENTS.CATEGORY_ASSIGNED]: { resourceId: string; categoryId: string | null };
  [EVENTS.WORKSPACE_CREATED]: { workspace: any };
  [EVENTS.WORKSPACE_UPDATED]: { workspace: any; changes: Partial<any> };
  [EVENTS.WORKSPACE_ARCHIVED]: { workspaceId: string };
  [EVENTS.SESSION_SAVED]: { session: any };
  [EVENTS.SESSION_RESTORED]: { session: any };
  [EVENTS.HEALTH_CHECK_COMPLETED]: { resourceId: string; status: any };
  [EVENTS.BACKUP_CREATED]: { fileName: string };
  [EVENTS.IMPORT_COMPLETED]: { payload: any };
}

export type Event<TName extends EventName = EventName> = {
  name: TName;
  payload: EventPayloadMap[TName];
  timestamp: number;
};

type Listener<TName extends EventName> = (payload: EventPayloadMap[TName]) => void | Promise<void>;

class EventBusImpl {
  private listeners = new Map<EventName, Set<(...args: any[]) => void | Promise<void>>>();

  on<TName extends EventName>(name: TName, fn: Listener<TName>) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, new Set());
    }
    this.listeners.get(name)!.add(fn as (...args: any[]) => void | Promise<void>);
    return () => this.off(name, fn as (...args: any[]) => void | Promise<void>);
  }

  off<TName extends EventName>(name: TName, fn: (...args: any[]) => void | Promise<void>) {
    this.listeners.get(name)?.delete(fn);
  }

  async emit<TName extends EventName>(name: TName, payload: EventPayloadMap[TName]) {
    const event = { name, payload, timestamp: Date.now() } as Event<TName>;
    const fns = this.listeners.get(name);
    if (fns) {
      await Promise.allSettled(
        [...fns].map((fn) => Promise.resolve(fn(payload)))
      );
    }
    return event;
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBusImpl();
