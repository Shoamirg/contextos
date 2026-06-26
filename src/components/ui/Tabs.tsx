import { useState } from 'react';

type Tab = { id: string; label: string };

interface TabsProps {
  items: Tab[];
  defaultActiveId?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ items, defaultActiveId, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultActiveId || items[0]?.id);

  const handleClick = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className="tabs">
      {items.map((t) => (
        <button
          key={t.id}
          className={`tab ${active === t.id ? 'tab-active' : ''}`}
          onClick={() => handleClick(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
