import { useState } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';
import PDFPagePreview from './atoms/PDFPagePreview';
import { removePagesFromPDF, formatFileSize } from '../utils/pdfUtils';
import { trackEvent } from '../utils/analytics';
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
  const [resultStats, setResultStats] = useState<{ totalPages: number; removedPages: number } | null>(null);
  const [fileStats, setFileStats] = useState<{ totalPages: number; fileSize: string } | null>(null);

  const handleFileAdded = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setPageToRemove([]);
      setResultStats(null);
      setFileStats(null);
      
      // Track file upload
      trackEvent('Files', 'Upload');
      
      // Get file stats asynchronously
      const getFileInfo = async () => {
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const PDFDocument = (await import('pdf-lib')).PDFDocument;
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const totalPages = pdfDoc.getPageCount();
          
          // Format file size
          const fileSize = formatFileSize(selectedFile.size);
          
          setFileStats({
            totalPages,
            fileSize
          });
        } catch (err) {
          console.error('Error getting file stats:', err);
        }
      };
      
      getFileInfo();
    }
  };
  
  const handlePagesSelected = (selectedPages: number[]) => {
    setPageToRemove(selectedPages);
  };

  const handleRemovePages = async () => {
    if (!file || pagesToRemove.length === 0) return;

    setIsLoading(true);
    setError(null);
    
    // Track the attempt to remove pages
    trackEvent('PDF', 'Remove Pages Attempt');
    
    try {
      // Get the original page count for stats
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      let totalPages = 0;
      
      // Use the PDF library to get page count
      const PDFDocument = (await import('pdf-lib')).PDFDocument;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      totalPages = pdfDoc.getPageCount();
      
      // Remove the selected pages
      const modifiedPdfBlob = await removePagesFromPDF(file, pagesToRemove);
      
      // Create download link
      const fileName = file.name.replace('.pdf', '');
      const downloadUrl = URL.createObjectURL(modifiedPdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${fileName}_modified.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
      
      // Set stats for display
      setResultStats({
        totalPages,
        removedPages: pagesToRemove.length
      });
      
      // Track successful page removal
      trackEvent('PDF', 'Remove Pages Success');
      
      setSuccess(true);
    } catch (err) {
      console.error('Error removing pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove pages from PDF');
      trackEvent('Error', 'Remove Pages Error');
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
          
          {fileStats && (
            <div style={{
              margin: '1rem 0',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>File size:</strong> {fileStats.fileSize}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Total pages:</strong> {fileStats.totalPages}
              </p>
            </div>
          )}

          <PageSelectionContainer>
            <Label>Click on pages to mark them for removal:</Label>
            <div style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              backgroundColor: 'var(--bg-info)', 
              borderRadius: '0.5rem',
              borderLeft: '4px solid var(--accent-color)' 
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                ℹ️ Click on the circles in the top-right corner of each page to select or deselect them for removal.
                Selected pages will be removed from the PDF when you click "Remove Pages".
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-button-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (fileStats) {
                      const allPages = Array.from({ length: fileStats.totalPages }, (_, i) => i + 1);
                      handlePagesSelected(allPages);
                    }
                  }}
                >
                  Select All Pages
                </button>
                <button 
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-button-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePagesSelected([])}
                >
                  Clear Selection
                </button>
              </div>
            </div>
            
            <PDFPagePreview
              file={file}
              selectedPages={pagesToRemove}
              onPagesSelect={handlePagesSelected}
            />
            
            {pagesToRemove.length > 0 && (
              <div style={{
                marginTop: '1rem', 
                padding: '0.75rem',
                fontSize: '0.9rem', 
                backgroundColor: pagesToRemove.length > 0 ? 'var(--bg-warning)' : 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <strong>Selected for removal ({pagesToRemove.length} pages):</strong> {pagesToRemove.sort((a, b) => a - b).join(', ')}
              </div>
            )}
          </PageSelectionContainer>
          
          {resultStats && (
            <div style={{margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)'}}>
              <p><strong>Original document:</strong> {resultStats.totalPages} pages</p>
              <p><strong>Pages removed:</strong> {resultStats.removedPages} pages</p>
              <p><strong>New document:</strong> {resultStats.totalPages - resultStats.removedPages} pages</p>
            </div>
          )}
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