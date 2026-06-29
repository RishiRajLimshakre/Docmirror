import type { PreviewPage, PageSettings } from '@/types/document';
import { PreviewPage as PreviewPageComponent } from './PreviewPage';

interface ExportPreviewLayerProps {
  pages: PreviewPage[];
  pageSettings: PageSettings;
  exportPageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

/**
 * Hidden export container — renders preview pages at 100% scale with no zoom.
 * PDF export captures from these elements, not the visible zoomed preview.
 */
export function ExportPreviewLayer({
  pages,
  pageSettings,
  exportPageRefs,
}: ExportPreviewLayerProps) {
  const totalPages = pages.length;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed opacity-0"
      style={{
        left: -9999,
        top: 0,
        zIndex: -1,
        // No transform, no scale — native A4 dimensions
      }}
      id="docmirror-export-container"
    >
      {pages.map((page, index) => (
        <PreviewPageComponent
          key={`export-${page.pageNumber}`}
          ref={(el) => {
            exportPageRefs.current[index] = el;
          }}
          pageNumber={page.pageNumber}
          totalPages={totalPages}
          blocks={page.blocks}
          pageSettings={pageSettings}
          exportMode
        />
      ))}
    </div>
  );
}
