import type { PreviewBlock, PreviewPage, PageSettings } from '@/types/document';
import { normalizeJsonToPreviewBlocks } from './normalizeContent';
import { paginateBlocks, type BlockMeasurement } from './paginationEngine';

export interface PreviewPipelineResult {
  blocks: PreviewBlock[];
  pages: PreviewPage[];
}

/**
 * Single entry point for the preview pipeline:
 * document.content → blocks → paginated pages
 */
export function computePreviewPipeline(
  content: Record<string, unknown>,
  measurements: BlockMeasurement[],
  pageSettings: PageSettings
): PreviewPipelineResult {
  const blocks = normalizeJsonToPreviewBlocks(content);
  const pages = paginateBlocks(blocks, measurements, pageSettings);
  return { blocks, pages };
}

/** Blocks that need height measurement (excludes page breaks) */
export function getMeasurableBlocks(blocks: PreviewBlock[]): PreviewBlock[] {
  return blocks.filter((b) => b.type !== 'pageBreak');
}
