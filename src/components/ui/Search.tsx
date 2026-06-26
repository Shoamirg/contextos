import { Input } from '@/components/ui/Input';

interface SearchProps {
  value?: string;
  onChange?: (v: string) => void;
  onOpen?: () => void;
}

export function Search({ value, onChange, onOpen }: SearchProps) {
  return (
    <div className="search">
      <Input
        value={value ?? ''}
        onChange={onChange ?? (() => {})}
        placeholder="Search resources..."
      />
      <kbd className="search-hint" onClick={onOpen}>⌘K</kbd>
    </div>
  );
}
