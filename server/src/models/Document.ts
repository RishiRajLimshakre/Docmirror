import mongoose, { Schema, Document as MongoDocument } from 'mongoose';
import { DEFAULT_PAGE_SETTINGS, DocumentMetadata, PageSettings } from '../types/document.js';

export interface IDocument extends MongoDocument {
  title: string;
  content: Record<string, unknown>;
  pageSettings: PageSettings;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const pageSettingsSchema = new Schema<PageSettings>(
  {
    format: { type: String, default: 'A4' },
    marginTop: { type: Number, default: DEFAULT_PAGE_SETTINGS.marginTop },
    marginBottom: { type: Number, default: DEFAULT_PAGE_SETTINGS.marginBottom },
    marginLeft: { type: Number, default: DEFAULT_PAGE_SETTINGS.marginLeft },
    marginRight: { type: Number, default: DEFAULT_PAGE_SETTINGS.marginRight },
    lineSpacing: { type: Number, default: DEFAULT_PAGE_SETTINGS.lineSpacing },
    showPageNumbers: { type: Boolean, default: true },
    headerText: { type: String, default: '' },
    footerText: { type: String, default: '' },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true, trim: true, default: 'Untitled Document' },
    content: { type: Schema.Types.Mixed, required: true, default: { type: 'doc', content: [] } },
    pageSettings: { type: pageSettingsSchema, default: () => ({ ...DEFAULT_PAGE_SETTINGS }) },
    metadata: {
      templateId: String,
      wordCount: Number,
      lastEditedBy: String,
    },
  },
  { timestamps: true }
);

documentSchema.index({ updatedAt: -1 });
documentSchema.index({ title: 'text' });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
