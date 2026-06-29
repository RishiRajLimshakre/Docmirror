import mammoth from 'mammoth';
import { generateJSON } from '@tiptap/html';
import { createEditorExtensions } from '@/lib/editor/extensions';

export interface DocxImportResult {
  content: Record<string, unknown>;
  title: string;
  warnings: string[];
}

/**
 * Parse a .docx file into Tiptap-compatible document JSON.
 *
 * Pipeline: DOCX → HTML (mammoth) → Tiptap JSON (@tiptap/html generateJSON)
 */
export async function importDocxFile(file: File): Promise<DocxImportResult> {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      // Embed images as base64 data URIs so they work without a server upload step
      convertImage: mammoth.images.imgElement((image) =>
        image.read('base64').then((imageBuffer) => ({
          src: `data:${image.contentType};base64,${imageBuffer}`,
        }))
      ),
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Title'] => h1:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
    }
  );

  const warnings = result.messages
    .filter((m) => m.type === 'warning')
    .map((m) => m.message);

  const extensions = createEditorExtensions();
  const json = generateJSON(result.value, extensions) as Record<string, unknown>;

  // Derive title from filename (strip .docx extension)
  const title = file.name.replace(/\.docx$/i, '').replace(/[_-]/g, ' ') || 'Imported Document';

  return { content: json, title, warnings };
}

/** Validate that a file is a .docx before parsing */
export function isDocxFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}
