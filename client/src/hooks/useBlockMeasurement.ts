import { useEffect, useRef } from 'react';
import type { PreviewBlock } from '@/types/document';
import type { BlockMeasurement } from '@/lib/preview/paginationEngine';

interface UseBlockMeasurementOptions {
  blocks: PreviewBlock[];
  onMeasured: (measurements: BlockMeasurement[]) => void;
}

/**
 * Measures preview block heights from a hidden DOM layer.
 * Calls onMeasured after layout — does not touch global store directly.
 */
export function useBlockMeasurement({ blocks, onMeasured }: UseBlockMeasurementOptions) {
  const measureRef = useRef<HTMLDivElement>(null);
  const onMeasuredRef = useRef(onMeasured);
  onMeasuredRef.current = onMeasured;

  useEffect(() => {
    const container = measureRef.current;
    if (!container || blocks.length === 0) return;

    // Double rAF ensures layout is settled after React paint
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const elements = container.querySelectorAll('[data-block-id]');
        const measurements = Array.from(elements).map((el) => ({
          blockId: el.getAttribute('data-block-id')!,
          height: el.getBoundingClientRect().height,
        }));
        onMeasuredRef.current(measurements);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [blocks]);

  return measureRef;
}
