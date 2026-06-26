# ContextOS Compatibility Report

## Environment

| Component | Version | Status |
|-----------|---------|--------|
| Node.js | v24.13.1 | ⚠️ Not officially supported yet |
| npm | bundled with Node 24 | ✅ Compatible |
| OS | Windows 10 | ✅ Supported |

## Dependency Matrix

| Package | Current | Recommended | Notes |
|---------|---------|-------------|-------|
| React | 18.2.0 | 18.2.0 | ✅ Stable |
| TypeScript | 5.4.2 | 5.5.0 | Update for better Node 22+ lib support |
| Plasmo | 0.86.0 | 0.86.0 or 0.88.0+ | Pin or update to fix @parcel/watcher |
| Vite | *transitive* | *Plasmo-managed* | Not a direct concern |
| Parcel / @parcel/watcher | *transitive* | Force 2.5.x via overrides | Prebuilt binaries for Node 22 |
| Vitest | 1.4.0 | 1.5.0+ | Bug fixes |
| ESLint | 8.57.0 | 8.57.0 | ✅ Last v8 release |
| Tailwind | 3.4.1 | 3.4.1 | ✅ Stable |

## Node Version Recommendation

**Use Node 22 LTS.**

Node 24 is too new for the current native module ecosystem:
- `@parcel/watcher` prebuilt binaries are not yet published for Node 24 ABI
- Many `node-gyp`-based packages lack Node 24 build configs
- This causes silent fallback to source compilation, which then fails on Windows due to missing build tools

Node 22 LTS has first-class prebuilt support across the entire dependency tree.

## Root Cause: @parcel/watcher

`@parcel/watcher` is a transitive dependency of Plasmo (via Parcel). The installed version either:
1. Does not have prebuilt binaries for Node 24 ABIs
2. Falls back to `node-gyp rebuild` when prebuilt is missing
3. Contains no `binding.gyp` in the published tarball (it ships prebuilts only)
4. Crashes with: `gyp: binding.gyp not found`

## Fix Strategy

1. **Engines field**: restrict Node to `>=18 <24` (documents the supported range)
2. **Overrides**: force `@parcel/watcher` to 2.5.x, which ships prebuilts for Node 18/20/22
3. **npm config**: fallback retries and timeouts via `.npmrc`
4. **Plasmo**: keep at 0.86.0 (stable) or update to 0.88.0+ if Node 24 support is needed

## Required User Action

Downgrade to Node 22 LTS, OR wait for `@parcel/watcher` 3.x / Plasmo update with Node 24 prebuilts.

No application code changes are required to fix this.
