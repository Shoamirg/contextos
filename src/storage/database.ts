import Dexie, { type Table } from 'dexie';
import type {
  Resource,
  Workspace,
  Category,
  Session,
  GraphNode,
  GraphEdge,
} from '@types/index';

export class ContextOSDatabase extends Dexie {
  resources!: Table<Resource, string>;
  workspaces!: Table<Workspace, string>;
  categories!: Table<Category, string>;
  sessions!: Table<Session, string>;
  graphNodes!: Table<GraphNode, string>;
  graphEdges!: Table<GraphEdge, [string, string, string]>;

  constructor() {
    super('contextos-db');
    this.version(2).stores({
      resources: 'resourceId, type, workspaceId, categoryId, createdAt, updatedAt, lastOpenedAt, url',
      workspaces: 'id, createdAt, updatedAt, archived',
      categories: 'id, workspaceId, order',
      sessions: 'id, workspaceId, createdAt, updatedAt, version',
      graphNodes: 'id, type',
      graphEdges: 'source, target, relation',
    });
  }
}

export const db = new ContextOSDatabase();

// Prepare future migration hooks.
// Current schema: v1 = base tables, v2 = dexie-react-hooks friendly indexes.
// Future: db.version(3).stores({ ... }) here.
/usr/bin/bash: line 6: C:/Users/User/AppData/Local/hermes/cache/terminal/hermes-cwd-b104fe3aee14.txt: Device or resource busy
