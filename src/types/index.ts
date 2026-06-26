export type ResourceType =
  | 'browser-tab'
  | 'browser-window'
  | 'vscode-file'
  | 'github-issue'
  | 'github-pr'
  | 'github-repo'
  | 'jira-ticket'
  | 'notion-page'
  | 'google-doc'
  | 'pdf'
  | 'youtube-video'
  | 'bookmark'
  | 'slack-channel'
  | 'telegram-chat'
  | 'figma-file'
  | 'terminal-session'
  | 'ssh-session';

export interface Resource {
  resourceId: string;       // permanent ContextOS ID
  chromeTabId?: number;     // runtime browser tab ID
  windowId?: number;        // runtime browser window ID
  type: ResourceType;
  title: string;
  url?: string;
  favicon?: string;
  metadata?: Record<string, unknown>;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastOpenedAt?: number;
  closedAt?: number;
  workspaceId?: string;
  categoryId?: string;
  healthStatus?: HealthStatus;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

export interface Category {
  id: string;
  workspaceId: string;
  name: string;
  order: number;
  color?: string;
}

export interface Session {
  id: string;
  name: string;
  workspaceId: string;
  resources: SessionResource[];
  createdAt: number;
  updatedAt: number;
  version: number;
  metadata?: SessionMetadata;
}

export interface SessionResource {
  resourceId: string;
  chromeTabId?: number;
  windowId?: number;
  url?: string;
  title: string;
}

export interface SessionMetadata {
  totalTabs?: number;
  totalWindows?: number;
  domains?: string[];
}

export interface HealthStatus {
  state: 'healthy' | 'slow' | 'offline' | 'unknown';
  lastCheckedAt: number;
  responseMs?: number;
  failureCount: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: ResourceType;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: 'related_to' | 'references' | 'part_of' | 'duplicate_of' | 'depends_on';
}

export interface AnalyticsSummary {
  totalResources: number;
  openTabs: number;
  duplicates: number;
  topDomains: { domain: string; count: number }[];
}

export interface DuplicateGroup {
  canonical: Resource;
  duplicates: Resource[];
  matchType: 'exact' | 'normalized' | 'domain';
}
