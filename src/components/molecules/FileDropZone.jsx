import React, { useState, useRef, useEffect } from 'react';

const FileDropZone = ({ 
  onFilesAdded, 
  acceptedFileTypes = 'application/pdf', 
  multiple = true,
  label = 'Drag & Drop Files Here',
  buttonText = 'Choose Files'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => {
      setIsDragging(true);
    };

    const unhighlight = () => {
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      preventDefaults(e);
      const dt = e.dataTransfer;
      const droppedFiles = dt.files;
      handleFiles(droppedFiles);
    };

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.body.addEventListener(eventName, preventDefaults, false);
      dropZone.addEventListener(eventName, preventDefaults, false);
    });

    // Add visual feedback
    ['dragenter', 'dragover'].forEach(eventName => {
      document.body.addEventListener(eventName, highlight, false);
      dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      document.body.removeEventListener(eventName, unhighlight, false);
      dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle drops
    document.body.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('drop', handleDrop, false);

    // Clean up
    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.removeEventListener(eventName, preventDefaults, false);
        dropZone?.removeEventListener(eventName, preventDefaults, false);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        document.body.removeEventListener(eventName, highlight, false);
        dropZone?.removeEventListener(eventName, highlight, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        document.body.removeEventListener(eventName, unhighlight, false);
        dropZone?.removeEventListener(eventName, unhighlight, false);
      });

      document.body.removeEventListener('drop', handleDrop, false);
      dropZone?.removeEventListener('drop', handleDrop, false);
    };
  }, []);

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleFiles = (files) => {
    // Filter files by accepted types if needed
    let filteredFiles = files;
    if (acceptedFileTypes) {
      filteredFiles = Array.from(files).filter(file => 
        file.type === acceptedFileTypes || acceptedFileTypes.includes(file.type)
      );
    }
    
    // Call the callback with the filtered files
    onFilesAdded(filteredFiles);
  };

  // This function will be used only for the button click, not the whole div
  const openFileDialog = (e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation
    fileInputRef.current?.click();
  };

  return (
    <div 
      ref={dropZoneRef}
      className="drag-area"
      style={{
        borderColor: isDragging ? 'var(--accent-color)' : 'var(--border-color)',
        background: isDragging ? 'var(--bg-hover)' : 'var(--bg-main)'
      }}
    >
      <div className="dropzone-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p>{label}</p>
      <div className="dropzone-message">
        {acceptedFileTypes === 'application/pdf' ? 'PDF files only' : 'Supported files only'}
      </div>
      <button 
        type="button"
        className="file-select-button"
        onClick={openFileDialog}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        {buttonText}
      </button>
      <input 
        type="file" 
        className="file-input"
        id="file-input" 
        multiple={multiple} 
        accept={acceptedFileTypes}
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default FileDropZone;