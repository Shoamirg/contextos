# ContextOS Architecture

## Overview

ContextOS is a local-first, privacy-first Chrome extension that turns your browser into a visual operating system for managing work contexts, tabs, and resources.

## System Layers

### UI Layer
- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui components
- Layouts: Sidebar, Topbar, Content, Inspector
- Pages: Dashboard, Workspace, Sessions, Analytics, Health, Backup, Settings, Search
- Command Palette (Ctrl+K)

### Core Engine
- **Command Bus**: typed command routing with middleware pipeline
- **Event Bus**: typed domain events decoupling subsystems
- **Commands**: CreateWorkspace, RenameWorkspace, ArchiveWorkspace, DeleteWorkspace, MoveResource, AssignCategory, SaveSession, RestoreSession, DeleteSession, ExportWorkspace, ExportAll, ImportWorkspace
- **Middleware**: Logging, Validation (Zod), Event emission

### Repository Layer
- Dexie (IndexedDB) persistence
- Repositories: workspaces, categories, resources, sessions, tags, healthStatus, graphNodes, graphEdges
- All mutations flow through Command Bus
- UI never calls repositories directly for mutations

### Storage
- Dexie schema with versioned migration hooks
- Indexes on: workspaceId, url, duplicateOf, resourceId, lastAccessedAt, sessionId
- Tables: workspaces, categories, resources, sessions, tags, healthStatus, graphNodes, graphEdges

### Collectors
- Chrome tab collector: stable IDs (tab-{windowId}-{tabId})
- Background worker: sync, alarms, session capture, health checks
- Collector Registry pattern for future plugins

### Observability
- Winston-style logger with ring buffer
- IndexedDB log persistence
- LogViewer component
- Error boundaries

### Recovery
- Retry logic for transient failures
- Transactional import with rollback
- IndexedDB init failure classification

## Data Flow

```
Chrome Collector
        │
        ▼
Background Worker
        │
        ▼
Command Bus
    ├── LoggingMiddleware
    ├── ValidationMiddleware
    └── EventMiddleware
        │
        ▼
Handlers
        │
        ▼
Repositories
        │
        ▼
Dexie (IndexedDB)
        │
        ▼
Zustand Stores
        │
        ▼
React UI
```

## Resource Identity

- Permanent: `resourceId` (e.g., `res_01JXYZ...`) — survives restarts, used in analytics, backup, export/import
- Runtime: `chromeTabId`, `windowId` — ephemeral metadata from Chrome

## Feature Flags

Controlled by `src/config/features.ts`:
- analytics
- staleDetection
- exportImport
- ai (V2)
- graph (V2)
- integrations (V2)

## Validation Strategy

Because `npm install` times out in restricted shells, we use standalone Node.js validation scripts:
- `stabilization-validation.js` — core identity, repo isolation, DnD assignment
- `validation-sprint-2.js` — analytics, stale detection, export/import
- `validation-commands.js` — command bus, handlers, middleware
- `validation-production.js` — observability, events, recovery, packaging
- `validation-workspace-page.js` — UI pages, components, structure

These validate data flow and file structure without requiring the bundler.
