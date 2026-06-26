import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Resource } from '@types/index';
import { useResourceStore } from '../features/resources/resourceStore';

export function ResourceItem({ resource }: { resource: Resource }) {
  const { selectedIds, toggleSelect, assignWorkspace } = useResourceStore();
  const selected = selectedIds.includes(resource.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded border px-2 py-1.5 text-sm cursor-grab active:cursor-grabbing ${
        selected
          ? 'border-blue-500 bg-blue-950/40'
          : 'border-gray-800 bg-gray-900/50'
      }`}
      {...attributes}
      {...listeners}
      onClick={() => toggleSelect(resource.id)}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-gray-100">{resource.title}</div>
        {resource.url && (
          <div className="truncate text-xs text-gray-500">{resource.url}</div>
        )}
      </div>
      <button
        className="text-xs text-gray-400 hover:text-gray-200"
        onClick={(e) => {
          e.stopPropagation();
          assignWorkspace(resource.id, null);
        }}
      >
        Clear WS
      </button>
    </div>
  );
}
