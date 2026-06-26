import React from 'react';

export function Card({ children, onClick, selected }: any) {
  return (
    <div
      className={`card ${selected ? 'card-selected' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
