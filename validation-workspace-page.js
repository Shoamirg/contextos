/**
 * Workspace page validation
 * Run: node validation-workspace-page.js
 */

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

import * as fs from 'fs';

const src = fs.readFileSync('src/pages/Workspace/index.tsx', 'utf8');
assert(src.includes('workspace-grid'), 'Workspace page should render grid');
assert(src.includes('resource-card'), 'Workspace page should render resource cards');
assert(src.includes('workspace-header'), 'Workspace page should have header');

const actions = fs.readFileSync('src/features/workspace/workspaceStore.ts', 'utf8');
assert(actions.includes('commandBus.dispatch'), 'Workspace actions should dispatche commands');

console.log('Workspace page validations passed');
