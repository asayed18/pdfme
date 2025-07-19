import { useState, useEffect } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';
import PDFPagePreview from './atoms/PDFPagePreviewWithKeyboardNav';
import { formatFileSize } from '../utils/pdfUtils';
import { trackEvent } from '../utils/analytics';
import styled from 'styled-components';
import GuidedTour, { TourStep } from './atoms/GuidedTour';

const PageSelectionContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const ExtractPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pagesToExtract, setPagesToExtract] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultStats, setResultStats] = useState<{ totalPages: number; extractedPages: number } | null>(null);
  const [fileStats, setFileStats] = useState<{ totalPages: number; fileSize: string } | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(true);
  
  // Guided tour state
  const [showTour, setShowTour] = useState<boolean>(false);
  
  // Tour steps configuration
  const tourSteps: TourStep[] = [
    {
      title: 'Select Pages to Extract',
      content: 'Click on pages you want to extract into a new PDF. Selected pages will appear highlighted.',
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
      title: 'Extract Pages',
      content: 'After selecting pages for extraction, click the "Extract Pages" button to create your new document.',
      elementSelector: '.button-container',
    },
  ];

  // Check if the guided tour should be shown
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour-pdf-page-extraction-completed') === 'true';
    if (file && !hasSeenTour) {
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
  };

  const handleFileAdded = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setPagesToExtract([]);
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
    setPagesToExtract(selectedPages);
  };

  const extractPagesFromPDF = async () => {
    if (!file || pagesToExtract.length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Track the attempt to extract pages
    trackEvent('PDF', 'Extract Pages Attempt');
    
    try {
      // Get the original page count for stats
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      let totalPages = 0;
      
      // Use the PDF library to get page count and extract pages
      const PDFDocument = (await import('pdf-lib')).PDFDocument;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      totalPages = pdfDoc.getPageCount();
      
      // Create a new PDF document with only the selected pages
      const newPdfDoc = await PDFDocument.create();
      
      // Load the original PDF again for copying pages
      const sourcePdfDoc = await PDFDocument.load(pdfBytes);
      
      // Sort the pages to extract to maintain order
      const sortedPagesToExtract = [...pagesToExtract].sort((a, b) => a - b);
      
      // Copy selected pages to the new document
      const copiedPages = await newPdfDoc.copyPages(sourcePdfDoc, sortedPagesToExtract.map(p => p - 1));
      copiedPages.forEach(page => {
        newPdfDoc.addPage(page);
      });
      
      // Save the extracted PDF
      const extractedPdfBytes = await newPdfDoc.save();
      const extractedPdfBlob = new Blob([extractedPdfBytes], { type: 'application/pdf' });
      
      // Create download link
      const fileName = file.name.replace('.pdf', '');
      const downloadUrl = URL.createObjectURL(extractedPdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${fileName}_extracted_pages.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
      
      // Set stats for display
      setResultStats({
        totalPages,
        extractedPages: pagesToExtract.length,
      });
      
      // Track successful PDF extraction
      trackEvent('PDF', 'Extract Pages Success');
      
      setSuccess(true);
    } catch (err) {
      console.error('Error extracting pages from PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract pages from PDF');
      // Track error
      trackEvent('Error', 'Extract Pages Error');
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
          message="Pages were successfully extracted into a new PDF!"
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
          <div style={{margin: '1rem 0', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)'}}>
            <h4 style={{margin: '0 0 0.5rem 0'}}>File Information</h4>
            <p><strong>File:</strong> {file.name}</p>
            {fileStats && (
              <>
                <p><strong>Total pages:</strong> {fileStats.totalPages}</p>
                <p><strong>File size:</strong> {fileStats.fileSize}</p>
              </>
            )}
          </div>

          <PageSelectionContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Select pages to extract</h3>
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
                selectedPages={pagesToExtract}
                onPagesSelect={handlePagesSelected}
                showKeyboardShortcuts={showKeyboardShortcuts}
              />
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>
                  📄 <strong>Page extraction:</strong> Click on pages you want to extract (pages will appear highlighted)
                </p>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>
                  ✨ <strong>Selected pages:</strong> {pagesToExtract.length} page{pagesToExtract.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            <div className="button-container" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button 
                onClick={extractPagesFromPDF}
                disabled={!file || isLoading || pagesToExtract.length === 0} 
                loading={isLoading}
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                {pagesToExtract.length > 0 ? 
                  `Extract ${pagesToExtract.length} Page${pagesToExtract.length !== 1 ? 's' : ''}` : 
                  'Select Pages to Extract'}
              </Button>
            </div>
          </PageSelectionContainer>

          {/* Guided tour */}
          <GuidedTour
            steps={tourSteps}
            isOpen={showTour}
            onClose={handleTourClose}
            onFinish={handleTourFinish}
            tourId="pdf-page-extraction"
          />
        </div>
      )}

      {resultStats && (
        <div style={{margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)'}}>
          <h4 style={{margin: '0 0 0.5rem 0'}}>Extraction Summary</h4>
          <p><strong>Original document:</strong> {resultStats.totalPages} pages</p>
          <p><strong>Pages extracted:</strong> {resultStats.extractedPages} pages</p>
          <p><strong>New document:</strong> {resultStats.extractedPages} pages</p>
        </div>
      )}
    </div>
  );
};

export default ExtractPDF;
