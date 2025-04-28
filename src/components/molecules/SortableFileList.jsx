import React, { useState, useEffect, useRef, memo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from '../atoms/Button';

// Creating a memoized list item component to prevent unnecessary re-renders
const FileListItem = memo(({ fileItem, index, provided, snapshot, onRemove }) => {
  return (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={snapshot.isDragging ? 'dragging' : ''}
      style={{
        ...provided.draggableProps.style,
        // Disable transitions during drag to prevent flashing
        transition: snapshot.isDragging ? 'none' : provided.draggableProps.style?.transition
      }}
    >
      <div className="file-item">
        
        {/* Drag handle on the right */}
        <div 
          className="drag-handle"
          {...provided.dragHandleProps}
          title="Drag to reorder"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
            <path d="M8 9h8M8 12h8M8 15h8"></path>
          </svg>
        </div>        
        {/* File name in the middle with ellipsis and tooltip */}
        <div className="file-name-container">
          <span 
            className="file-name" 
            title={fileItem.file.name} // Tooltip on hover shows full filename
          >
            {fileItem.file.name}
          </span>
        </div>
        {/* Remove button on the left */}
        <Button 
          variant="danger"
          className="remove-button"
          onClick={() => onRemove(index)}
          aria-label="Remove file"
          title="Remove file"
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

// This key will force the entire list to remount when needed
// but not during individual drag operations
const getListKey = (files) => {
  if (!files || files.length === 0) return 'empty-list';
  return `file-list-${files.length}`;
};

const SortableFileList = ({ files, onFilesReordered, onFileRemoved }) => {
  // Create stable reference for the files prop
  const filesRef = useRef(files);
  // This state tracks only if dragging is happening
  const [isDragging, setIsDragging] = useState(false);
  // Track when we should prevent animation flashes
  const preventAnimationRef = useRef(false);
  // Track the currently dragged item index
  const draggedItemIndexRef = useRef(null);
  
  // Update reference when files prop changes
  useEffect(() => {
    if (!isDragging) {
      filesRef.current = files;
    }
  }, [files, isDragging]);

  const onDragStart = (start) => {
    setIsDragging(true);
    preventAnimationRef.current = true;
    
    // Store the index of the item being dragged
    draggedItemIndexRef.current = start.source.index;
    
    // Add a class to the document during dragging to disable animations
    document.body.classList.add('dragging-in-progress');
    
    // Haptic feedback for touch devices
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    
    // Remove dragging class
    document.body.classList.remove('dragging-in-progress');
    
    // We'll clear the prevention after a short delay
    setTimeout(() => {
      preventAnimationRef.current = false;
    }, 300);
    
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

    // Create a copy of the files array to avoid direct modification
    const reorderedFiles = Array.from(filesRef.current);
    const [removed] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, removed);

    // Only call the parent function to avoid unnecessary local state
    onFilesReordered(reorderedFiles);
    
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
          {(provided, snapshot) => (
            <ul 
              key={preventAnimationRef.current ? 'dragging' : getListKey(files)}
              className={`file-list sortable ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                // Disable box-shadow and transition during drag to prevent flashing
                transition: isDragging ? 'none' : undefined
              }}
            >
              {files.map((fileItem, index) => (
                <Draggable 
                  key={fileItem.id} 
                  draggableId={fileItem.id} 
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
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default memo(SortableFileList);