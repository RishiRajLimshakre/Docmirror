/**
 * DOCX export using the `docx` library.
 * Converts Tiptap JSON content to a Word document structure.
 *
 * Limitations: complex nested formatting, tables with merged cells,
 * and custom page breaks may not map 1:1 to Word layout.
 * Architecture supports extending conversion rules over time.
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  ExternalHyperlink,
} from 'docx';
import { saveAs } from 'file-saver';
import type { PageSettings } from '@/types/document';

type JsonNode = Record<string, unknown>;

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
};

function alignmentFromAttr(align?: string) {
  switch (align) {
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
}

function textRunsFromInline(nodes: JsonNode[]): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = [];

  for (const node of nodes) {
    if (node.type !== 'text') continue;
    const text = (node.text as string) ?? '';
    const marks = (node.marks as JsonNode[]) ?? [];

    let bold = false;
    let italics = false;
    let underline: { type: 'single' } | undefined;
    let strike = false;
    let color: string | undefined;
    let shading: { fill: string } | undefined;
    let font: string | undefined;
    let size: number | undefined;
    let link: string | undefined;

    for (const mark of marks) {
      switch (mark.type) {
        case 'bold':
          bold = true;
          break;
        case 'italic':
          italics = true;
          break;
        case 'underline':
          underline = { type: 'single' };
          break;
        case 'strike':
          strike = true;
          break;
        case 'textStyle': {
          const attrs = mark.attrs as Record<string, unknown>;
          if (attrs.color) color = String(attrs.color).replace('#', '');
          if (attrs.fontFamily) font = String(attrs.fontFamily).split(',')[0];
          if (attrs.fontSize) size = parseInt(String(attrs.fontSize), 10) * 2;
          break;
        }
        case 'highlight': {
          const attrs = mark.attrs as Record<string, unknown>;
          shading = { fill: String(attrs.color ?? '#fef08a').replace('#', '') };
          break;
        }
        case 'link':
          link = String((mark.attrs as Record<string, unknown>)?.href ?? '');
          break;
      }
    }

    const runOptions = {
      text,
      bold,
      italics,
      underline,
      strike,
      color,
      shading,
      font,
      size,
    };

    if (link) {
      runs.push(
        new ExternalHyperlink({
          children: [new TextRun({ ...runOptions, style: 'Hyperlink' })],
          link,
        })
      );
    } else {
      runs.push(new TextRun(runOptions));
    }
  }

  return runs.length ? runs : [new TextRun('')];
}

async function fetchImageBuffer(src: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(src);
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

async function nodeToDocxElements(node: JsonNode): Promise<Array<Paragraph | Table>> {
  const type = node.type as string;
  const attrs = (node.attrs as Record<string, unknown>) ?? {};
  const children = (node.content as JsonNode[]) ?? [];

  switch (type) {
    case 'heading':
      return [
        new Paragraph({
          heading: HEADING_MAP[(attrs.level as number) ?? 1] ?? HeadingLevel.HEADING_1,
          alignment: alignmentFromAttr(attrs.textAlign as string),
          children: textRunsFromInline(children),
          spacing: { after: 200, line: 360 },
        }),
      ];

    case 'paragraph':
      return [
        new Paragraph({
          alignment: alignmentFromAttr(attrs.textAlign as string),
          children: textRunsFromInline(children),
          spacing: { after: 120, line: 360 },
        }),
      ];

    case 'bulletList':
    case 'orderedList': {
      const items: Paragraph[] = [];
      for (const item of children) {
        if (item.type !== 'listItem') continue;
        const itemContent = (item.content as JsonNode[]) ?? [];
        for (const p of itemContent) {
          if (p.type === 'paragraph') {
            items.push(
              new Paragraph({
                children: textRunsFromInline((p.content as JsonNode[]) ?? []),
                bullet: type === 'bulletList' ? { level: 0 } : undefined,
                numbering: type === 'orderedList' ? { reference: 'default-numbering', level: 0 } : undefined,
                spacing: { after: 80 },
              })
            );
          }
        }
      }
      return items;
    }

    case 'blockquote':
      return [
        new Paragraph({
          children: textRunsFromInline(
            children.flatMap((c) => (c.content as JsonNode[]) ?? [])
          ),
          indent: { left: 720 },
          spacing: { after: 120 },
        }),
      ];

    case 'horizontalRule':
      return [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'cccccc' } },
          spacing: { after: 200, before: 200 },
        }),
      ];

    case 'pageBreak':
      return [new Paragraph({ pageBreakBefore: true })];

    case 'codeBlock':
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: children.map((c) => (c.text as string) ?? '').join(''),
              font: 'Courier New',
            }),
          ],
          shading: { fill: 'f3f4f6' },
          spacing: { after: 120 },
        }),
      ];

    case 'image': {
      const src = attrs.src as string;
      const buffer = await fetchImageBuffer(src);
      if (!buffer) {
        return [new Paragraph({ children: [new TextRun(`[Image: ${attrs.alt ?? 'image'}]`)] })];
      }
      return [
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: (attrs.width as number) ?? 400,
                height: 200,
              },
              type: 'png',
            }),
          ],
          spacing: { after: 200 },
        }),
      ];
    }

    case 'table': {
      const rows: TableRow[] = [];
      for (const row of children) {
        if (row.type !== 'tableRow') continue;
        const cells: TableCell[] = [];
        for (const cell of (row.content as JsonNode[]) ?? []) {
          if (cell.type !== 'tableCell' && cell.type !== 'tableHeader') continue;
          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: textRunsFromInline((cell.content as JsonNode[])?.[0]?.content as JsonNode[] ?? []),
                }),
              ],
            })
          );
        }
        rows.push(new TableRow({ children: cells }));
      }
      return [new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows,
      })];
    }

    default:
      return [];
  }
}

export async function exportToDocx(
  title: string,
  content: Record<string, unknown>,
  _pageSettings: PageSettings
): Promise<void> {
  const nodes = (content.content as JsonNode[]) ?? [];
  const elements: Array<Paragraph | Table> = [];

  for (const node of nodes) {
    const converted = await nodeToDocxElements(node);
    elements.push(...converted);
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: elements.length ? elements : [new Paragraph({ children: [new TextRun('')] })],
      },
    ],
    title,
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
}
