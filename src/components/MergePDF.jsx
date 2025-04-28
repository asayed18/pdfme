import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropZone from './molecules/FileDropZone';
import SortableFileList from './molecules/SortableFileList';
import Button from './atoms/Button';
import { generateFileHash } from '../utils/fileUtils';
import { trackEvent } from '../utils/analytics';

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFilesAdded = (newFiles) => {
    setError(null);
    
    if (newFiles.length === 0) {
      return;
    }
    
    // Add unique IDs to files using our reliable hash function
    const filesWithIds = Array.from(newFiles).map(file => ({
      id: generateFileHash(file),
      file
    }));
    
    setFiles(prevFiles => [...prevFiles, ...filesWithIds]);
    
    // Track file upload event
    trackEvent('Files', 'Upload', 'PDF Files', newFiles.length);
  };

  const handleFileRemoved = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Track file removal event
    trackEvent('Files', 'Remove', 'PDF File');
  };

  const handleFilesReordered = (reorderedFiles) => {
    setFiles(reorderedFiles);
    
    // Track files reordering event
    trackEvent('Files', 'Reorder', 'PDF Files');
  };

  const mergePDFs = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    // Track merge attempt event
    trackEvent('PDF', 'Merge Attempt', 'PDF Files', files.length);
    
    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Process each PDF file
      for (const fileItem of files) {
        try {
          // Convert File object to ArrayBuffer
          const arrayBuffer = await fileItem.file.arrayBuffer();
          // Load the PDF document
          const pdf = await PDFDocument.load(arrayBuffer);
          // Get all pages
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          // Add each page to the new document
          pages.forEach(page => mergedPdf.addPage(page));
        } catch (fileError) {
          console.error(`Error processing file ${fileItem.file.name}:`, fileError);
          throw new Error(`Could not process file "${fileItem.file.name}". It may be corrupted or password-protected.`);
        }
      }
      
      // Save the merged PDF
      const mergedPdfFile = await mergedPdf.save();
      
      // Create download link
      const downloadUrl = URL.createObjectURL(new Blob([mergedPdfFile], { type: 'application/pdf' }));
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'merged.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
      
      // Track successful merge event
      trackEvent('PDF', 'Merge Success', 'PDF Files', files.length);
      
      // Show success message
      setSuccess(true);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setError(error.message || 'An error occurred while merging the PDFs. Please try again.');
      
      // Track error event
      trackEvent('Error', 'Merge Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <h1>PDF Merger</h1>
          <p>Easily combine multiple PDF files into a single document with our powerful PDF merger tool.</p>
        </div>
      </div>

      <div className="container">
        {/* Ad space for top ad */}
        <div className="ad-space ad-space-top">
          {/* AdSense will automatically fill this space */}
        </div>
        
        <div className="app-container full-width">
          {/* Show error message if there's an error */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}
          
          {/* Show success message if operation was successful */}
          {success && (
            <div className="success-message">
              <p>Your PDFs were successfully merged!</p>
              <button onClick={() => setSuccess(false)}>Dismiss</button>
            </div>
          )}
          
          <FileDropZone 
            onFilesAdded={handleFilesAdded}
            label="Drag & Drop PDF Files Here"
            buttonText="Select PDF Files"
            acceptedFileTypes="application/pdf"
            multiple={true}
          />

          <SortableFileList 
            files={files}
            onFilesReordered={handleFilesReordered}
            onFileRemoved={handleFileRemoved}
          />

          <Button 
            variant="primary"
            isLoading={isLoading}
            disabled={files.length === 0}
            onClick={mergePDFs}
          >
            {isLoading ? 'Merging...' : 'Merge / Download'}
          </Button>
        </div>
        
        {/* Ad space for bottom ad */}
        <div className="ad-space ad-space-bottom">
          {/* AdSense will automatically fill this space */}
        </div>
      </div>
    </>
  );
};

export default MergePDF;