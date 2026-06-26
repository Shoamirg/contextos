# ContextOS Roadmap

## V1 Alpha (Current)
- [x] Chrome collector (tabs, titles, URLs, favicons)
- [x] Workspaces (create, rename, archive, delete)
- [x] Categories
- [x] Resources (central, deduped)
- [x] Sessions (save/restore) — MVP validated
- [x] Dashboard (stats, workspaces, duplicates, stale)
- [x] Analytics
- [x] Export / Import with Zod validation
- [x] Stale detection
- [x] Command Bus (typed commands, handlers, middleware)
- [x] Event Bus (typed domain events)
- [x] Observability (logger, log viewer, ring buffer)
- [x] Error Recovery (retry, transactional import)
- [x] Command Palette (Ctrl+K)
- [x] Build scaffolding (Plasmo, Manifest V3)
- [x] Branching (main, develop, release/)
- [x] Validation suite (5 scripts)

## V1.0 — Alpha Freeze
**Target**: `v1.0.0-alpha.1`

- [ ] `npm install`, `tsc --noEmit`, `lint`, `test`, `build` green locally
- [ ] Manual QA (tabs, workspaces, sessions, DnD, import/export, restart)
- [ ] `ARCHITECTURE.md` and `ROADMAP.md`
- [ ] Git tag `v1.0.0-alpha.1`
- [ ] `RELEASE_NOTES.html` populated

## V1.1 — Collector Registry & History
- [ ] Collector Registry (`register(new ChromeCollector())`)
- [ ] Collector Manager (start/stop/reconnect)
- [ ] Command History (record every successful command)
- [ ] UndoManager / RedoManager
- [ ] Plugin manifest format

## V2 — Intelligence
- [ ] Graph Engine (nodes, edges, relationships)
- [ ] React Flow visualization
- [ ] Semantic search (local embeddings or TF-IDF fallback)
- [ ] Context-aware recommendations
- [ ] Resource links and tags graph

## V3 — AI & Sync (Planned)
- [ ] Local LLM / embedding integration
- [ ] Knowledge graph queries
- [ ] Multi-device sync (optional, opt-in)
- [ ] AI-assisted session recovery
- [ ] Third-party collector plugins
