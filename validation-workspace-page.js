/**
 * UI / pages validation (dependency-free)
 * Run: node validation-workspace-page.js
 */

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

import * as fs from 'fs';
import * as path from 'path';

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

const namespaces = {
  Button: ['src/components/ui/Button.tsx'],
  Badge: ['src/components/ui/Badge.tsx'],
  Input: ['src/components/ui/Input.tsx'],
  Search: ['src/components/ui/Search.tsx'],
  Modal: ['src/components/dialogs/Modal.tsx'],
  Tabs: ['src/components/ui/Tabs.tsx'],
  Sidebar: ['src/layouts/Sidebar.tsx'],
  Topbar: ['src/layouts/Topbar.tsx'],
  Dashboard: ['src/pages/Dashboard/index.tsx'],
  Workspace: ['src/pages/Workspace/index.tsx'],
};

for (const [name, files] of Object.entries(namespaces)) {
  for (const file of files) {
    const exists = fs.existsSync(file);
    assert(exists, `Missing UI file: ${file}`);
  }
}

assert(fs.existsSync('src/app/AppLayout.tsx'), 'Missing AppLayout');
assert(fs.existsSync('src/components/command-palette/CommandPalette.tsx'), 'Missing command palette');

const palette = readFile('src/components/command-palette/CommandPalette.tsx');
assert(palette.includes('ctrlKey'), 'CommandPalette should reference Ctrl');
assert(palette.includes('metaKey'), 'CommandPalette should handle shortcuts');

const dashboard = readFile('src/pages/Dashboard/index.tsx');
assert(dashboard.includes('dashboard-hero'), 'Dashboard should have hero');
assert(dashboard.includes('stats'), 'Dashboard should contain stats');

const workspace = readFile('src/pages/Workspace/index.tsx');
assert(workspace.includes('workspace-grid'), 'Workspace should have grid');
assert(workspace.includes('resource-card'), 'Workspace should render resource cards');

console.log('UI/Pages dependency-free validation passed');
