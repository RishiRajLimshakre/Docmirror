/** Shared document types mirrored on the client */

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

export interface SavedDocument {
  _id: string;
  title: string;
  content: Record<string, unknown>;
  pageSettings: PageSettings;
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
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
