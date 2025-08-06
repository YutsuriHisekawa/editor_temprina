// Add drag and drop styles
export const createDragAndDropStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .drop-zone {
      transition: all 0.2s ease;
    }

    .drop-zone.drag-over::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(239, 68, 68, 0.1); /* merah muda transparan */
      border: 2px dashed #ef4444; /* merah solid */
      pointer-events: none;
      z-index: 50;
    }

    .drop-zone.drag-over::after {
      content: '📄 Mungkin file ini bisa menyelamatkan dunia. Drop aja dulu.';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(239, 68, 68, 0.9); /* merah tua transparan */
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1.125rem;
      font-weight: 500;
      pointer-events: none;
      z-index: 51;
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.05); }
    }

    body.dragging-file .draggable-file {
      opacity: 0.5;
    }
  `;
  document.head.appendChild(style);
};

export const initializeDragAndDrop = (containerRef: React.RefObject<HTMLDivElement>, onFileDrop: (fileId: string) => Promise<void>) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    containerRef.current?.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    containerRef.current?.classList.remove('drag-over');
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    containerRef.current?.classList.remove('drag-over');
    
    const fileId = e.dataTransfer.getData('text/plain');
    if (!fileId) return;

    await onFileDrop(fileId);
  };

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};
