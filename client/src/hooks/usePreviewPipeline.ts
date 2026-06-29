import { useCallback, useRef } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { useBlockMeasurement } from '@/hooks/useBlockMeasurement';
import { getMeasurableBlocks } from '@/lib/preview/previewPipeline';

/**
 * Orchestrates the preview pipeline for components that render preview UI.
 *
 * Flow:
 *   document.content → store.previewBlocks → measure → store.previewPages
 *
 * Components read previewBlocks/previewPages from the store.
 * This hook only wires block measurement back into the store.
 */
export function usePreviewPipeline() {
  const document = useDocumentStore((s) => s.document);
  const previewBlocks = useDocumentStore((s) => s.previewBlocks);
  const previewPages = useDocumentStore((s) => s.previewPages);
  const setBlockMeasurements = useDocumentStore((s) => s.setBlockMeasurements);

  const measurableBlocks = getMeasurableBlocks(previewBlocks);

  const handleMeasured = useCallback(
    (measurements: { blockId: string; height: number }[]) => {
      setBlockMeasurements(measurements);
    },
    [setBlockMeasurements]
  );

  const measureRef = useBlockMeasurement({
    blocks: measurableBlocks,
    onMeasured: handleMeasured,
  });

  const exportPageRefs = useRef<(HTMLDivElement | null)[]>([]);

  return {
    document,
    previewBlocks,
    previewPages,
    measurableBlocks,
    measureRef,
    exportPageRefs,
    totalPages: previewPages.length,
  };
}
