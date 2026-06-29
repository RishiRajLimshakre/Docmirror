import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** A4 size in millimeters (ISO 216) */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** Render scale — 1.5 balances quality vs file size */
const CANVAS_SCALE = 1.5;

/** JPEG quality — 0.85 keeps text readable while shrinking files */
const JPEG_QUALITY = 0.85;

export interface PdfExportOptions {
  filename: string;
  /** Wait for images/fonts before capture */
  onBeforeCapture?: () => Promise<void>;
}

/**
 * Export from hidden, unscaled preview page elements.
 * Uses JPEG compression and jsPDF mm units to avoid huge PNG-based PDFs.
 */
export async function exportToPdf(
  pageElements: HTMLElement[],
  options: PdfExportOptions
): Promise<void> {
  if (pageElements.length === 0) {
    throw new Error('No pages to export');
  }

  if (options.onBeforeCapture) {
    await options.onBeforeCapture();
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];

    // Capture at native page dimensions — no CSS zoom/transform on parent
    const canvas = await html2canvas(pageEl, {
      scale: CANVAS_SCALE,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Let html2canvas derive size from the element's layout box
      width: pageEl.offsetWidth,
      height: pageEl.offsetHeight,
      windowWidth: pageEl.offsetWidth,
      windowHeight: pageEl.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      // Avoid capturing scrollbars or overflow artifacts
      onclone: (_doc, clonedEl) => {
        clonedEl.style.transform = 'none';
        clonedEl.style.boxShadow = 'none';
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      A4_WIDTH_MM,
      A4_HEIGHT_MM,
      undefined,
      'FAST'
    );
  }

  const safeName = options.filename.replace(/[^\w\s-]/g, '').trim() || 'document';
  pdf.save(`${safeName}.pdf`);
}

/** Wait for all images inside a container to finish loading */
export async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
}
