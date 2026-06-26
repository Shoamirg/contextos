import React from 'react';

export function Badge({ children, color }: any) {
  return <span className="badge" style={{ borderColor: color || '#888' }}>{children}</span>;
}
