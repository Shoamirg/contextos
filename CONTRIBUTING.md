# Contributing

Thanks for your interest in contributing to ContextOS.

## Setup

```bash
npm install
```

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

## Layout

```
src/
  collectors/
  config/
  features/
  hooks/
  storage/
  types/
  utils/
  workers/
```

Keep changes scoped. Avoid adding new dependencies without discussion.
