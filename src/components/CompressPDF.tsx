import { useState } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';
import styled from 'styled-components';
import { compressPDF, formatFileSize, calculateCompressionRate } from '../utils/pdfUtils';
import { trackEvent } from '../utils/analytics';

const CompressionOptions = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: linear-gradient(to right, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05));
  border-radius: 0.5rem;
  border: 1px solid rgba(33, 150, 243, 0.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
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
  padding: 0.75rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(33, 150, 243, 0.08);
    transform: translateY(-1px);
  }

  input {
    margin-top: 0.25rem;
    cursor: pointer;
    accent-color: #2196F3; /* Blue accent for radio buttons */
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

// Import CompressionLevel type or redefine it here
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
      
      // Show processing status message
      const statusElement = document.getElementById('compression-status');
      if (statusElement) {
        statusElement.textContent = "Processing PDF pages...";
      }
      
      // Compress the PDF
      const compressedPdfBlob = await compressPDF(file, compressionLevel);
      const compressedSizeBytes = compressedPdfBlob.size;
      setCompressedSize(compressedSizeBytes);
      
      // Update status
      if (statusElement) {
        statusElement.textContent = "Compression complete!";
      }
      
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
          message="Your PDF was successfully compressed and downloaded!"
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
        <div className="compression-results" style={{ 
          margin: '1.5rem 0',
          padding: '1.25rem',
          background: 'linear-gradient(to bottom, rgba(33, 150, 243, 0.05), rgba(33, 150, 243, 0.02))', // Light blue gradient
          borderRadius: '0.5rem',
          border: '1px solid rgba(33, 150, 243, 0.2)', // Light blue border
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ 
            marginBottom: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#4CAF50', // Change from accent color to a green color for success
            textAlign: 'center'
          }}>
            Compression Complete!
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            padding: '0.5rem 0',
            borderBottom: '1px dashed rgba(33, 150, 243, 0.3)' // Light blue border
          }}>
            <span style={{ fontWeight: '500', color: '#555' }}>Original Size:</span>
            <span style={{ color: '#E91E63' }}>{compressionStats.originalSize}</span> {/* Pink/red for original size */}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            padding: '0.5rem 0',
            borderBottom: '1px dashed rgba(33, 150, 243, 0.3)' // Light blue border
          }}>
            <span style={{ fontWeight: '500', color: '#555' }}>Compressed Size:</span>
            <span style={{ color: '#4CAF50' }}>{compressionStats.compressedSize}</span> {/* Green for compressed size */}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: '600',
            marginTop: '0.25rem',
            backgroundColor: 'rgba(33, 150, 243, 0.06)', // Light blue background
            borderRadius: '0.25rem',
            padding: '0.75rem'
          }}>
            <span>Size Reduction:</span>
            <span style={{ 
              color: Number(compressionStats.reductionPercent) > 20 ? '#2196F3' : // Use blue instead of accent color
                     Number(compressionStats.reductionPercent) > 10 ? '#4CAF50' : // Green for medium reduction
                     '#FF9800' // Orange for lower reduction
            }}>
              {compressionStats.reductionPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Enhanced button with more descriptive text */}
      <Button 
        variant="primary"
        isLoading={isLoading}
        disabled={!file}
        onClick={handleCompressPDF}
      >
        {isLoading ? 'Optimizing PDF...' : 'Compress & Download PDF'}
      </Button>
      
      {/* Add a note about processing time for user expectations */}
      {file && !isLoading && (
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '0.85rem', 
          color: '#666',
          textAlign: 'center',
          padding: '0.5rem',
          backgroundColor: 'rgba(255, 152, 0, 0.08)', // Light orange background
          borderRadius: '4px'
        }}>
          <span style={{ color: '#FF9800', marginRight: '0.5rem' }}>ⓘ</span>
          Compression time depends on file size and complexity. Larger files may take longer to process.
        </div>
      )}
      
      {/* Show processing message during compression */}
      {isLoading && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem',
          borderRadius: '0.5rem',
          background: 'linear-gradient(to right, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1))',
          fontSize: '0.9rem',
          color: '#555',
          textAlign: 'center',
          border: '1px solid rgba(33, 150, 243, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontWeight: '500' }}>Processing page by page for optimal compression. Please wait...</div>
          <div id="compression-status" style={{ 
            marginTop: '0.75rem', 
            fontStyle: 'italic',
            color: '#2196F3', // Blue for status text
            fontWeight: '500'
          }}>
            Initializing compression...
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressPDF;