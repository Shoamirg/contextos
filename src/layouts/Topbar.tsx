import React from 'react';
import { CommandPalette } from '@/components/command-palette/CommandPalette';

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <CommandPalette />
      </div>
      <div className="topbar-right">
        <span className="badge">alpha</span>
      </div>
    </header>
  );
}
