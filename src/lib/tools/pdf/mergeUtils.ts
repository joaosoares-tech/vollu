import { PDFDocument } from 'pdf-lib-with-encrypt';

/**
 * Merges multiple PDF files into a single PDF document.
 * This runs entirely in the browser (WASM/Client-side).
 *
 * @param files Array of File objects representing the PDFs to merge.
 * @returns A Blob representing the merged PDF document.
 */
export async function mergePdfs(files: File[]): Promise<Blob> {
  if (files.length === 0) {
    throw new Error("No files provided for merging.");
  }

  // Create a new empty PDF document
  const mergedPdf = await PDFDocument.create();

  // Iterate over each file
  for (const file of files) {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF into pdf-lib
    const pdfToMerge = await PDFDocument.load(arrayBuffer);

    // Get all page indices
    const pageIndices = pdfToMerge.getPageIndices();

    // Copy all pages from the loaded document
    const copiedPages = await mergedPdf.copyPages(pdfToMerge, pageIndices);

    // Add each copied page to the new merged document
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await mergedPdf.save();

  // Return as a Blob so it can be easily downloaded or manipulated by the browser
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}
