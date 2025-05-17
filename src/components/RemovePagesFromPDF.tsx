import { useState } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';
import styled from 'styled-components';

const PageSelectionContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
  }
`;

const RemovePagesFromPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pagesToRemove, setPageToRemove] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileAdded = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      setSuccess(false);
      setPageToRemove([]);
    }
  };

  const handleRemovePages = async () => {
    if (!file || pagesToRemove.length === 0) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Page removal logic here
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove pages from PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {error && (
        <MessageBox
          type="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
      
      {success && (
        <MessageBox
          type="success"
          message="Pages were successfully removed from your PDF!"
          onDismiss={() => setSuccess(false)}
        />
      )}

      <FileDropZone 
        onFilesAdded={handleFileAdded}
        label="Drag & Drop a PDF File Here"
        buttonText="Select PDF File"
        acceptedFileTypes="application/pdf"
        multiple={false}
      />

      {file && (
        <>
          <FileInfo 
            file={file}
            isProcessing={isLoading}
            onRemove={() => setFile(null)}
          />

          <PageSelectionContainer>
            <Label>Enter page numbers to remove (comma-separated):</Label>
            <Input 
              type="text"
              placeholder="e.g., 1, 3, 5-7"
              onChange={(e) => {
                const pages = e.target.value
                  .split(',')
                  .map(p => parseInt(p.trim()))
                  .filter(p => !isNaN(p) && p > 0);
                setPageToRemove(pages);
              }}
            />
          </PageSelectionContainer>
        </>
      )}

      <Button 
        variant="primary"
        isLoading={isLoading}
        disabled={!file || pagesToRemove.length === 0}
        onClick={handleRemovePages}
      >
        {isLoading ? 'Removing Pages...' : 'Remove Pages / Download'}
      </Button>
    </div>
  );
};

export default RemovePagesFromPDF;