import React, { useState, useEffect, useRef, memo } from 'react';
import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DroppableStateSnapshot,
  DropResult,
  DragStart
} from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from '../atoms/Button';
import { generateFileHash } from '../../utils/fileUtils';
import { pauseAnimations, resumeAnimations, fixDragTransforms } from '../../utils/dragUtils';

interface FileItem {
  id: string;
  file: File;
}

interface FileListItemProps {
  fileItem: FileItem;
  index: number;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onRemove: (index: number) => void;
}

// Creating a memoized list item component to prevent unnecessary re-renders
const FileListItem = memo(({ fileItem, index, provided, snapshot, onRemove }: FileListItemProps) => {
  return (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={snapshot.isDragging ? 'dragging' : ''}
      style={{
        ...provided.draggableProps.style,
        transition: snapshot.isDragging ? 'none' : provided.draggableProps.style?.transition,
        zIndex: snapshot.isDragging ? 9999 : 'auto', // Ensure dragged item stays on top
        opacity: snapshot.isDragging ? 0.9 : 1,
        maxWidth: '100%',
        overflow: 'hidden',
        // Create a new stacking context when dragging
        isolation: snapshot.isDragging ? 'isolate' : 'auto',
      }}
    >
      <div className="file-item" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div 
          className="drag-handle"
          {...provided.dragHandleProps}
          title="Drag to reorder"
          style={{ flexShrink: 0, padding: '0px' }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="currentColor" strokeWidth="2">
            <path d="M8 9h8M8 12h8M8 15h8"></path>
          </svg>
        </div>
        
        <div className="file-name-container" style={{ flex: 1, minWidth: 0 }}>
          <span 
            className="file-name" 
            title={fileItem.file.name}
            style={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {fileItem.file.name}
          </span>
        </div>
        
        <Button 
          variant="danger"
          className="remove-button"
          onClick={() => onRemove(index)}
          aria-label="Remove file"
          title="Remove file"
          style={{ flexShrink: 0 }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </Button>
      </div>
    </li>
  );
});

// This function ensures stable IDs for draggable items
const ensureStableID = (fileItem: FileItem): string => {
  // If the item already has an ID, use it
  if (fileItem.id && fileItem.id.trim() !== '') {
    return fileItem.id;
  }
  
  // Otherwise generate a stable ID
  const stableId = generateFileHash(fileItem.file);
  // Update the item in place to maintain stable references
  fileItem.id = stableId;
  return stableId;
};

interface SortableFileListProps {
  files: FileItem[];
  onFilesReordered: (files: FileItem[]) => void;
  onFileRemoved: (index: number) => void;
}

const SortableFileList = ({ files, onFilesReordered, onFileRemoved }: SortableFileListProps) => {
  // Create stable reference for the files prop
  const filesRef = useRef<FileItem[]>(files);
  // This state tracks only if dragging is happening
  const [isDragging, setIsDragging] = useState(false);
  // Track when we should prevent animation flashes
  const preventAnimationRef = useRef<boolean>(false);
  // Track the currently dragged item index
  const draggedItemIndexRef = useRef<number | null>(null);
  
  // Update reference when files prop changes
  useEffect(() => {
    if (!isDragging) {
      filesRef.current = files;
    }
  }, [files, isDragging]);

  const onDragStart = (start: DragStart) => {
    setIsDragging(true);
    preventAnimationRef.current = true;
    
    // Store the index of the item being dragged
    draggedItemIndexRef.current = start.source.index;
    
    // Add a class to the document during dragging to disable animations
    document.body.classList.add('dragging-in-progress');
    
    // Also add the dragging class to the item's ID for better styling
    const itemId = start.draggableId;
    const draggableElement = document.querySelector(`[data-rbd-draggable-id="${itemId}"]`) as HTMLElement;
    if (draggableElement) {
      draggableElement.style.zIndex = '9999';
      
      // Find any parent list item
      const listItem = draggableElement.closest('li');
      if (listItem) {
        // Pause animations to prevent glitches
        pauseAnimations(listItem);
      }
    }
    
    // Fix transforms to ensure proper z-index stacking
    fixDragTransforms();
    
    // Haptic feedback for touch devices
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const onDragEnd = (result: DropResult) => {
    // First clear the dragging state
    setIsDragging(false);
    
    // Remove any class markers from the dragging operation
    document.body.classList.remove('dragging-in-progress');
    
    // Find and remove any lingering drag classes that might be causing issues
    const allDragElements = document.querySelectorAll('.dragging');
    allDragElements.forEach(el => el.classList.remove('dragging'));
    
    // We'll clear the prevention after a short delay
    setTimeout(() => {
      preventAnimationRef.current = false;
      
      // Force a refresh of all file items by clearing any transform styles
      const dragItems = document.querySelectorAll('[data-rbd-draggable-id]');
      dragItems.forEach(item => {
        const htmlItem = item as HTMLElement;
        if (htmlItem.style && htmlItem.style.transform) {
          htmlItem.style.transition = 'none';
          setTimeout(() => {
            htmlItem.style.transition = '';
          }, 50);
        }
      });
    }, 50);
    
    // Dropped outside the list - remove the file
    if (!result.destination) {
      if (draggedItemIndexRef.current !== null) {
        onFileRemoved(draggedItemIndexRef.current);
      }
      draggedItemIndexRef.current = null;
      return;
    }
    
    // If the item was dropped in the same position, do nothing
    if (result.destination.index === result.source.index) {
      draggedItemIndexRef.current = null;
      return;
    }

    try {
      // Create a copy of the files array to avoid direct modification
      const reorderedFiles = Array.from(filesRef.current);
      
      // Make sure the indices are valid
      const sourceIndex = Math.min(result.source.index, reorderedFiles.length - 1);
      
      // Move the item
      const [removed] = reorderedFiles.splice(sourceIndex, 1);
      const destIndex = Math.min(result.destination.index, reorderedFiles.length);
      reorderedFiles.splice(destIndex, 0, removed);

      // Only call the parent function to avoid unnecessary local state
      onFilesReordered(reorderedFiles);
    } catch (err) {
      console.error('Error reordering files:', err);
    }
    
    // Reset the dragged item index
    draggedItemIndexRef.current = null;
  };

  const handleFileRemoved = (index) => {
    onFileRemoved(index);
  };

  // Don't render anything if there are no files
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="file-list-title">
        Selected Files ({files.length}) 
        <span className="drag-instruction">
          Drag files to reorder • Drag outside to remove
        </span>
      </h3>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="file-list-droppable" type="FILES">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <ul 
              key="file-list" // Using a stable key to prevent unmounting during drag operations
              className={`file-list sortable ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                // Ensure the container has position relative for proper stacking context
                position: 'relative',
                // Disable box-shadow and transition during drag to prevent flashing
                transition: isDragging ? 'none' : undefined
              }}
            >
              {files.map((fileItem, index) => {
                const draggableId = ensureStableID(fileItem);
                return (
                  <Draggable 
                    key={draggableId}
                    draggableId={draggableId}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <FileListItem
                        fileItem={fileItem}
                        index={index}
                        provided={provided}
                        snapshot={snapshot}
                        onRemove={handleFileRemoved}
                      />
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default memo(SortableFileList);