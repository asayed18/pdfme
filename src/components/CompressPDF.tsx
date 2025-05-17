import { useState } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';
import styled from 'styled-components';

const CompressionOptions = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
`;

const OptionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover {
    background: var(--bg-hover);
  }

  input {
    margin-top: 0.25rem;
    cursor: pointer;
    accent-color: var(--accent-color);
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .option-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .option-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`;

type CompressionLevel = 'high' | 'medium' | 'low';

const compressionLevels = [
  {
    id: 'low',
    name: 'Low Compression',
    description: 'Best quality, minimal size reduction. Ideal for documents with images.',
  },
  {
    id: 'medium',
    name: 'Balanced',
    description: 'Good balance between quality and size reduction.',
  },
  {
    id: 'high',
    name: 'Maximum Compression',
    description: 'Highest size reduction, might affect image quality.',
  },
];

const CompressPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');

  const handleFileAdded = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const compressPDF = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Compression logic here using compressionLevel
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress PDF');
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
          message="Your PDF was successfully compressed!"
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

          <CompressionOptions>
            <OptionTitle>Choose Compression Level</OptionTitle>
            <RadioGroup>
              {compressionLevels.map((level) => (
                <RadioOption key={level.id}>
                  <input
                    type="radio"
                    name="compression"
                    value={level.id}
                    checked={compressionLevel === level.id}
                    onChange={(e) => setCompressionLevel(e.target.value as CompressionLevel)}
                  />
                  <div className="option-content">
                    <span className="option-name">{level.name}</span>
                    <span className="option-description">{level.description}</span>
                  </div>
                </RadioOption>
              ))}
            </RadioGroup>
          </CompressionOptions>
        </>
      )}

      <Button 
        variant="primary"
        isLoading={isLoading}
        disabled={!file}
        onClick={compressPDF}
      >
        {isLoading ? 'Compressing...' : 'Compress / Download'}
      </Button>
    </div>
  );
};

export default CompressPDF;