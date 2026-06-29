import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { PreviewBlock } from "@/types/document";

let blockCounter = 0;

function nextId(): string {
  blockCounter += 1;
  return `block-${blockCounter}`;
}

function getTextContent(node: ProseMirrorNode): string {
  let text = "";
  node.descendants((child) => {
    if (child.isText) text += child.text;
  });
  return text;
}

function renderInlineHtml(node: ProseMirrorNode): string {
  if (node.isText) {
    let html = escapeHtml(node.text ?? "");
    for (const mark of node.marks) {
      switch (mark.type.name) {
        case "bold":
          html = `<strong>${html}</strong>`;
          break;
        case "italic":
          html = `<em>${html}</em>`;
          break;
        case "underline":
          html = `<u>${html}</u>`;
          break;
        case "strike":
          html = `<s>${html}</s>`;
          break;
        case "code":
          html = `<code>${html}</code>`;
          break;
        case "link":
          html = `<a href="${escapeHtml(String(mark.attrs.href ?? ""))}">${html}</a>`;
          break;
        case "textStyle": {
          const styles: string[] = [];
          if (mark.attrs.fontFamily)
            styles.push(`font-family:${mark.attrs.fontFamily}`);
          if (mark.attrs.fontSize)
            styles.push(`font-size:${mark.attrs.fontSize}`);
          if (mark.attrs.color) styles.push(`color:${mark.attrs.color}`);
          html = styles.length
            ? `<span style="${styles.join(";")}">${html}</span>`
            : html;
          break;
        }
        case "highlight":
          html = `<mark style="background-color:${mark.attrs.color ?? "#fef08a"}">${html}</mark>`;
          break;
      }
    }
    return html;
  }

  if (node.type.name === "hardBreak") return "<br/>";

  let result = "";
  node.forEach((child) => {
    result += renderInlineHtml(child);
  });
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractListItems(listNode: ProseMirrorNode): string[] {
  const items: string[] = [];
  listNode.forEach((item) => {
    if (item.type.name === "listItem") {
      let html = "";
      item.forEach((child) => {
        if (child.type.name === "paragraph") {
          html = renderInlineHtml(child);
        }
      });
      items.push(html);
    }
  });
  return items;
}

function extractTableData(tableNode: ProseMirrorNode): string[][] {
  const rows: string[][] = [];
  tableNode.forEach((row) => {
    if (row.type.name === "tableRow") {
      const cells: string[] = [];
      row.forEach((cell) => {
        if (
          cell.type.name === "tableCell" ||
          cell.type.name === "tableHeader"
        ) {
          cells.push(renderInlineHtml(cell));
        }
      });
      rows.push(cells);
    }
  });
  return rows;
}

/**
 * Converts Tiptap/ProseMirror document JSON into normalized preview blocks.
 * This is the bridge between editor state and preview/export pipelines.
 */
export function normalizeToPreviewBlocks(
  content: Record<string, unknown>,
): PreviewBlock[] {
  blockCounter = 0;
  const blocks: PreviewBlock[] = [];

  try {
    // Use ProseMirror schema from a minimal doc parse
    const doc = parseContentToNode(content);
    if (!doc) return blocks;

    doc.forEach((node) => {
      const block = nodeToPreviewBlock(node);
      if (block) blocks.push(block);
    });
  } catch (err) {
    console.warn("Failed to normalize content:", err);
  }

  return blocks;
}

function parseContentToNode(
  _content: Record<string, unknown>,
): ProseMirrorNode | null {
  // Dynamic import avoided — use JSON walk instead for reliability
  return walkJsonContent();
}

function walkJsonContent(): ProseMirrorNode | null {
  // Fallback: walk JSON directly without full schema
  return null;
}

/** JSON-based normalizer that doesn't require live editor schema */
export function normalizeJsonToPreviewBlocks(
  content: Record<string, unknown>,
): PreviewBlock[] {
  blockCounter = 0;
  const blocks: PreviewBlock[] = [];
  const nodes = (content.content as Record<string, unknown>[]) ?? [];

  for (const node of nodes) {
    const block = jsonNodeToBlock(node);
    if (block) blocks.push(block);
  }

  return blocks;
}

function jsonNodeToBlock(node: Record<string, unknown>): PreviewBlock | null {
  const type = node.type as string;
  const attrs = (node.attrs as Record<string, unknown>) ?? {};
  const children = (node.content as Record<string, unknown>[]) ?? [];

  switch (type) {
    case "heading":
      return {
        id: nextId(),
        type: "heading",
        level: (attrs.level as number) ?? 1,
        html: renderJsonInline(children),
        align: attrs.textAlign as string | undefined,
      };

    case "paragraph":
      return {
        id: nextId(),
        type: "paragraph",
        html: renderJsonInline(children),
        align: attrs.textAlign as string | undefined,
      };

    case "bulletList":
      return {
        id: nextId(),
        type: "bulletList",
        items: extractJsonListItems(node),
      };

    case "orderedList":
      return {
        id: nextId(),
        type: "orderedList",
        items: extractJsonListItems(node),
      };

    case "blockquote":
      return {
        id: nextId(),
        type: "blockquote",
        html: children.map((c) => renderJsonBlock(c)).join(""),
      };

    case "horizontalRule":
      return { id: nextId(), type: "horizontalRule" };

    case "pageBreak":
      return { id: nextId(), type: "pageBreak" };

    case "image":
      return {
        id: nextId(),
        type: "image",
        src: attrs.src as string,
        alt: (attrs.alt as string) ?? "",
        width: attrs.width as number | undefined,
        align: attrs.textAlign as string | undefined,
      };

    case "table":
      return {
        id: nextId(),
        type: "table",
        tableData: extractJsonTableData(node),
      };

    case "codeBlock":
      return {
        id: nextId(),
        type: "codeBlock",
        text: children.map((c) => (c.text as string) ?? "").join(""),
      };

    default:
      return null;
  }
}

function renderJsonBlock(node: Record<string, unknown>): string {
  const type = node.type as string;
  if (type === "paragraph") {
    return `<p>${renderJsonInline((node.content as Record<string, unknown>[]) ?? [])}</p>`;
  }
  return "";
}

function renderJsonInline(nodes: Record<string, unknown>[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        let html = escapeHtml((node.text as string) ?? "");
        const marks = (node.marks as Record<string, unknown>[]) ?? [];
        for (const mark of marks) {
          const markType = mark.type as string;
          const markAttrs = (mark.attrs as Record<string, unknown>) ?? {};
          switch (markType) {
            case "bold":
              html = `<strong>${html}</strong>`;
              break;
            case "italic":
              html = `<em>${html}</em>`;
              break;
            case "underline":
              html = `<u>${html}</u>`;
              break;
            case "strike":
              html = `<s>${html}</s>`;
              break;
            case "code":
              html = `<code>${html}</code>`;
              break;
            case "link":
              html = `<a href="${escapeHtml(String(markAttrs.href ?? ""))}">${html}</a>`;
              break;
            case "textStyle": {
              const styles: string[] = [];
              if (markAttrs.fontFamily)
                styles.push(`font-family:${markAttrs.fontFamily}`);
              if (markAttrs.fontSize)
                styles.push(`font-size:${markAttrs.fontSize}`);
              if (markAttrs.color) styles.push(`color:${markAttrs.color}`);
              html = styles.length
                ? `<span style="${styles.join(";")}">${html}</span>`
                : html;
              break;
            }
            case "highlight":
              html = `<mark style="background-color:${markAttrs.color ?? "#fef08a"}">${html}</mark>`;
              break;
          }
        }
        return html;
      }
      if (node.type === "hardBreak") return "<br/>";
      return "";
    })
    .join("");
}

function extractJsonListItems(listNode: Record<string, unknown>): string[] {
  const items: string[] = [];
  const children = (listNode.content as Record<string, unknown>[]) ?? [];
  for (const item of children) {
    if (item.type === "listItem") {
      const itemContent = (item.content as Record<string, unknown>[]) ?? [];
      for (const child of itemContent) {
        if (child.type === "paragraph") {
          items.push(
            renderJsonInline(
              (child.content as Record<string, unknown>[]) ?? [],
            ),
          );
        }
      }
    }
  }
  return items;
}

function extractJsonTableData(tableNode: Record<string, unknown>): string[][] {
  const rows: string[][] = [];
  const tableRows = (tableNode.content as Record<string, unknown>[]) ?? [];

  for (const row of tableRows) {
    if (row.type !== "tableRow") continue;

    const cells: string[] = [];
    const rowCells = (row.content as Record<string, unknown>[]) ?? [];

    for (const cell of rowCells) {
      if (cell.type !== "tableCell" && cell.type !== "tableHeader") continue;

      const paragraphs = (cell.content as Record<string, unknown>[]) ?? [];

      let cellHtml = "";

      for (const paragraph of paragraphs) {
        if (paragraph.type === "paragraph") {
          const inline = (paragraph.content as Record<string, unknown>[]) ?? [];

          const align = (paragraph.attrs as any)?.textAlign;

          const content = renderJsonInline(inline);

          if (align) {
            cellHtml += `<div style="text-align:${align}">${content}</div>`;
          } else {
            cellHtml += content;
          }
        }
      }

      cells.push(cellHtml);
    }

    rows.push(cells);
  }

  return rows;
}

function nodeToPreviewBlock(node: ProseMirrorNode): PreviewBlock | null {
  switch (node.type.name) {
    case "heading":
      return {
        id: nextId(),
        type: "heading",
        level: node.attrs.level,
        html: renderInlineHtml(node),
        align: node.attrs.textAlign,
      };
    case "paragraph":
      return {
        id: nextId(),
        type: "paragraph",
        html: renderInlineHtml(node),
        align: node.attrs.textAlign,
      };
    case "bulletList":
      return {
        id: nextId(),
        type: "bulletList",
        items: extractListItems(node),
      };
    case "orderedList":
      return {
        id: nextId(),
        type: "orderedList",
        items: extractListItems(node),
      };
    case "blockquote":
      return { id: nextId(), type: "blockquote", html: renderInlineHtml(node) };
    case "horizontalRule":
      return { id: nextId(), type: "horizontalRule" };
    case "pageBreak":
      return { id: nextId(), type: "pageBreak" };
    case "image":
      return {
        id: nextId(),
        type: "image",
        src: node.attrs.src,
        alt: node.attrs.alt,
        width: node.attrs.width,
        align: node.attrs.textAlign,
      };
    case "table":
      return { id: nextId(), type: "table", tableData: extractTableData(node) };
    case "codeBlock":
      return { id: nextId(), type: "codeBlock", text: getTextContent(node) };
    default:
      return null;
  }
}
