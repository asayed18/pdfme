import React from 'react';
import styled from 'styled-components';

interface FileInfoProps {
  file: File;
  isProcessing?: boolean;
  onRemove: () => void;
}

const FileInfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin: 1rem 0;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FileName = styled.span`
  font-weight: 500;
`;

const FileSize = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const FileInfo: React.FC<FileInfoProps> = ({ file, isProcessing, onRemove }) => {
  return (
    <FileInfoContainer>
      <FileDetails>
        <FileName>{file.name}</FileName>
        <FileSize>{formatFileSize(file.size)}</FileSize>
      </FileDetails>
      <RemoveButton onClick={onRemove} disabled={isProcessing}>
        ✕
      </RemoveButton>
    </FileInfoContainer>
  );
};
