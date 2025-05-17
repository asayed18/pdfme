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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    setError(null);
    if (newFiles.length === 0) return;

    const filesWithIds = newFiles.map(file => ({
      id: generateFileHash(file),
      file
    }));
    
    setFiles(prev => [...prev, ...filesWithIds]);
    trackEvent('Files', 'Upload');
  };

  const handleFilesReordered = (reorderedFiles: { id: string; file: File }[]) => {
    setFiles(reorderedFiles);
    trackEvent('Files', 'Reorder');
  };

  const handleFileRemoved = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    trackEvent('Files', 'Remove');
  };

  const mergePDFs = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    trackEvent('PDF', 'Merge Attempt');
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const fileItem of files) {
        try {
          const arrayBuffer = await fileItem.file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(page => mergedPdf.addPage(page));
        } catch (fileError) {
          console.error(`Error processing file ${fileItem.file.name}:`, fileError);
          throw new Error(`Could not process file "${fileItem.file.name}". It may be corrupted or password-protected.`);
        }
      }
      
      const mergedPdfFile = await mergedPdf.save();
      
      const downloadUrl = URL.createObjectURL(new Blob([mergedPdfFile], { type: 'application/pdf' }));
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'merged.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
      
      trackEvent('PDF', 'Merge Success');
      
      setSuccess(true);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setError(error.message || 'An error occurred while merging the PDFs. Please try again.');
      
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