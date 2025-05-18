import * as pdfjsLib from 'pdfjs-dist';

/**
 * Manages a pool of PDF.js workers for parallel processing
 */
class PDFWorkerPool {
  private static instance: PDFWorkerPool;
  private workers: pdfjsLib.PDFWorker[] = [];
  private maxWorkers: number;
  
  private constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
    // Limit to a reasonable number to prevent resource exhaustion
    this.maxWorkers = Math.min(maxWorkers, 8);
    // Pre-create workers
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workers.push(new pdfjsLib.PDFWorker(`pdf-worker-${i}`));
    }
    console.log(`PDFWorkerPool initialized with ${this.maxWorkers} workers`);
  }
  
  static getInstance(): PDFWorkerPool {
    if (!PDFWorkerPool.instance) {
      PDFWorkerPool.instance = new PDFWorkerPool();
    }
    return PDFWorkerPool.instance;
  }
  
  getWorker(index: number): pdfjsLib.PDFWorker {
    return this.workers[index % this.maxWorkers];
  }
  
  async destroyWorkers(): Promise<void> {
    await Promise.all(this.workers.map(worker => worker.destroy()));
    this.workers = [];
    PDFWorkerPool.instance = null;
    console.log('PDFWorkerPool workers destroyed');
  }
}

export default PDFWorkerPool;
