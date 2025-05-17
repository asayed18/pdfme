import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void;
  label?: string;
  buttonText?: string;
  acceptedFileTypes?: string;
  multiple?: boolean;
}

const DropZone = styled.div`
  border: 2px dashed var(--border-color);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;

  &:hover {
    border-color: var(--accent-color);
  }
`;

const Label = styled.p`
  margin: 0 0 1rem;
  color: var(--text-primary);
`;

const Button = styled.button`
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--accent-hover);
  }
`;

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesAdded,
  label = 'Drag & Drop Files Here',
  buttonText = 'Select Files',
  acceptedFileTypes,
  multiple = true,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? { [acceptedFileTypes]: [] } : undefined,
    multiple,
    maxSize: 100 * 1024 * 1024, // 100MB max file size
  });

  return (
    <DropZone {...getRootProps()} className={isDragActive ? 'active' : ''}>
      <input {...getInputProps()} />
      <Label>{isDragActive ? 'Drop the files here...' : label}</Label>
      <Button type="button">{buttonText}</Button>
    </DropZone>
  );
};
