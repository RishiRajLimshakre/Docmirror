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

  const pushPage = () => {
    if (currentBlocks.length > 0 || pages.length === 0) {
      pages.push({ pageNumber, blocks: [...currentBlocks] });
      pageNumber += 1;
      currentBlocks = [];
      usedHeight = 0;
    }
  };

  for (const block of blocks) {
    if (block.type === "pageBreak") {
      pushPage();
      continue;
    }

    let blockHeight = heightMap.get(block.id) ?? estimateBlockHeight(block);

    // If list block, add safety buffer to avoid clipping
    if (block.type === "bulletList" || block.type === "orderedList") {
      blockHeight += 12;
    }
    const SAFE_PADDING = 4; // prevents last-line clipping

    // Block doesn't fit on current page — start new page
    if (
      usedHeight + blockHeight > contentHeight - SAFE_PADDING &&
      currentBlocks.length > 0
    ) {
      pushPage();
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

/** Fallback height estimates when measurement isn't available yet */
function estimateBlockHeight(block: PreviewBlock): number {
  switch (block.type) {
    case "heading":
      return 40 + (block.level ? (4 - block.level) * 8 : 0);
    case "paragraph":
      return Math.max(24, Math.ceil((block.html?.length ?? 0) / 80) * 24);
    case "bulletList":
    case "orderedList":
      return (block.items?.length ?? 1) * 28;
    case "blockquote":
      return 48;
    case "horizontalRule":
      return 24;
    case "image":
      return block.width ? Math.min(block.width * 0.75, 400) : 200;
    case "table":
      return (block.tableData?.length ?? 1) * 36 + 16;
    case "codeBlock":
      return Math.max(
        48,
        Math.ceil((block.text?.split("\n").length ?? 1) * 20),
      );
    default:
      return 24;
  }
}

export function getTotalPages(pages: PreviewPage[]): number {
  return pages.length;
}
