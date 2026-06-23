import { useCallback, useState } from 'react';

export function useListDragReorder(onMove: (fromIndex: number, toIndex: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const clearDrag = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const getHandleProps = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    },
    onDragEnd: clearDrag,
  });

  const getItemProps = (index: number) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (overIndex !== index) setOverIndex(index);
    },
    onDragLeave: () => {
      if (overIndex === index) setOverIndex(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIndex ?? Number(e.dataTransfer.getData('text/plain'));
      if (!Number.isNaN(from) && from !== index) onMove(from, index);
      clearDrag();
    },
  });

  const itemClassName = (index: number, base = '') =>
    [base, dragIndex === index ? 'dragging' : '', overIndex === index ? 'drag-over' : '']
      .filter(Boolean)
      .join(' ');

  return { dragIndex, getHandleProps, getItemProps, itemClassName, clearDrag };
}
