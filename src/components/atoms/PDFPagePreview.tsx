import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as pdfjsLib from 'pdfjs-dist';
import PDFWorkerPool from '../../utils/pdfWorkerPool';
import { createPortal } from 'react-dom';
import Modal from './Modal';

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

const PageItem = styled.div<{ isSelected: boolean }>`
  position: relative;
  width: 160px;
  height: 226px; /* Approximate 4:3 ratio */
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid ${props => props.isSelected ? 'var(--accent-color)' : 'transparent'};
  transition: transform 0.2s, border-color 0.2s;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0; /* Prevent items from shrinking */

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
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: ${props => props.isSelected ? 'var(--accent-color)' : 'var(--bg-main)'};
  border: 2px solid ${props => props.isSelected ? 'var(--accent-color)' : 'var(--text-secondary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  
  &::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: white;
    opacity: ${props => props.isSelected ? 1 : 0};
    transition: opacity 0.2s;
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
  font-size: 1.2rem;
  
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

// Modal components for zoomed view
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.2s ease-in-out forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1000px;
  height: 85vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 1rem;
`;

const ZoomButton = styled.button`
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

const ZoomLevel = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
`;

const ZoomCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
`;

interface PDFPagePreviewProps {
  file: File;
  selectedPages: number[];
  onPagesSelect: (selectedPages: number[]) => void;
}

const PDFPagePreview = ({ file, selectedPages, onPagesSelect }: PDFPagePreviewProps) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);
  const [loadingPages, setLoadingPages] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Zoom modal state
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);
  const [currentZoomPage, setCurrentZoomPage] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.5);
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
          enableWebGL: true,
          renderInteractiveForms: true,
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

  // Effect to render zoomed page when modal is open or zoom level changes
  useEffect(() => {
    if (zoomModalOpen && currentZoomPage !== null) {
      renderZoomedPage().catch(console.error);
    }
  }, [zoomModalOpen, currentZoomPage, zoomScale]);

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

  return (
    <>
      <PreviewContainer ref={containerRef} onScroll={handleScroll}>
        {loadingPages && pageCount === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '2rem' }}>
            <LoadingIndicator />
            <span style={{ marginLeft: '1rem' }}>Loading PDF...</span>
          </div>
        )}
        
        {Array.from({ length: pageCount }).map((_, i) => {
          const pageIndex = i + 1;
          const isSelected = selectedPages.includes(pageIndex);
          
          return (
            <PageItem 
              key={pageIndex} 
              isSelected={isSelected}
              ref={el => pageRefs.current[i] = el}
            >
              <canvas id={`page-canvas-${pageIndex}`} style={{ width: '100%', height: 'auto' }}></canvas>
              <PageNumber>Page {pageIndex}</PageNumber>
              <PageCheckbox 
                isSelected={isSelected} 
                onClick={() => togglePageSelection(pageIndex)}
              />
              <PageZoomButton onClick={() => openZoomModal(pageIndex)}>
                <span>🔍</span>
              </PageZoomButton>
            </PageItem>
          );
        })}
      </PreviewContainer>

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
                <label>
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(currentZoomPage)}
                    onChange={() => togglePageSelection(currentZoomPage)}
                  />
                  {' '}Select this page
                </label>
              </div>
              <ZoomControls>
                <ZoomButton onClick={decreaseZoom} title="Zoom out">-</ZoomButton>
                <ZoomLevel>{Math.round(zoomScale * 100)}%</ZoomLevel>
                <ZoomButton onClick={increaseZoom} title="Zoom in">+</ZoomButton>
              </ZoomControls>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '1rem' }}>
              <canvas ref={zoomCanvasRef} style={{ maxWidth: '100%', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' }}></canvas>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PDFPagePreview;
