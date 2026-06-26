import './globals.css';
import { createRoot } from 'react-dom/client';
import { AppLayout } from '@/app/AppLayout';

export function bootstrap() {
  const el = document.getElementById('root');
  if (!el) return;
  createRoot(el).render(<AppLayout />);
}

if (typeof window !== 'undefined') {
  bootstrap();
}
