import { useSessionStore } from '@/features/session/sessionStore';

export function Sessions() {
  const items = useSessionStore((s) => s.items);

  return (
    <div className="sessions-page">
      <h2>Sessions</h2>
      <div className="sessions-list">
        {items.length === 0 && <p className="empty">No sessions saved yet.</p>}
        {items.map((s) => (
          <div key={s.id} className="session-card">
            <div className="session-name">{s.name}</div>
            <div className="session-meta">{s.resourceIds.length} resources</div>
          </div>
        ))}
      </div>
    </div>
  );
}
