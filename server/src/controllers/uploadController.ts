import { Request, Response, NextFunction } from "express";
import path from "path";
import { AppError } from "../middleware/errorHandler.js";

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      throw new AppError(400, "No file uploaded");
    }

    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.status(201).json({
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
}

export function getUploadPath(uploadDir: string): string {
  return path.resolve(process.cwd(), uploadDir);
}
