import React from 'react';

export function Button({ children, onClick, variant = 'default' }: any) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
