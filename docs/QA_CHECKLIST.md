# ContextOS QA Checklist

Run these checks after loading the unpacked extension in Chrome.

## Installation

- [ ] Fresh install loads without errors
- [ ] Upgrade install (reload extension) preserves existing data
- [ ] No duplicate database schemas after upgrade
- [ ] Background worker activates after install

## Browser Lifecycle

- [ ] Create tab
- [ ] Close tab
- [ ] Move tab between windows
- [ ] Duplicate tab
- [ ] Multiple Chrome windows
- [ ] Tabs survive browser restart
- [ ] Extension survives browser restart
- [ ] Side panel reopens after restart
- [ ] Popup opens without errors

## Workspaces

- [ ] Create workspace
- [ ] Rename workspace
- [ ] Delete workspace
- [ ] Archive workspace
- [ ] Workspace list persists
- [ ] Empty workspace shows correctly
- [ ] Color dot renders

## Sessions

- [ ] Save session
- [ ] Restore session
- [ ] Restore same session twice
- [ ] Session survives browser restart
- [ ] Delete session
- [ ] Rename session

## Categories

- [ ] Create category
- [ ] Assign category to resource
- [ ] Drag and drop assignment
- [ ] Category survives restart

## Search

- [ ] Search returns matching resources
- [ ] Empty query shows all
- [ ] No crash on special characters
- [ ] Search clears results when empty

## Import / Export

- [ ] Export workspace produces valid JSON
- [ ] Import valid JSON succeeds
- [ ] Version mismatch rejected
- [ ] Invalid JSON rejected gracefully
- [ ] Import rollback on failure
- [ ] Large backup (100+ tabs) exports/imports correctly
- [ ] Duplicate resources not created on import

## Performance

- [ ] 100 tabs: UI responsive, no lag
- [ ] 500 tabs: scroll smooth, memory stable
- [ ] 1000 tabs: no crash, operations complete

## UI

- [ ] Sidebar renders workspaces
- [ ] Dashboard shows stats
- [ ] Command palette opens (Ctrl+K)
- [ ] Command palette closes (Esc)
- [ ] Inspector shows resource details
- [ ] Empty states render text
- [ ] Error boundaries catch crashes
- [ ] Toast notifications appear
- [ ] Keyboard navigation works

## Data Integrity

- [ ] No duplicate resources after multiple syncs
- [ ] Categories survive restart
- [ ] Sessions restore correctly
- [ ] Export → Import produces identical data
- [ ] Workspace assignments survive restart
- [ ] Tags persist

## Accessibility

- [ ] Focus visible on keyboard navigation
- [ ] ARIA labels present on interactive elements
- [ ] Color contrast meets minimums
- [ ] Screen reader can navigate layout
