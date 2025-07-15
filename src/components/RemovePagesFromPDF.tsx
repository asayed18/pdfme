import { useState, useEffect } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';
import PDFPagePreview from './atoms/PDFPagePreviewWithKeyboardNav';
import { removePagesFromPDF, formatFileSize } from '../utils/pdfUtils';
import { trackEvent } from '../utils/analytics';
import styled from 'styled-components';
import GuidedTour, { TourStep } from './atoms/GuidedTour';

const PageSelectionContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  #background: var(--bg-secondary);
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
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultStats, setResultStats] = useState<{ totalPages: number; removedPages: number; reordered: boolean } | null>(null);
  const [fileStats, setFileStats] = useState<{ totalPages: number; fileSize: string } | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(true);
  
  // Guided tour state
  const [showTour, setShowTour] = useState<boolean>(false);
  
  // Tour steps configuration
  const tourSteps: TourStep[] = [
    {
      title: 'Select Pages',
      content: 'Click the X icon on pages you want to remove. Selected pages will appear blurred and shaded to indicate they will be removed.',
      elementSelector: '.pdf-preview-container',
    },
    {
      title: 'Reorder Pages',
      content: 'Drag and drop pages to change their order in the final document.',
      elementSelector: '.pdf-preview-container',
    },
    {
      title: 'Zoom In',
      content: 'Hover over a page and click the magnifying glass icon to examine it in detail.',
      elementSelector: '.pdf-preview-container',
    },
    {
      title: 'Keyboard Navigation',
      content: 'Use keyboard shortcuts for faster navigation. Toggle the shortcuts guide using the checkbox above.',
      elementSelector: '.keyboard-shortcuts-toggle',
    },
    {
      title: 'Update PDF',
      content: 'After selecting pages for removal or changing their order, click the "Update PDF" button to create your modified document.',
      elementSelector: '.button-container',
    },
  ];

  // Check if the guided tour should be shown
  useEffect(() => {
    // Show the guided tour if the user has never seen it before
    const hasSeenTour = localStorage.getItem('tour-pdf-page-removal-completed') === 'true';
    if (file && !hasSeenTour) {
      // Delay slightly to ensure the PDF preview is loaded
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [file]);
  
  const handleTourClose = () => {
    setShowTour(false);
  };
  
  const handleTourFinish = () => {
    setShowTour(false);
    // The GuidedTour component will handle saving the 'don't show again' preference
  };

  const handleFileAdded = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setPageToRemove([]);
      setPageOrder([]);
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

  const handlePagesReordered = (newOrder: number[]) => {
    setPageOrder(newOrder);
  };

  // Combined function for page removal and reordering

  const handleReorderAndRemovePages = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    // Track the attempt to update PDF (reorder and/or remove pages)
    trackEvent('PDF', 'Update PDF Attempt');
    
    try {
      // Get the original page count for stats
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      let totalPages = 0;
      
      // Use the PDF library to get page count
      const PDFDocument = (await import('pdf-lib')).PDFDocument;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      totalPages = pdfDoc.getPageCount();
      
      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();
      
      // Load the original PDF again for copying pages
      const sourcePdfDoc = await PDFDocument.load(pdfBytes);
      
      // Process according to pageOrder and pagesToRemove
      const pagesToKeep = pageOrder.length > 0 
        ? pageOrder.filter(pageNum => !pagesToRemove.includes(pageNum)) 
        : Array.from({ length: totalPages }, (_, i) => i + 1).filter(pageNum => !pagesToRemove.includes(pageNum));
      
      // Copy pages in the new order
      if (pagesToKeep.length > 0) {
        const copiedPages = await newPdfDoc.copyPages(sourcePdfDoc, pagesToKeep.map(p => p - 1));
        copiedPages.forEach(page => {
          newPdfDoc.addPage(page);
        });
      }
      
      // Save the modified PDF
      const modifiedPdfBytes = await newPdfDoc.save();
      const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      
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
        removedPages: pagesToRemove.length,
        reordered: pageOrder.length > 0
      });
      
      // Track successful PDF update
      trackEvent('PDF', 'Update PDF Success');
      
      setSuccess(true);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      trackEvent('Error', 'Reorder And Remove Pages Error');
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
        <div>
          <PageSelectionContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Select pages to remove</h3>
              <label 
                className="keyboard-shortcuts-toggle"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer' 
                }}
              >
                <input
                  type="checkbox"
                  checked={showKeyboardShortcuts}
                  onChange={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                  style={{ marginRight: '0.5rem' }}
                />
                Show keyboard shortcuts
              </label>
            </div>

            <div className="pdf-preview-container">
              <PDFPagePreview
                file={file}
                selectedPages={pagesToRemove}
                onPagesSelect={handlePagesSelected}
                onPagesReorder={handlePagesReordered}
                showKeyboardShortcuts={showKeyboardShortcuts}
              />
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>
                  ↕️ <strong>Page reordering:</strong> Drag and drop pages to change their order in the final document
                </p>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>
                  ❌ <strong>Page removal:</strong> Click the X icon on pages you want to remove (pages will appear blurred)
                </p>
              </div>
            </div>

            <div className="button-container" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button 
                onClick={handleReorderAndRemovePages}
                disabled={!file || isLoading} 
                loading={isLoading}
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                {pagesToRemove.length > 0 || pageOrder.length > 0 ? 
                  `Update PDF ${pagesToRemove.length > 0 ? '(' + pagesToRemove.length + ' pages to remove)' : ''}` : 
                  'Create New PDF'}
              </Button>
            </div>
          </PageSelectionContainer>

          {/* Guided tour */}
          <GuidedTour
            steps={tourSteps}
            isOpen={showTour}
            onClose={handleTourClose}
            onFinish={handleTourFinish}
            tourId="pdf-page-removal"
          />
        </div>
      )}

      {resultStats && (
        <div style={{margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)'}}>
          <p><strong>Original document:</strong> {resultStats.totalPages} pages</p>
          <p><strong>Pages removed:</strong> {resultStats.removedPages} pages</p>
          <p><strong>New document:</strong> {resultStats.totalPages - resultStats.removedPages} pages</p>
          {resultStats.reordered && <p><strong>Pages reordered:</strong> Yes</p>}
        </div>
      )}
    </div>
  );
};

export default RemovePagesFromPDF;