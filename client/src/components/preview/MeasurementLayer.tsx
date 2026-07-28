import type { PreviewBlock, PageSettings } from '@/types/document';
import { BlockRenderer } from './BlockRenderer';
import { A4_WIDTH_PX } from '@/lib/preview/pageConstants';

interface MeasurementLayerProps {
  blocks: PreviewBlock[];
  pageSettings: PageSettings;
  measureRef: React.Ref<HTMLDivElement>;
}

/**
 * Hidden off-screen layer used to measure block heights for pagination.
 * Uses the same BlockRenderer as the visible preview for consistent sizing.
 */
export function MeasurementLayer({ blocks, pageSettings, measureRef }: MeasurementLayerProps) {


  return (
    <div
      ref={measureRef}
      aria-hidden
      className="fixed opacity-0 pointer-events-none"
      style={{
        width: A4_WIDTH_PX,
        left: -9999,
        top: 0,
        padding: `${pageSettings.marginTop}px ${pageSettings.marginRight}px ${pageSettings.marginBottom}px ${pageSettings.marginLeft}px`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width:
            A4_WIDTH_PX -
            pageSettings.marginLeft -
            pageSettings.marginRight,
        }}
      >
        {blocks.map((block) => (
          <div key={block.id} data-block-id={block.id}>
            <BlockRenderer
              block={block}
              lineSpacing={pageSettings.lineSpacing}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
