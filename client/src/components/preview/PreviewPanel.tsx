import { useCallback, useState } from 'react';
import { ZoomIn, ZoomOut, FileDown, RefreshCw } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { usePreviewPipeline } from '@/hooks/usePreviewPipeline';
import { PreviewPage } from './PreviewPage';
import { MeasurementLayer } from './MeasurementLayer';
import { ExportPreviewLayer } from './ExportPreviewLayer';
import { Button } from '@/components/ui/Button';
import { exportToPdf, waitForImages } from '@/lib/export/pdfExport';
import { exportToDocx } from '@/lib/export/docxExport';
import { PREVIEW_ZOOM_MIN, PREVIEW_ZOOM_MAX, A4_WIDTH_PX } from '@/lib/preview/pageConstants';

export function PreviewPanel() {
  const previewZoom = useDocumentStore((s) => s.previewZoom);
  const setPreviewZoom = useDocumentStore((s) => s.setPreviewZoom);
  const refreshPreview = useDocumentStore((s) => s.refreshPreview);

  const {
    document: doc,
    previewPages,
    measurableBlocks,
    measureRef,
    exportPageRefs,
    totalPages,
  } = usePreviewPipeline();

  const [exporting, setExporting] = useState(false);

  const handleZoomIn = () =>
    setPreviewZoom(Math.min(PREVIEW_ZOOM_MAX, previewZoom + 0.05));
  const handleZoomOut = () =>
    setPreviewZoom(Math.max(PREVIEW_ZOOM_MIN, previewZoom - 0.05));

  const handleExportPdf = useCallback(async () => {
    if (!doc) return;

    setExporting(true);
    try {
      // Allow export layer to paint before capture
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const container = window.document.getElementById('docmirror-export-container');
      const elements = exportPageRefs.current.filter(Boolean) as HTMLElement[];

      if (elements.length === 0) {
        throw new Error('Export pages not ready');
      }

      await exportToPdf(elements, {
        filename: doc.title,
        onBeforeCapture: async () => {
          if (container) await waitForImages(container);
        },
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [doc, exportPageRefs]);

  const handleExportDocx = useCallback(async () => {
    if (!doc) return;
    try {
      await exportToDocx(doc.title, doc.content, doc.pageSettings);
    } catch (err) {
      console.error('DOCX export failed:', err);
      alert('DOCX export failed. Please try again.');
    }
  }, [doc]);

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No document loaded
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-gray-100">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">PDF Preview</span>
          <span className="text-xs text-muted-foreground">
            {totalPages} page{totalPages !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs text-muted-foreground">
            {Math.round(previewZoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={refreshPreview} title="Refresh preview">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="mx-2 h-4 w-px bg-border" />
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={exporting}>
            <FileDown className="mr-1 h-3 w-3" />
            {exporting ? 'Exporting…' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportDocx}>
            <FileDown className="mr-1 h-3 w-3" />
            DOCX
          </Button>
        </div>
      </div>

      {/* Pipeline layers — measurement + export (hidden, unscaled) */}
      <MeasurementLayer
        blocks={measurableBlocks}
        pageSettings={doc.pageSettings}
        measureRef={measureRef}
      />
      <ExportPreviewLayer
        pages={previewPages}
        pageSettings={doc.pageSettings}
        exportPageRefs={exportPageRefs}
      />

      {/* Visible preview — zoomed for display only */}
      <div className="flex-1 overflow-auto p-6">
        <div
          className="mx-auto flex flex-col items-center gap-8"
          style={{
            transform: `scale(${previewZoom})`,
            transformOrigin: 'top center',
            width: A4_WIDTH_PX * previewZoom,
          }}
        >
          {previewPages.map((page) => (
            <PreviewPage
              key={page.pageNumber}
              pageNumber={page.pageNumber}
              totalPages={totalPages}
              blocks={page.blocks}
              pageSettings={doc.pageSettings}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
