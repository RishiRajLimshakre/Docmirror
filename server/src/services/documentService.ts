import { DocumentModel, IDocument } from '../models/Document.js';
import { DEFAULT_PAGE_SETTINGS } from '../types/document.js';

export interface CreateDocumentInput {
  title?: string;
  content?: Record<string, unknown>;
  pageSettings?: Partial<typeof DEFAULT_PAGE_SETTINGS>;
  metadata?: { templateId?: string };
}

export interface UpdateDocumentInput {
  title?: string;
  content?: Record<string, unknown>;
  pageSettings?: Partial<typeof DEFAULT_PAGE_SETTINGS>;
  metadata?: { templateId?: string; wordCount?: number };
}

function countWords(content: Record<string, unknown>): number {
  const textParts: string[] = [];

  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;
    if (typeof n.text === 'string') textParts.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach(walk);
  }

  walk(content);
  const text = textParts.join(' ').trim();
  return text ? text.split(/\s+/).length : 0;
}

export async function listDocuments(limit = 50): Promise<IDocument[]> {
  return DocumentModel.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('title metadata createdAt updatedAt pageSettings')
    .lean() as unknown as Promise<IDocument[]>;
}

export async function getDocumentById(id: string): Promise<IDocument | null> {
  return DocumentModel.findById(id);
}

export async function createDocument(input: CreateDocumentInput = {}): Promise<IDocument> {
  const content = input.content ?? { type: 'doc', content: [] };
  const doc = new DocumentModel({
    title: input.title ?? 'Untitled Document',
    content,
    pageSettings: { ...DEFAULT_PAGE_SETTINGS, ...input.pageSettings },
    metadata: {
      templateId: input.metadata?.templateId,
      wordCount: countWords(content),
    },
  });
  return doc.save();
}

export async function updateDocument(
  id: string,
  input: UpdateDocumentInput
): Promise<IDocument | null> {
  const update: Record<string, unknown> = {};

  if (input.title !== undefined) update.title = input.title;

  if (input.content !== undefined) {
    update.content = input.content;
  }

  if (input.pageSettings !== undefined) {
    update.pageSettings = input.pageSettings;
  }

  // Always recompute metadata cleanly
  const metadataUpdate: Record<string, unknown> = {};

  if (input.metadata?.templateId !== undefined) {
    metadataUpdate.templateId = input.metadata.templateId;
  }

  if (input.content !== undefined) {
    metadataUpdate.wordCount = countWords(input.content);
  }

  if (Object.keys(metadataUpdate).length > 0) {
    update.metadata = metadataUpdate;
  }

  return DocumentModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true }
  );
}

export async function deleteDocument(id: string): Promise<boolean> {
  const result = await DocumentModel.findByIdAndDelete(id);
  return result !== null;
}

export async function renameDocument(id: string, title: string): Promise<IDocument | null> {
  return DocumentModel.findByIdAndUpdate(id, { title }, { new: true });
}
