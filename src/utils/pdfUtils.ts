import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export type CompressionLevel = 'high' | 'medium' | 'low';

/**
 * Compresses a PDF file based on the specified compression level
 * @param file The PDF file to compress
 * @param compressionLevel The level of compression to apply
 * @returns A Blob of the compressed PDF
 */
export async function compressPDF(file: File, compressionLevel: CompressionLevel): Promise<Blob> {
  // Get image quality based on compression level
  const imageQuality = getImageQuality(compressionLevel);
  
  try {
    // Step 1: Load the PDF using pdf.js
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdfDoc = await loadingTask.promise;
    
    // Step 2: Prepare to convert each page to image
    const pageCount = pdfDoc.numPages;
    const pagesData: Record<number, string> = {};
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    
    // Step 3: Process each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better quality
      
      // Set canvas dimensions to match PDF page
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page into canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to image data with compression
      const imageFormat = 'image/jpeg';
      pagesData[i] = canvas.toDataURL(imageFormat, imageQuality);
    }
    
    // Step 4: Create a new PDF from the compressed images
    const newPdf = await PDFDocument.create();
    
    // Add each image to the PDF
    for (let i = 1; i <= pageCount; i++) {
      const imageData = pagesData[i];
      
      // Convert data URL to bytes
      const base64Data = imageData.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Embed the image
      const image = await newPdf.embedJpg(imageBytes);
      
      // Add a page with the same dimensions as the image
      const page = newPdf.addPage([image.width, image.height]);
      
      // Draw the image on the page
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
    
    // Step 5: Save the new PDF with compression
    const compressedBytes = await newPdf.save();
    return new Blob([compressedBytes], { type: 'application/pdf' });
  
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('Failed to compress PDF. Please try again.');
  }
}

/**
 * Get image quality value based on the compression level
 */
function getImageQuality(compressionLevel: CompressionLevel): number {
  switch (compressionLevel) {
    case 'low':
      return 0.8; // 80% quality - minimal compression
    case 'medium':
      return 0.5; // 50% quality - balanced compression
    case 'high':
      return 0.2; // 20% quality - maximum compression
    default:
      return 0.5;
  }
}

/**
 * Get the file size in human-readable format
 * @param bytes The size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculate the compression percentage between original and compressed sizes
 * @param originalSize Original file size in bytes
 * @param compressedSize Compressed file size in bytes
 * @returns Percentage as a string with two decimal places
 */
export function calculateCompressionRate(originalSize: number, compressedSize: number): string {
  const reduction = originalSize - compressedSize;
  const percentage = (reduction / originalSize) * 100;
  return percentage.toFixed(2);
}

/**
 * Removes specified pages from a PDF document
 * @param file The PDF file
 * @param pagesToRemove Array of page numbers to remove (1-based indexing)
 * @returns A Blob of the PDF with pages removed
 */
export async function removePagesFromPDF(file: File, pagesToRemove: number[]): Promise<Blob> {
  try {
    // Load the PDF document
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Get all page indices (0-based)
    const pageIndices = pdfDoc.getPageIndices();
    
    // Convert 1-based page numbers to 0-based indices
    const indicesToRemove = pagesToRemove.map(pageNum => pageNum - 1);
    
    // Sort indices in descending order to avoid index shifting when removing pages
    indicesToRemove.sort((a, b) => b - a);
    
    // Remove each page
    for (const index of indicesToRemove) {
      if (index >= 0 && index < pageIndices.length) {
        pdfDoc.removePage(index);
      }
    }
    
    // Save the modified document
    const modifiedPdfBytes = await pdfDoc.save();
    return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error removing pages from PDF:', error);
    throw new Error('Failed to remove pages from the PDF. Please try again.');
  }
}
