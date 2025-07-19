import { useState, useEffect } from 'react';
import { FileDropZone } from './atoms/FileDropZone';
import Button from './atoms/Button';
import { MessageBox } from './atoms/MessageBox';
import { formatFileSize } from '../utils/pdfUtils';
import { trackEvent } from '../utils/analytics';
import styled from 'styled-components';
import GuidedTour, { TourStep } from './atoms/GuidedTour';

const PasswordContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: 1rem;
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

const PasswordStrengthIndicator = styled.div<{ strength: number }>`
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  margin: 0.5rem 0;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => (props.strength / 4) * 100}%;
    background: ${props => 
      props.strength <= 1 ? '#f44336' :
      props.strength <= 2 ? '#ff9800' :
      props.strength <= 3 ? '#ffeb3b' :
      '#4caf50'
    };
    transition: all 0.3s ease;
  }
`;

const PasswordStrengthText = styled.span<{ strength: number }>`
  font-size: 0.875rem;
  color: ${props => 
    props.strength <= 1 ? '#f44336' :
    props.strength <= 2 ? '#ff9800' :
    props.strength <= 3 ? '#ffeb3b' :
    '#4caf50'
  };
  font-weight: 500;
`;

const LockPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileStats, setFileStats] = useState<{ totalPages: number; fileSize: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  // Guided tour state
  const [showTour, setShowTour] = useState<boolean>(false);
  
  // Tour steps configuration
  const tourSteps: TourStep[] = [
    {
      title: 'Upload PDF',
      content: 'First, upload the PDF file you want to protect with a password.',
      elementSelector: '.file-drop-zone',
    },
    {
      title: 'Set Password',
      content: 'Enter a strong password to protect your PDF. The password strength indicator will help you choose a secure password.',
      elementSelector: '.password-input-container',
    },
    {
      title: 'Confirm Password',
      content: 'Re-enter your password to confirm it matches.',
      elementSelector: '.confirm-password-container',
    },
    {
      title: 'Lock PDF',
      content: 'Click the "Lock PDF" button to encrypt your document with the password.',
      elementSelector: '.button-container',
    },
  ];

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  // Check if the guided tour should be shown
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour-pdf-lock-completed') === 'true';
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
      setPassword('');
      setConfirmPassword('');
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

  const lockPDFWithPassword = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength < 2) {
      setError('Please use a stronger password. Include uppercase, lowercase, numbers, and special characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Track the attempt to lock PDF
    trackEvent('PDF', 'Lock PDF Attempt');
    
    try {
      // Note: PDF encryption requires a specialized library like HummusJS or pdf2pic
      // pdf-lib doesn't support encryption in the browser environment
      // For now, we'll show a message about this limitation
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setError('PDF password protection is not yet available in the browser environment. This feature requires server-side processing for security reasons. Please try using a desktop PDF editor or contact support for alternatives.');
      
      // Track feature limitation
      trackEvent('Feature', 'Lock PDF - Browser Limitation');
      
    } catch (err) {
      console.error('Error locking PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to lock PDF with password');
      // Track error
      trackEvent('Error', 'Lock PDF Error');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'Weak';
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
          message="PDF has been successfully locked with password!"
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div className="file-drop-zone">
        <FileDropZone 
          onFilesAdded={handleFileAdded}
          label="Drag & Drop a PDF File Here"
          buttonText="Select PDF File"
          acceptedFileTypes="application/pdf"
          multiple={false}
        />
      </div>

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

          <PasswordContainer>
            <h3 style={{ margin: '0 0 1rem 0' }}>Set Password Protection</h3>
            
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '0.5rem',
              color: '#e65100'
            }}>
              <strong>⚠️ Note:</strong> PDF password protection is currently in development. This feature requires specialized encryption that works best with server-side processing for security reasons.
            </div>
            
            <div className="password-input-container">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Password <span style={{ color: '#f44336' }}>*</span>
              </label>
              <PasswordInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator strength={passwordStrength} />
              <PasswordStrengthText strength={passwordStrength}>
                Password strength: {getPasswordStrengthText(passwordStrength)}
              </PasswordStrengthText>
            </div>

            <div className="confirm-password-container" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Confirm Password <span style={{ color: '#f44336' }}>*</span>
              </label>
              <PasswordInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <div style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Passwords do not match
                </div>
              )}
              {confirmPassword && password === confirmPassword && password.length > 0 && (
                <div style={{ color: '#4caf50', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  ✓ Passwords match
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Password Requirements:</h4>
              <ul style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                <li style={{ color: password.length >= 8 ? '#4caf50' : '#666' }}>
                  At least 8 characters
                </li>
                <li style={{ color: /[a-z]/.test(password) && /[A-Z]/.test(password) ? '#4caf50' : '#666' }}>
                  Mix of uppercase and lowercase letters
                </li>
                <li style={{ color: /\d/.test(password) ? '#4caf50' : '#666' }}>
                  At least one number
                </li>
                <li style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '#4caf50' : '#666' }}>
                  At least one special character
                </li>
              </ul>
            </div>

            <div className="button-container" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button 
                onClick={lockPDFWithPassword}
                disabled={!file || isLoading || !password || !confirmPassword || password !== confirmPassword || passwordStrength < 2} 
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
                {isLoading ? 'Processing...' : '🔒 Try Lock PDF (Demo)'}
              </Button>
            </div>
          </PasswordContainer>

          {/* Guided tour */}
          <GuidedTour
            steps={tourSteps}
            isOpen={showTour}
            onClose={handleTourClose}
            onFinish={handleTourFinish}
            tourId="pdf-lock"
          />
        </div>
      )}
    </div>
  );
};

export default LockPDF;
