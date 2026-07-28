import type { PreviewBlock, PreviewPage, PageSettings } from "@/types/document";
import { getContentArea } from "./pageConstants";

export interface BlockMeasurement {
  blockId: string;
  height: number;
}

/**
 * Pagination engine: distributes normalized blocks across A4 pages
 * based on measured block heights from a hidden measurement layer.
 *
 * Page breaks force a new page. Blocks that exceed remaining page
 * height start on the next page.
 */
export function paginateBlocks(
  blocks: PreviewBlock[],
  measurements: BlockMeasurement[],
  pageSettings: PageSettings,
): PreviewPage[] {
  const { height: contentHeight } = getContentArea(pageSettings);

  const heightMap = new Map(measurements.map((m) => [m.blockId, m.height]));

  const pages: PreviewPage[] = [];
  let currentBlocks: PreviewBlock[] = [];
  let usedHeight = 0;
  let pageNumber = 1;

  for (const block of blocks) {
    if (block.type === "pageBreak") {
      if (currentBlocks.length > 0) {
        pages.push({ pageNumber, blocks: currentBlocks });
        pageNumber++;
        currentBlocks = [];
        usedHeight = 0;
      }
      continue;
    }

    const blockHeight = heightMap.get(block.id);

    if (blockHeight == null) {
      // Do NOT paginate yet if measurements incomplete
      return pages.length ? pages : [{ pageNumber: 1, blocks: [] }];
    }

    // If block doesn't fit, finalize current page FIRST
    if (usedHeight + blockHeight > contentHeight) {
      if (currentBlocks.length > 0) {
        pages.push({ pageNumber, blocks: currentBlocks });
        pageNumber++;
        currentBlocks = [];
        usedHeight = 0;
      }
    }

    currentBlocks.push(block);
    usedHeight += blockHeight;
  }

  if (currentBlocks.length > 0) {
    pages.push({ pageNumber, blocks: currentBlocks });
  }

  if (pages.length === 0) {
    pages.push({ pageNumber: 1, blocks: [] });
  }

  return pages;
}

export function getTotalPages(pages: PreviewPage[]): number {
  return pages.length;
}
