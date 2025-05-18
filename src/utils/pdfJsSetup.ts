/**
 * Configures PDF.js worker for the application
 * This file should be imported in the main entry point of the application
 */

import * as pdfjs from 'pdfjs-dist';

// Use local worker files for better performance and offline support
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Configure global PDF.js options for better performance
// @ts-ignore - Add custom properties for performance optimization
globalThis.pdfjsWorkerOptions = {
  // Allow non-conformant codestreams in OpenJPEG
  allowNonConformant: true,
  // Increase image size limits for large PDFs
  maxImageSize: 100000000, // 100MB (very large)
  // Configure WebGL rendering
  enableWebGL: true,
  // Handle JPEG2000 images more forgivingly
  skipErrors: true,
  // High memory systems can handle more operations in parallel
  maxParallelImageRequests: 20
};

// Configure JPEG2000 decoder options
// @ts-ignore - Add support for non-conformant JPEG2000 images
globalThis.pdfjsImageDecoderOptions = {
  openjpeg: {
    allowNonConformantCstream: true,
    skipWarnings: true
  }
};

// Initialize JPEG2000 decoder with our WASM file
try {
  if ((pdfjs as any).initJPEG2000) {
    const result = (pdfjs as any).initJPEG2000('/openjpeg.wasm');
    console.log('JPEG2000 decoder initialized:', result);
  }
} catch (error) {
  console.warn('Could not initialize JPEG2000 decoder:', error);
}

// // Override default image decoders on worker
// const imageDecoderOptions = {
//   isInWebWorker: typeof window === 'undefined',
//   canTransferArrayBuffers: true,
//   getDocumentUrl: () => window.location.href
// };

// Export the configured pdfjs
console.log('PDF.js worker initialized with path:', pdfjs.GlobalWorkerOptions.workerSrc);
console.log('WASM decoders configured for PDF.js');

// Export the configured pdfjs
export default pdfjs;
