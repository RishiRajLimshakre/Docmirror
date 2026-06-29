import { Request, Response, NextFunction } from 'express';
import * as documentService from '../services/documentService.js';
import { AppError } from '../middleware/errorHandler.js';
import { paramId } from '../utils/params.js';

export async function listDocuments(_req: Request, res: Response, next: NextFunction) {
  try {
    const documents = await documentService.listDocuments();
    res.json(documents);
  } catch (error) {
    next(error);
  }
}

export async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.getDocumentById(paramId(req));
    if (!doc) throw new AppError(404, 'Document not found');
    res.json(doc);
  } catch (error) {
    next(error);
  }
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.createDocument(req.body);
    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.updateDocument(paramId(req), req.body);
    if (!doc) throw new AppError(404, 'Document not found');
    res.json(doc);
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await documentService.deleteDocument(paramId(req));
    if (!deleted) throw new AppError(404, 'Document not found');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function renameDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      throw new AppError(400, 'Title is required');
    }
    const doc = await documentService.renameDocument(paramId(req), title.trim());
    if (!doc) throw new AppError(404, 'Document not found');
    res.json(doc);
  } catch (error) {
    next(error);
  }
}
