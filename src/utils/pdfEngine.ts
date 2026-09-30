import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { jsPDF } from 'jspdf';

/**
 * Utility to parse page range strings such as "1, 3-5, 8" into 1-based page numbers
 */
export function parsePageRanges(rangesStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangesStr.split(',').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    // default to all pages
    for (let i = 1; i <= totalPages; i++) pages.add(i);
    return Array.from(pages).sort((a, b) => a - b);
  }

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        if (i >= 1 && i <= totalPages) pages.add(i);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Merge multiple PDF files in client's browser
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split or extract specific pages from a PDF
 */
export async function splitPdf(file: File, rangesStr: string): Promise<{ data: Uint8Array; extractedCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const selectedPages = parsePageRanges(rangesStr, totalPages);
  if (selectedPages.length === 0) {
    throw new Error('لم يتم تحديد أي صفحات صحيحة.');
  }

  const newPdf = await PDFDocument.create();
  // 0-indexed page indices for pdf-lib
  const zeroBasedIndices = selectedPages.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(pdfDoc, zeroBasedIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const data = await newPdf.save();
  return { data, extractedCount: copiedPages.length };
}

/**
 * Inspect page count and metadata of a PDF file
 */
export async function inspectPdf(file: File): Promise<{ pageCount: number; title?: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle(),
  };
}

/**
 * Compress / optimize PDF by removing unreferenced objects, compressing object streams
 */
export async function compressPdf(
  file: File,
  _level: 'normal' | 'high'
): Promise<{ data: Uint8Array; originalSize: number; newSize: number; savedPercent: number }> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // Save with stream compression & stripped metadata
  const data = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });

  const newSize = data.byteLength;
  const savedPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

  return {
    data,
    originalSize,
    newSize,
    savedPercent,
  };
}

/**
 * Watermark / Stamp PDF with custom text, angle, opacity, and color
 */
export async function watermarkPdf(
  file: File,
  text: string,
  options: {
    opacity?: number;
    size?: number;
    colorHex?: string;
    rotationDegrees?: number;
  } = {}
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const opacity = options.opacity ?? 0.3;
  const size = options.size ?? 48;
  const rotationDegrees = options.rotationDegrees ?? 45;

  // Convert hex color to RGB (0-1)
  const hex = options.colorHex || '#DC2626';
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);

    page.drawText(text, {
      x: width / 2 - textWidth / 4,
      y: height / 2 - textHeight / 4,
      size,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(rotationDegrees),
    });
  }

  return await pdfDoc.save();
}

/**
 * Rotate PDF pages by 90, 180, or 270 degrees
 */
export async function rotatePdf(file: File, angleDegrees: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + angleDegrees) % 360));
  }

  return await pdfDoc.save();
}

/**
 * Convert user images (JPG, PNG, WebP) to a formatted PDF
 */
export async function imagesToPdf(
  images: File[],
  orientation: 'p' | 'l' = 'p',
  marginMm: number = 10
): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const printableWidth = pageWidth - marginMm * 2;
  const printableHeight = pageHeight - marginMm * 2;

  for (let i = 0; i < images.length; i++) {
    if (i > 0) {
      doc.addPage('a4', orientation);
    }

    const file = images[i];
    const dataUrl = await fileToDataUrl(file);
    const imgDims = await getImageDimensions(dataUrl);

    // Calculate aspect ratio fit within printable area
    const scale = Math.min(printableWidth / imgDims.width, printableHeight / imgDims.height);
    const renderWidth = imgDims.width * scale;
    const renderHeight = imgDims.height * scale;

    const x = marginMm + (printableWidth - renderWidth) / 2;
    const y = marginMm + (printableHeight - renderHeight) / 2;

    const format = file.type.includes('png') ? 'PNG' : 'JPEG';
    doc.addImage(dataUrl, format, x, y, renderWidth, renderHeight);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
    };
    img.src = dataUrl;
  });
}

/**
 * Trigger file download directly in browser without server roundtrip
 */
export function downloadFile(data: Uint8Array, filename: string, mimeType: string = 'application/pdf'): void {
  const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Format bytes to readable string (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
