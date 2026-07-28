import { DocumentModel, IDocument } from '../models/Document.js';
import { DEFAULT_PAGE_SETTINGS } from '../types/document.js';
import { AppError } from '../middleware/errorHandler.js';

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

export async function listDocuments(userId: string, limit = 50): Promise<IDocument[]> {
  return DocumentModel.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('title metadata createdAt updatedAt pageSettings')
    .lean() as unknown as Promise<IDocument[]>;
}

export async function getDocumentById(id: string, userId: string): Promise<IDocument | null> {
  return DocumentModel.findOne({ _id: id, userId });
}

export async function createDocument(
  userId: string,
  input: CreateDocumentInput = {}
): Promise<IDocument> {
  const content = input.content ?? { type: 'doc', content: [] };
  const doc = new DocumentModel({
    userId,
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
  userId: string,
  input: UpdateDocumentInput
): Promise<IDocument | null> {
  const update: Record<string, unknown> = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.content !== undefined) update.content = input.content;
  if (input.pageSettings !== undefined) update.pageSettings = input.pageSettings;

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

  return DocumentModel.findOneAndUpdate({ _id: id, userId }, { $set: update }, {
    new: true,
    runValidators: true,
  });
}

export async function deleteDocument(id: string, userId: string): Promise<boolean> {
  const result = await DocumentModel.findOneAndDelete({ _id: id, userId });
  return result !== null;
}

export async function renameDocument(
  id: string,
  userId: string,
  title: string
): Promise<IDocument | null> {
  return DocumentModel.findOneAndUpdate({ _id: id, userId }, { title }, { new: true });
}

/** Verify document belongs to user — throws 404 if not found */
export async function assertDocumentOwner(id: string, userId: string): Promise<void> {
  const doc = await DocumentModel.findOne({ _id: id, userId }).select('_id');
  if (!doc) throw new AppError(404, 'Document not found');
}
