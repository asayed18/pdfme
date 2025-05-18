import { useState } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';
import styled from 'styled-components';
import { compressPDF, CompressionLevel, formatFileSize, calculateCompressionRate } from '../utils/pdfUtils';
import { trackEvent } from '../utils/analytics';

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

  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    compressedSize: string;
    reductionPercent: string;
  } | null>(null);
  
  const handleCompressPDF = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setCompressionStats(null);
    
    trackEvent('PDF', 'Compress Attempt', compressionLevel);
    
    try {
      // Get original file size
      const originalFileSizeBytes = file.size;
      setOriginalSize(originalFileSizeBytes);
      
      // Compress the PDF
      const compressedPdfBlob = await compressPDF(file, compressionLevel);
      const compressedSizeBytes = compressedPdfBlob.size;
      setCompressedSize(compressedSizeBytes);
      
      // Calculate compression statistics
      const stats = {
        originalSize: formatFileSize(originalFileSizeBytes),
        compressedSize: formatFileSize(compressedSizeBytes),
        reductionPercent: calculateCompressionRate(originalFileSizeBytes, compressedSizeBytes),
      };
      setCompressionStats(stats);
      
      // Create a download link for the compressed PDF
      const downloadFileName = `${file.name.replace('.pdf', '')}_compressed.pdf`;
      const downloadUrl = URL.createObjectURL(compressedPdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = downloadFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
      
      trackEvent('PDF', 'Compress Success', compressionLevel);
      
      setSuccess(true);
    } catch (err) {
      console.error('Error compressing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to compress PDF');
      trackEvent('Error', 'Compress Error');
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

      {compressionStats && (
        <div className="compression-results" style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>Compression Results</h3>
          <p><strong>Original Size:</strong> {compressionStats.originalSize}</p>
          <p><strong>Compressed Size:</strong> {compressionStats.compressedSize}</p>
          <p><strong>Size Reduction:</strong> {compressionStats.reductionPercent}%</p>
        </div>
      )}

      <Button 
        variant="primary"
        isLoading={isLoading}
        disabled={!file}
        onClick={handleCompressPDF}
      >
        {isLoading ? 'Compressing...' : 'Compress / Download'}
      </Button>
    </div>
  );
};

export default CompressPDF;