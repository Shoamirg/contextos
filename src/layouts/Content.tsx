import { Dashboard } from '@/pages/Dashboard';
import { Search } from '@/pages/Search';
import { useSearchStore } from '@/features/resources/resourceStore';

export function Content() {
  const q = useSearchStore((s) => s.searchQuery);
  if (q) return <Search />;
  return <Dashboard />;
}
