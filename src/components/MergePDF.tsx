import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDropZone } from './atoms/FileDropZone';
import SortableFileList from './molecules/SortableFileList';
import Button from './atoms/Button';
import { MessageBox } from './atoms/MessageBox';
import { generateFileHash } from '../utils/fileUtils';
import { trackEvent } from '../utils/analytics';

const MergePDF = () => {
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
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
    trackEvent('Files', 'Upload');
  };

  const handleFileRemoved = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Track file removal event
    trackEvent('Files', 'Remove');
  };

  const handleFilesReordered = (reorderedFiles: { id: string; file: File }[]) => {
    // Ensure each file has a valid ID
    const filesWithValidIds = reorderedFiles.map(fileItem => ({
      id: fileItem.id || generateFileHash(fileItem.file),
      file: fileItem.file
    }));
    
    setFiles(filesWithValidIds);
    
    // Track files reordering event
    trackEvent('Files', 'Reorder');
  };

  const mergePDFs = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    // Track merge attempt event
    trackEvent('PDF', 'Merge Attempt');
    
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
      trackEvent('PDF', 'Merge Success');
      
      // Show success message
      setSuccess(true);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setError(error.message || 'An error occurred while merging the PDFs. Please try again.');
      
      // Track error event
      trackEvent('Error', 'Merge Error');
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
          message="Your PDFs were successfully merged!"
          onDismiss={() => setSuccess(false)}
        />
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
  );
};

export default MergePDF;