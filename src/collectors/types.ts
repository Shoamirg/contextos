import type { Resource } from '@types/index';

export interface ResourceCollector {
  id: string;
  name: string;

  connect(): Promise<void>;
  sync(): Promise<Resource[]>;
  disconnect(): Promise<void>;
}

export interface CollectorCapability {
  tabs: boolean;
  windows: boolean;
  history: boolean;
  bookmarks: boolean;
}

export const DEFAULT_CAPABILITIES: CollectorCapability = {
  tabs: true,
  windows: false,
  history: false,
  bookmarks: false,
};
