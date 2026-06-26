#!/usr/bin/env bash
# ContextOS release validation checklist
# Run from project root

set -euo pipefail

echo '== Git status =='
git status --short

echo '== Branch =='
git branch --show-current

echo '== Node =='
node -v

echo '== npm install (may timeout in restricted shells) =='
if npm install --registry=https://registry.npmmirror.com; then
  echo 'npm install: OK'
else
  echo 'npm install: TIMEOUT or FAILED — run manually on your machine'
  exit 1
fi

echo '== TypeScript =='
npx tsc --noEmit

echo '== Lint =='
npm run lint

echo '== Test =='
npm run test

echo '== Build =='
npm run build

echo '== All release checks passed =='
