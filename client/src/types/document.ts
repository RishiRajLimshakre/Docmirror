export interface PageSettings {
  format: 'A4';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  lineSpacing: number;
  showPageNumbers: boolean;
  headerText: string;
  footerText: string;
}

export interface DocumentMetadata {
  templateId?: string;
  wordCount?: number;
  lastEditedBy?: string;
}

export interface DocMirrorDocument {
  _id?: string;
  title: string;
  content: Record<string, unknown>;
  pageSettings: PageSettings;
  metadata: DocumentMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  format: 'A4',
  marginTop: 72,
  marginBottom: 72,
  marginLeft: 72,
  marginRight: 72,
  lineSpacing: 1.5,
  showPageNumbers: true,
  headerText: '',
  footerText: '',
};

export const EMPTY_DOC_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface DocumentListItem {
  _id: string;
  title: string;
  metadata?: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
}

/** Normalized block for preview pagination pipeline */
export type PreviewBlockType =
  | 'heading'
  | 'paragraph'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'horizontalRule'
  | 'pageBreak'
  | 'image'
  | 'table'
  | 'codeBlock';

export interface PreviewBlock {
  id: string;
  type: PreviewBlockType;
  level?: number;
  text?: string;
  html?: string;
  items?: string[];
  src?: string;
  alt?: string;
  width?: number;
  align?: string;
  tableData?: string[][];
  marks?: PreviewMark[];
}

export interface PreviewMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface PreviewPage {
  pageNumber: number;
  blocks: PreviewBlock[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  content: Record<string, unknown>;
  pageSettings?: Partial<PageSettings>;
}
