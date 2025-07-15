import React, { memo } from 'react';
import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DroppableStateSnapshot,
  DropResult
} from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from '../atoms/Button';
import styled from 'styled-components';

const List = styled.ul`
    list-style: none;
    padding: 10px;      
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;`;


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

// Simple file list item component
const FileListItem = memo(({ fileItem, index, provided, snapshot, onRemove }: FileListItemProps) => {
  const dragStyle = snapshot.isDragging ? {
    ...provided.draggableProps.style,
    left: '0 !important',
    top: '0 !important',    
    position: 'fixed',
    // zIndex: 99
  } : provided.draggableProps.style;
  return (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={snapshot.isDragging ? 'dragging' : ''}
      style={dragStyle}
      {...provided.dragHandleProps}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px',
        background: 'var(--bg-secondary, rgba(255, 255, 255, 0.9))',
        border: snapshot.isDragging 
          ? '2px solid #2196F3' 
          : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        boxShadow: snapshot.isDragging 
          ? '0 8px 25px rgba(33, 150, 243, 0.3), 0 3px 10px rgba(0, 0, 0, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease',
        transform: snapshot.isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
        backdropFilter: 'blur(20px)',
        minHeight: '60px'
      }}>
        <div 
          
          style={{ marginRight: '12px', cursor: 'grab', color: '#666' }}
          title="Drag to reorder"
        >
          ⋮⋮
        </div>
        
        <span style={{ flex: 1, marginRight: '12px' }}>
          {fileItem.file.name}
        </span>
        
        <Button 
          variant="danger"
          onClick={() => onRemove(index)}
          title="Remove file"
        >
          ×
        </Button>
      </div>
    </li>
  );
});

// Simple ID generation
const ensureStableID = (fileItem: FileItem): string => {
  if (fileItem.id && fileItem.id.trim() !== '') {
    return fileItem.id;
  }
  // Simple ID based on file name and size
  return `${fileItem.file.name}-${fileItem.file.size}`;
};

interface SortableFileListProps {
  files: FileItem[];
  onFilesReordered: (files: FileItem[]) => void;
  onFileRemoved: (index: number) => void;
}

const SortableFileList = ({ files, onFilesReordered, onFileRemoved }: SortableFileListProps) => {
  const onDragEnd = (result: DropResult) => {
    // If dropped outside the list, do nothing
    if (!result.destination) {
      return;
    }
    
    // If dropped in the same position, do nothing
    if (result.destination.index === result.source.index) {
      return;
    }

    // Reorder the files
    const reorderedFiles = Array.from(files);
    const [removed] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, removed);

    onFilesReordered(reorderedFiles);
  };

  // Don't render anything if there are no files
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <>
      <h3>Selected Files ({files.length})</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="file-list">
          {(provided: DroppableProvided) => (
            <List 
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {files.map((fileItem, index) => (
                <Draggable 
                  key={ensureStableID(fileItem)}
                  draggableId={ensureStableID(fileItem)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <FileListItem
                      fileItem={fileItem}
                      index={index}
                      provided={provided}
                      snapshot={snapshot}
                      onRemove={onFileRemoved}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default memo(SortableFileList);