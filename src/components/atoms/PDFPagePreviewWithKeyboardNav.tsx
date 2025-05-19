import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import * as pdfjsLib from 'pdfjs-dist';
import PDFWorkerPool from '../../utils/pdfWorkerPool';
import Modal from './Modal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { pauseAnimations, resumeAnimations, fixDragTransforms } from '../../utils/dragUtils';

const PreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.5rem 0;
  justify-content: center;
  max-height: 650px;
  overflow-y: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-color);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color-dark, #0056b3);
  }
`;

const PageItem = styled.div<{ isSelected: boolean; isFocused?: boolean }>`
  position: relative;
  width: 160px;
  height: 226px; /* Approximate 4:3 ratio */
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid ${props => props.isSelected ? 'var(--accent-color)' : 'transparent'};
  transition: transform 0.2s, border-color 0.2s, filter 0.3s ease;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  outline: ${props => props.isFocused ? '2px dashed var(--accent-color)' : 'none'};
  filter: ${props => props.isSelected ? 'blur(1px) brightness(0.7)' : 'none'};
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 0, 0, 0.15);
    opacity: ${props => props.isSelected ? 1 : 0};
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingIndicator = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-color);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const PageCanvas = styled.canvas`
  width: 100%;
  height: auto;
  display: block;
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.25rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  text-align: center;
`;

const PageCheckbox = styled.div<{ isSelected: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  background-color: ${props => props.isSelected ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)'};
  border-radius: 0.25rem;
  opacity: ${props => props.isSelected ? 1 : 0.6};
  transition: opacity 0.2s, background-color 0.2s;
  
  &:hover {
    opacity: 1;
    background-color: ${props => props.isSelected ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'};
  }
`;

const PageZoomButton = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  
  ${PageItem}:hover & {
    opacity: 0.9;
  }
  
  &:hover {
    transform: scale(1.1);
    opacity: 1;
  }
`;

const ScrollControls = styled.div`
  position: sticky;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  gap: 0.5rem;
  z-index: 5;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const ScrollButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.9;
  transition: all 0.2s ease-in-out;
  font-size: 1.3rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-5px);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
    pointer-events: none;
  }
  
  &:hover {
    opacity: 1;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    
    &::after {
      opacity: 1;
      transform: translateX(-50%) translateY(-10px);
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  }
  
  /* Make sure the arrows are properly centered */
  & > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
`;

const ModalZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 1rem;
`;

const ModalZoomButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--accent-color-dark, #0056b3);
  }
`;

const ModalZoomLevel = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const KeyboardNavInfo = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-left: 4px solid var(--accent-color);
  
  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.25rem;
  }
  
  kbd {
    background: var(--bg-main);
    border-radius: 3px;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    color: var(--text-primary);
    display: inline-block;
    font-size: 0.8rem;
    font-family: monospace;
    line-height: 1;
    padding: 2px 5px;
    margin: 0 2px;
  }
`;

interface PDFPagePreviewProps {
  file: File;
  selectedPages: number[];
  onPagesSelect: (selectedPages: number[]) => void;
  onPagesReorder?: (newOrder: number[]) => void;
  showKeyboardShortcuts?: boolean;  // New prop to toggle keyboard shortcut information
}

const PDFPagePreview = ({ 
  file, 
  selectedPages, 
  onPagesSelect, 
  onPagesReorder,
  showKeyboardShortcuts = false
}: PDFPagePreviewProps) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);
  const [loadingPages, setLoadingPages] = useState<boolean>(true);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Zoom modal state
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);
  const [currentZoomPage, setCurrentZoomPage] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.5);
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Keyboard navigation state
  const [focusedPageIndex, setFocusedPageIndex] = useState<number | null>(null);
  const [showKeyboardInfo, setShowKeyboardInfo] = useState<boolean>(showKeyboardShortcuts);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoadingPages(true);
        
        // Use ArrayBuffer to handle large PDFs better
        const arrayBuffer = await file.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          // Use our worker pool
          worker: PDFWorkerPool.getInstance().getWorker(0),
          // Additional performance options
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          wasmUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/wasm/',
          cMapPacked: true,
          enableXfa: false, // Disable XFA for better performance
          disableRange: false,
          disableAutoFetch: false,
          disableStream: false,
          disableFontFace: false,
        });
        
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setPageCount(doc.numPages);
        
        // Initialize page order (1-based indices)
        const initialOrder = Array.from({ length: doc.numPages }, (_, i) => i + 1);
        setPageOrder(initialOrder);
        
        // Pre-load visible pages
        await loadVisiblePages(doc);
        
        setLoadingPages(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoadingPages(false);
      }
    };
    
    loadPDF();
    
    return () => {
      // Clean up
      if (pdfDoc) {
        pdfDoc.destroy().catch(console.error);
      }
    };
  }, [file]);

  // Function to calculate optimal scale based on page dimensions
  const calculateOptimalScale = (pageWidth: number, pageHeight: number, targetWidth: number = 160) => {
    const scale = targetWidth / pageWidth;
    
    // For very large pages, use an even smaller scale for first-pass rendering
    if (pageWidth * pageHeight > 5000000) {
      return Math.min(scale, 0.3); // Cap at 0.3 for large pages
    }
    
    return scale;
  };

  // Load pages that are visible in the viewport
  const loadVisiblePages = async (doc: pdfjsLib.PDFDocumentProxy) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const visiblePageIndices: number[] = [];
    
    // Check which page refs are in the visible area
    pageRefs.current.forEach((pageRef, index) => {
      if (!pageRef) return;
      
      const pageRect = pageRef.getBoundingClientRect();
      
      // Check if the page is in the viewport
      if (
        pageRect.bottom >= containerRect.top &&
        pageRect.top <= containerRect.bottom
      ) {
        visiblePageIndices.push(index + 1); // Page indices start from 1
      }
    });
    
    // If no visible pages (initial render), load the first few pages
    if (visiblePageIndices.length === 0) {
      const initialPageCount = Math.min(doc.numPages, 10);
      for (let i = 1; i <= initialPageCount; i++) {
        visiblePageIndices.push(i);
      }
    }
    
    // Load pages that aren't already loaded
    const pagesToLoad = visiblePageIndices.filter(pageIndex => !loadedPages.includes(pageIndex));
    
    if (pagesToLoad.length > 0) {
      // Load pages in parallel using worker pool
      await Promise.all(pagesToLoad.map(async (pageIndex) => {
        try {
          const page = await doc.getPage(pageIndex);
          await renderPage(page, pageIndex);
          page.cleanup();
        } catch (error) {
          console.error(`Error rendering page ${pageIndex}:`, error);
        }
      }));
      
      setLoadedPages(prev => [...prev, ...pagesToLoad]);
    }
  };

  // Render a single page to its canvas
  const renderPage = async (page: pdfjsLib.PDFPageProxy, pageIndex: number) => {
    const canvas = document.getElementById(`page-canvas-${pageIndex}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const viewport = page.getViewport({ scale: 1 });
    
    // Calculate optimal scale based on page dimensions
    const scale = calculateOptimalScale(viewport.width, viewport.height);
    const scaledViewport = page.getViewport({ scale });
    
    // Set canvas dimensions to match the viewport
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    
    try {
      await page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      }).promise;
    } catch (error) {
      console.error(`Error rendering page ${pageIndex}:`, error);
      
      // Try a fallback render with simpler options if the main render fails
      try {
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
        }).promise;
      } catch (fallbackError) {
        console.error(`Fallback rendering failed for page ${pageIndex}:`, fallbackError);
        
        // Draw an error message on the canvas
        ctx.fillStyle = '#ffebee';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#d32f2f';
        ctx.textAlign = 'center';
        ctx.fillText('Error rendering page', canvas.width / 2, canvas.height / 2);
      }
    }
  };

  // Function to toggle page selection
  const togglePageSelection = (pageIndex: number) => {
    if (selectedPages.includes(pageIndex)) {
      onPagesSelect(selectedPages.filter(index => index !== pageIndex));
    } else {
      onPagesSelect([...selectedPages, pageIndex]);
    }
  };

  // Handle scroll event to load visible pages
  const handleScroll = () => {
    if (pdfDoc) {
      loadVisiblePages(pdfDoc).catch(console.error);
    }
  };

  // Scroll buttons functionality
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Zoom functionality
  const openZoomModal = (pageIndex: number) => {
    setCurrentZoomPage(pageIndex);
    setZoomModalOpen(true);
  };

  const closeZoomModal = () => {
    setZoomModalOpen(false);
    setCurrentZoomPage(null);
  };

  // Render zoomed page
  const renderZoomedPage = async () => {
    if (!pdfDoc || currentZoomPage === null || !zoomCanvasRef.current) return;
    
    try {
      const page = await pdfDoc.getPage(currentZoomPage);
      const canvas = zoomCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      const viewport = page.getViewport({ scale: 1 });
      
      // Apply zoom scale to get higher resolution render
      const scaledViewport = page.getViewport({ scale: zoomScale });
      
      // Set canvas dimensions to match the zoomed viewport
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      try {
        // Clear canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // High-quality render for zoomed view
        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
        }).promise;
      } catch (error) {
        console.error(`Error rendering zoomed page ${currentZoomPage}:`, error);
        
        // Fallback rendering
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '18px Arial';
        ctx.fillStyle = '#d32f2f';
        ctx.textAlign = 'center';
        ctx.fillText('Error rendering zoomed page', canvas.width / 2, canvas.height / 2);
      }
      
      page.cleanup();
    } catch (error) {
      console.error(`Error getting page ${currentZoomPage} for zoomed view:`, error);
    }
  };

  // Adjust zoom level
  const increaseZoom = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 5));
  };

  const decreaseZoom = () => {
    setZoomScale(prev => Math.max(prev - 0.5, 0.5));
  };

  // Scroll to page in the grid
  const scrollToPage = (index: number) => {
    const pageRef = pageRefs.current[index];
    if (pageRef && containerRef.current) {
      pageRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Toggle keyboard shortcuts info
  const toggleKeyboardInfo = () => {
    setShowKeyboardInfo(prev => !prev);
  };

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (zoomModalOpen && currentZoomPage !== null) {
      // Keyboard shortcuts for zoom modal
      switch (e.key) {
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            increaseZoom();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            decreaseZoom();
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeZoomModal();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePageSelection(currentZoomPage);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentZoomPage > 1) {
            setCurrentZoomPage(currentZoomPage - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentZoomPage < pageCount) {
            setCurrentZoomPage(currentZoomPage + 1);
          }
          break;
      }
    } else {
      // Keyboard shortcuts for page navigation
      if (focusedPageIndex !== null) {
        switch (e.key) {
          case ' ':
          case 'Enter':
            e.preventDefault();
            togglePageSelection(pageOrder[focusedPageIndex]);
            break;
          case 'z':
            e.preventDefault();
            openZoomModal(pageOrder[focusedPageIndex]);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setFocusedPageIndex(Math.max(0, focusedPageIndex - 1));
            scrollToPage(Math.max(0, focusedPageIndex - 1));
            break;
          case 'ArrowRight':
            e.preventDefault();
            setFocusedPageIndex(Math.min(pageOrder.length - 1, focusedPageIndex + 1));
            scrollToPage(Math.min(pageOrder.length - 1, focusedPageIndex + 1));
            break;
          case 'ArrowUp':
            e.preventDefault();
            // Calculate approximate row size based on container width or use default of 5
            const rowSize = containerRef.current ? Math.floor(containerRef.current.clientWidth / 180) || 5 : 5;
            const newIndex = Math.max(0, focusedPageIndex - rowSize);
            setFocusedPageIndex(newIndex);
            scrollToPage(newIndex);
            break;
          case 'ArrowDown':
            e.preventDefault();
            // Calculate approximate row size based on container width or use default of 5
            const rowSizeDown = containerRef.current ? Math.floor(containerRef.current.clientWidth / 180) || 5 : 5;
            const newIndexDown = Math.min(pageOrder.length - 1, focusedPageIndex + rowSizeDown);
            setFocusedPageIndex(newIndexDown);
            scrollToPage(newIndexDown);
            break;
          case 'Home':
            e.preventDefault();
            setFocusedPageIndex(0);
            scrollToPage(0);
            break;
          case 'End':
            e.preventDefault();
            setFocusedPageIndex(pageOrder.length - 1);
            scrollToPage(pageOrder.length - 1);
            break;
        }
      } else if (pageOrder.length > 0 && e.key === 'Tab') {
        // Set initial focus when tabbing into the component
        setFocusedPageIndex(0);
      }
    }
  }, [zoomModalOpen, currentZoomPage, focusedPageIndex, pageOrder, pageCount]);

  // Effect to render zoomed page when modal is open or zoom level changes
  useEffect(() => {
    if (zoomModalOpen && currentZoomPage !== null) {
      renderZoomedPage().catch(console.error);
    }
  }, [zoomModalOpen, currentZoomPage, zoomScale]);

  // Effect to add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    // Add scroll event listener
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      // Clean up
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pdfDoc, loadedPages]);

  // Handle drag end
  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    
    // Resume any paused animations
    if (containerRef.current) {
      resumeAnimations(containerRef.current);
    }

    // Check if drag was valid
    if (!result.destination) return;
    
    // Skip if no change
    if (result.destination.index === result.source.index) return;
    
    // Reorder page order array
    const newOrder = Array.from(pageOrder);
    const [movedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, movedItem);
    
    // Update state
    setPageOrder(newOrder);
    
    // Notify parent component
    if (onPagesReorder) {
      onPagesReorder(newOrder);
    }
  };

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
    
    // Pause animations during drag to avoid visual glitches
    if (containerRef.current) {
      pauseAnimations(containerRef.current);
    }
    
    // Apply additional drag transform fixes after a short delay
    setTimeout(() => {
      fixDragTransforms();
    }, 0);
  };

  return (
    <>
      {showKeyboardInfo && (
        <KeyboardNavInfo>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>📋 Keyboard Shortcuts</strong>
            <button 
              onClick={toggleKeyboardInfo}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--text-secondary)' 
              }}
            >
              Hide
            </button>
          </div>
          <ul>
            <li>Use <kbd>Tab</kbd> to focus on the PDF pages grid</li>
            <li>Navigate between pages using <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></li>
            <li>Press <kbd>Space</kbd> or <kbd>Enter</kbd> to mark/unmark a page for removal</li>
            <li>Press <kbd>Z</kbd> to open zoom view for the focused page</li>
            <li>In zoom view: <kbd>Ctrl</kbd>+<kbd>+</kbd> to zoom in, <kbd>Ctrl</kbd>+<kbd>-</kbd> to zoom out</li>
            <li>In zoom view: <kbd>←</kbd> <kbd>→</kbd> to navigate between pages</li>
          </ul>
        </KeyboardNavInfo>
      )}
    
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="pdf-pages" direction="horizontal" type="page">
          {(provided, snapshot) => (
            <PreviewContainer 
              ref={(el) => {
                containerRef.current = el;
                if (el) provided.innerRef(el);
              }} 
              onScroll={handleScroll}
              {...provided.droppableProps}
              style={{
                background: snapshot.isDraggingOver ? 'var(--bg-hover)' : undefined,
                transition: 'background-color 0.2s ease',
              }}
              tabIndex={0}
              aria-label="PDF pages grid"
            >
              {loadingPages && pageCount === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '2rem' }}>
                  <LoadingIndicator />
                  <span style={{ marginLeft: '1rem' }}>Loading PDF...</span>
                </div>
              )}
              
              {pageOrder.map((pageNum, index) => {
                const isSelected = selectedPages.includes(pageNum);
                const isFocused = focusedPageIndex === index;
                
                return (
                  <Draggable key={`page-${pageNum}`} draggableId={`page-${pageNum}`} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        style={{
                          ...dragProvided.draggableProps.style,
                          opacity: dragSnapshot.isDragging ? 0.8 : 1,
                        }}
                      >
                        <PageItem 
                          isSelected={isSelected}
                          isFocused={isFocused}
                          ref={el => {
                            if (pageNum > 0 && pageNum <= pageCount) {
                              pageRefs.current[pageNum - 1] = el;
                            }
                          }}
                          style={{
                            transform: dragSnapshot.isDragging ? 'rotate(2deg)' : undefined,
                            cursor: 'grab',
                          }}
                          tabIndex={0}
                          role="checkbox"
                          aria-checked={isSelected}
                          aria-label={`Page ${pageNum}`}
                          onFocus={() => setFocusedPageIndex(index)}
                          onBlur={() => setFocusedPageIndex(null)}
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              togglePageSelection(pageNum);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              togglePageSelection(pageNum);
                            } else if (e.key === 'z') {
                              e.preventDefault();
                              openZoomModal(pageNum);
                            }
                          }}
                        >
                          <canvas id={`page-canvas-${pageNum}`} style={{ width: '100%', height: 'auto' }}></canvas>
                          <PageNumber>Page {pageNum}</PageNumber>
                          <PageCheckbox 
                            isSelected={isSelected} 
                            onClick={() => togglePageSelection(pageNum)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path 
                                d="M6 6L18 18M6 18L18 6" 
                                stroke="white" 
                                strokeWidth="2.5" 
                                strokeLinecap="round"
                              />
                            </svg>
                          </PageCheckbox>
                          <PageZoomButton onClick={() => openZoomModal(pageNum)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2" fill="none"/>
                              <path d="M15.5 15.5L20 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M10 6V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M6 10H14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </PageZoomButton>
                        </PageItem>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </PreviewContainer>
          )}
        </Droppable>
      </DragDropContext>

      {/* Scroll controls */}
      <ScrollControls>
        <ScrollButton 
          onClick={scrollToTop} 
          title="Scroll to top"
        >
          <span>↑</span>
        </ScrollButton>
        <ScrollButton 
          onClick={scrollToBottom} 
          title="Scroll to bottom"
        >
          <span>↓</span>
        </ScrollButton>
      </ScrollControls>

      {/* Zoom Modal */}
      {zoomModalOpen && currentZoomPage !== null && (
        <Modal
          isOpen={zoomModalOpen}
          onClose={closeZoomModal}
          title={`Page ${currentZoomPage} (Zoomed View)`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <button
                  onClick={() => togglePageSelection(currentZoomPage)}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: selectedPages.includes(currentZoomPage) ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M6 6L18 18M6 18L18 6" 
                      stroke="white" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                  {selectedPages.includes(currentZoomPage) ? 'Cancel removal' : 'Mark for removal'}
                </button>
              </div>
              <ModalZoomControls>
                <ModalZoomButton onClick={decreaseZoom} title="Zoom out (Ctrl+-)">-</ModalZoomButton>
                <ModalZoomLevel>{Math.round(zoomScale * 100)}%</ModalZoomLevel>
                <ModalZoomButton onClick={increaseZoom} title="Zoom in (Ctrl++)">+</ModalZoomButton>
              </ModalZoomControls>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <button 
                onClick={() => currentZoomPage > 1 && setCurrentZoomPage(currentZoomPage - 1)}
                disabled={currentZoomPage <= 1}
                style={{ 
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: currentZoomPage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: currentZoomPage <= 1 ? 0.5 : 1
                }}
              >
                ← Previous Page
              </button>
              <button 
                onClick={() => currentZoomPage < pageCount && setCurrentZoomPage(currentZoomPage + 1)}
                disabled={currentZoomPage >= pageCount}
                style={{ 
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: currentZoomPage >= pageCount ? 'not-allowed' : 'pointer',
                  opacity: currentZoomPage >= pageCount ? 0.5 : 1
                }}
              >
                Next Page →
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '1rem' }}>
              <div style={{ 
                position: 'relative', 
                filter: selectedPages.includes(currentZoomPage) ? 'blur(1px) brightness(0.7)' : 'none',
                transition: 'filter 0.3s ease' 
              }}>
                <canvas ref={zoomCanvasRef} style={{ maxWidth: '100%', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' }}></canvas>
                {selectedPages.includes(currentZoomPage) && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 0, 0, 0.15)',
                    pointerEvents: 'none'
                  }} />
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PDFPagePreview;
