import { forwardRef } from 'react';
import type { PreviewBlock, PageSettings } from '@/types/document';
import { BlockRenderer } from './BlockRenderer';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '@/lib/preview/pageConstants';
import { cn } from '@/lib/utils';

interface PreviewPageProps {
  pageNumber: number;
  totalPages: number;
  blocks: PreviewBlock[];
  pageSettings: PageSettings;
  exportMode?: boolean;
  className?: string;
}

export const PreviewPage = forwardRef<HTMLDivElement, PreviewPageProps>(
  ({ pageNumber, totalPages, blocks, pageSettings, exportMode = false, className }, ref) => {
    const { marginTop, marginBottom, marginLeft, marginRight, lineSpacing, showPageNumbers, headerText, footerText } =
      pageSettings;

    return (
      <div
        ref={ref}
        className={cn(
          'preview-page relative bg-white shadow-lg',
          exportMode && 'preview-page-export',
          className
        )}
        style={{
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          padding: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
        }}
        data-page={pageNumber}
      >
        {headerText && (
          <div
            className="absolute left-0 right-0 text-center text-xs text-gray-500"
            style={{ top: marginTop / 2 - 6 }}
          >
            {headerText}
          </div>
        )}

        <div className="preview-page-content h-full overflow-hidden">
          {blocks.map((block) => (
            <div key={block.id} data-block-id={block.id}>
              <BlockRenderer block={block} lineSpacing={lineSpacing} />
            </div>
          ))}
        </div>

        {showPageNumbers && (
          <div
            className="absolute left-0 right-0 text-center text-xs text-gray-500"
            style={{ bottom: marginBottom / 2 - 6 }}
          >
            {footerText ? `${footerText} — ` : ''}Page {pageNumber} of {totalPages}
          </div>
        )}
      </div>
    );
  }
);
PreviewPage.displayName = 'PreviewPage';
