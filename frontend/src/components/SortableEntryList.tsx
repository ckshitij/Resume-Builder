import type { ReactNode } from 'react';
import { useListDragReorder } from '../hooks/useListDragReorder';
import { moveItem } from '../utils/reorder';
import { IconGrip } from './Icons';

interface Props<T extends { id: string }> {
  items: T[];
  labelPrefix: string;
  emptyHint?: ReactNode;
  onReorder: (items: T[]) => void;
  onRemove: (id: string) => void;
  renderFields: (item: T, index: number) => ReactNode;
}

export function SortableEntryList<T extends { id: string }>({
  items,
  labelPrefix,
  emptyHint,
  onReorder,
  onRemove,
  renderFields,
}: Props<T>) {
  const drag = useListDragReorder((from, to) => {
    onReorder(moveItem(items, from, to));
  });

  if (items.length === 0 && emptyHint) {
    return <>{emptyHint}</>;
  }

  return (
    <>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={drag.itemClassName(idx, 'entry-card')}
          {...drag.getItemProps(idx)}
        >
          <div className="entry-card-header">
            <div className="entry-card-title">
              <button
                type="button"
                className="drag-handle"
                aria-label={`Drag to reorder ${labelPrefix} ${idx + 1}`}
                {...drag.getHandleProps(idx)}
              >
                <IconGrip />
              </button>
              <strong>{labelPrefix} {idx + 1}</strong>
            </div>
            <button type="button" className="btn-text danger" onClick={() => onRemove(item.id)}>
              Remove
            </button>
          </div>
          {renderFields(item, idx)}
        </div>
      ))}
    </>
  );
}
