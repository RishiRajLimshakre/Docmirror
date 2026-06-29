import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { connectDatabase } from './config/db.js';
import documentRoutes from './routes/documents.js';
import { createUploadRouter } from './routes/uploads.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getUploadPath } from './controllers/uploadController.js';

dotenv.config();

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/docmirror';
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';

const uploadPath = getUploadPath(UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'docmirror-api' });
});

app.use('/api/documents', documentRoutes);
app.use('/api/uploads', createUploadRouter(UPLOAD_DIR));

app.use(errorHandler);

async function start() {
  await connectDatabase(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`DocMirror API running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
