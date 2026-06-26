import { z } from 'zod';

export const ResourceSchema = z.object({
  resourceId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().optional().or(z.literal('')),
  favicon: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastOpenedAt: z.number().optional(),
  closedAt: z.number().optional(),
  workspaceId: z.string().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  chromeTabId: z.number().optional(),
  windowId: z.number().optional(),
  healthStatus: z
    .object({
      state: z.enum(['healthy', 'slow', 'offline', 'unknown']),
      lastCheckedAt: z.number(),
      responseMs: z.number().optional(),
      failureCount: z.number(),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export const WorkspaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  archived: z.boolean(),
});

export const CategorySchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  name: z.string().min(1),
  order: z.number(),
  color: z.string().optional(),
});

export const SessionResourceSchema = z.object({
  resourceId: z.string().min(1),
  chromeTabId: z.number().optional(),
  windowId: z.number().optional(),
  url: z.string().optional(),
  title: z.string().min(1),
});

export const SessionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  workspaceId: z.string().min(1),
  resources: z.array(SessionResourceSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number(),
  metadata: z
    .object({
      totalTabs: z.number().optional(),
      totalWindows: z.number().optional(),
      domains: z.array(z.string()).optional(),
    })
    .optional(),
});

export const AnalyticsSnapshotSchema = z.object({
  totalResources: z.number(),
  totalTabs: z.number(),
  totalWorkspaces: z.number(),
  totalSessions: z.number(),
  duplicateCount: z.number(),
  staleCount: z.number(),
  topDomains: z.array(z.object({ domain: z.string(), count: z.number() })),
  workspaceActivity: z.array(z.object({ workspaceId: z.string(), name: z.string(), count: z.number() })),
});

export const ExportPayloadSchema = z.object({
  version: z.literal('1.0'),
  exportedAt: z.string().datetime(),
  workspaces: z.array(WorkspaceSchema),
  categories: z.array(CategorySchema),
  resources: z.array(ResourceSchema),
  sessions: z.array(SessionSchema),
});

export type ExportPayload = z.infer<typeof ExportPayloadSchema>;
export type AnalyticsSnapshot = z.infer<typeof AnalyticsSnapshotSchema>;
