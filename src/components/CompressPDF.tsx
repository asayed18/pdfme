import { useState } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { FileInfo } from './atoms/FileInfo';
import { MessageBox } from './atoms/MessageBox';

const CompressPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      // Compression logic here
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
        <FileInfo 
          file={file}
          isProcessing={isLoading}
          onRemove={() => setFile(null)}
        />
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