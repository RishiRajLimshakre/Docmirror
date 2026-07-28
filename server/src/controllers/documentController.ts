import { Response, NextFunction } from 'express';
import * as documentService from '../services/documentService.js';
import { AppError } from '../middleware/errorHandler.js';
import { paramId } from '../utils/params.js';
import { AuthRequest } from '../middleware/auth.js';

export async function listDocuments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const documents = await documentService.listDocuments(req.userId!);
    res.json(documents);
  } catch (error) {
    next(error);
  }
}

export async function getDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.getDocumentById(paramId(req), req.userId!);
    if (!doc) throw new AppError(404, 'Document not found');
    res.json(doc);
  } catch (error) {
    next(error);
  }
}

export async function createDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.createDocument(req.userId!, req.body);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function updateDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.updateDocument(paramId(req), req.userId!, req.body);
    if (!doc) throw new AppError(404, 'Document not found');
    res.json(doc);
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const deleted = await documentService.deleteDocument(paramId(req), req.userId!);
    if (!deleted) throw new AppError(404, 'Document not found');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function renameDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      throw new AppError(400, 'Title is required');
    }
    const doc = await documentService.renameDocument(paramId(req), req.userId!, title.trim());
    if (!doc) throw new AppError(404, 'Document not found');
    res.json(doc);
  } catch (error) {
    next(error);
  }
}
