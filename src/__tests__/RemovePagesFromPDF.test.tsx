import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RemovePagesFromPDF from '../components/RemovePagesFromPDF';

// Mock the PDF page preview component
jest.mock('../components/atoms/PDFPagePreviewWithKeyboardNav', () => {
  return {
    __esModule: true,
    default: ({ file, selectedPages, onPagesSelect, onPagesReorder, showKeyboardShortcuts }) => (
      <div data-testid="pdf-preview-mock">
        <div>PDF Preview (Pages: {selectedPages.join(', ')})</div>
        <button 
          onClick={() => onPagesSelect([1, 3])} 
          data-testid="select-pages-btn"
        >
          Select Pages
        </button>
        <button 
          onClick={() => onPagesReorder([3, 2, 1])} 
          data-testid="reorder-pages-btn"
        >
          Reorder Pages
        </button>
        <div>Show Keyboard Shortcuts: {showKeyboardShortcuts ? 'Yes' : 'No'}</div>
      </div>
    ),
  };
});

// Mock the PDF utils
jest.mock('../utils/pdfUtils', () => {
  return {
    removePagesFromPDF: jest.fn().mockImplementation(() => {
      return Promise.resolve(new Blob(['test'], { type: 'application/pdf' }));
    }),
    formatFileSize: jest.fn().mockReturnValue('1 KB'),
  };
});

// Mock analytics
jest.mock('../utils/analytics', () => {
  return {
    trackEvent: jest.fn(),
  };
});

// Mock pdf-lib
jest.mock('pdf-lib', () => {
  return {
    PDFDocument: {
      load: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          getPageCount: jest.fn().mockReturnValue(3),
          copyPages: jest.fn().mockResolvedValue([{}, {}, {}]),
          addPage: jest.fn(),
          save: jest.fn().mockResolvedValue(new Uint8Array(10)),
        });
      }),
      create: jest.fn().mockImplementation(() => {
        return {
          copyPages: jest.fn().mockResolvedValue([{}, {}]),
          addPage: jest.fn(),
          save: jest.fn().mockResolvedValue(new Uint8Array(10)),
        };
      }),
    },
  };
});

// Mock FileDropZone, Button, FileInfo, and MessageBox components
jest.mock('../components/atoms/FileDropZone', () => ({
  FileDropZone: ({ onFilesAdded }) => (
    <div>
      <button 
        onClick={() => onFilesAdded([new File(['test'], 'test.pdf', { type: 'application/pdf' })])}
        data-testid="drop-file-btn"
      >
        Drop File
      </button>
    </div>
  ),
}));

jest.mock('../components/atoms/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled, loading }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid={`button-${children.toString().toLowerCase().replace(/\s/g, '-')}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

jest.mock('../components/atoms/FileInfo', () => ({
  FileInfo: ({ file }) => (
    <div data-testid="file-info">File Info: {file?.name}</div>
  ),
}));

jest.mock('../components/atoms/MessageBox', () => ({
  MessageBox: ({ type, children }) => (
    <div data-testid={`message-${type}`}>{children}</div>
  ),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('RemovePagesFromPDF Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          click: jest.fn(),
          download: '',
          href: '',
        };
      }
      return document.createElement(tag);
    });
    // Mock appendChild and removeChild
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  test('renders the component with initial state', () => {
    render(<RemovePagesFromPDF />);
    expect(screen.getByText(/Drop your PDF file here/i)).toBeInTheDocument();
  });

  test('shows file info after file is added', async () => {
    render(<RemovePagesFromPDF />);
    
    const dropButton = screen.getByTestId('drop-file-btn');
    fireEvent.click(dropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('file-info')).toBeInTheDocument();
    });
  });

  test('handles page selection', async () => {
    render(<RemovePagesFromPDF />);
    
    // Add a file
    const dropButton = screen.getByTestId('drop-file-btn');
    fireEvent.click(dropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('pdf-preview-mock')).toBeInTheDocument();
    });
    
    // Select pages
    const selectPagesBtn = screen.getByTestId('select-pages-btn');
    fireEvent.click(selectPagesBtn);
    
    expect(screen.getByText(/PDF Preview \(Pages: 1, 3\)/i)).toBeInTheDocument();
  });

  test('handles page reordering', async () => {
    render(<RemovePagesFromPDF />);
    
    // Add a file
    const dropButton = screen.getByTestId('drop-file-btn');
    fireEvent.click(dropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('pdf-preview-mock')).toBeInTheDocument();
    });
    
    // Reorder pages
    const reorderPagesBtn = screen.getByTestId('reorder-pages-btn');
    fireEvent.click(reorderPagesBtn);
    
    // Need to access internal state to verify reordering
    // Instead, we ensure that the component doesn't crash
    expect(screen.getByTestId('pdf-preview-mock')).toBeInTheDocument();
  });

  test('toggles keyboard shortcuts', async () => {
    render(<RemovePagesFromPDF />);
    
    // Add a file
    const dropButton = screen.getByTestId('drop-file-btn');
    fireEvent.click(dropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('pdf-preview-mock')).toBeInTheDocument();
    });
    
    // Initially shortcuts should be shown
    expect(screen.getByText(/Show Keyboard Shortcuts: Yes/i)).toBeInTheDocument();
    
    // Find the checkbox to toggle keyboard shortcuts
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByText(/Show Keyboard Shortcuts: No/i)).toBeInTheDocument();
    });
  });

  // More tests for remove operations would go here
});
