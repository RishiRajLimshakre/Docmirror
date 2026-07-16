# DocMirror

**DocMirror** is a production-style web application: a Word-like document editor with a **live PDF preview**. Edit rich formatted content on the left and see how it will look across A4 pages on the right — in real time.

## Features

- **Rich text editing** — headings, paragraphs, lists, tables, images, links, code blocks, page breaks
- **Formatting toolbar** — bold, italic, underline, strike, alignment, fonts, sizes, colors, highlights, line spacing
- **Live paginated preview** — A4 pages with margins, multi-page flow, page breaks, page numbers
- **Document management** — create, open, rename, delete, auto-save, recent documents list
- **Templates** — blank, report, assignment, internship/project report
- **Export** — PDF (from preview DOM) and DOCX (structured conversion)
- **Image uploads** — server-side storage with MongoDB document references

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite,  CSS, Zustand, Tiptap, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Export | html2canvas + jsPDF (PDF), docx (DOCX) |

## Project Structure

```
DocMirror/
├── client/                 # React frontend
│   └── src/
│       ├── api/              # API client
│       ├── components/
│       │   ├── documents/  # Dashboard list, create dialog
│       │   ├── editor/     # Tiptap editor + toolbar
│       │   ├── layout/     # App shell
│       │   ├── preview/    # Paginated preview panel
│       │   └── ui/         # Reusable UI primitives
│       ├── hooks/          # Auto-save, block measurement
│       ├── lib/
│       │   ├── editor/     # Tiptap extensions
│       │   ├── export/     # PDF & DOCX export
│       │   ├── preview/    # Normalization, pagination engine
│       │   └── templates/  # Document templates
│       ├── pages/          # Dashboard, Editor
│       ├── store/          # Zustand document store
│       ├── styles/
│       └── types/          # Shared frontend types
├── server/                 # Express API
│   └── src/
│       ├── config/         # Database connection
│       ├── controllers/
│       ├── middleware/
│       ├── models/         # Mongoose schemas
│       ├── routes/
│       ├── services/
│       └── types/
└── README.md
```

## Architecture

The app is organized around three concerns:

### A) Editor Layer
Tiptap powers the interactive editing experience. Custom extensions include page breaks, font size, and line spacing. The toolbar exposes formatting commands with active-state awareness.

### B) Document Model Layer
Documents are stored as Tiptap JSON (`content`) plus metadata (`title`, `pageSettings`, `metadata`). This JSON is the **source of truth** for save/load, preview, and export.

### C) Preview / Pagination / Export Layer
Centralized in `lib/preview/previewPipeline.ts` and orchestrated by `usePreviewPipeline()`:

1. **Normalize** — Tiptap JSON → `PreviewBlock[]` via `computePreviewPipeline()`
2. **Measure** — `MeasurementLayer` (hidden DOM) measures block heights
3. **Paginate** — blocks distributed across A4 pages
4. **Render visible** — zoomed preview in `PreviewPanel`
5. **Render export** — unscaled pages in `ExportPreviewLayer` (hidden, 100% scale)
6. **Export PDF** — html2canvas + JPEG + jsPDF from export layer only
7. **Export DOCX** — Tiptap JSON → docx library
8. **Import DOCX** — mammoth → HTML → Tiptap JSON

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (or Atlas connection string)

## Setup & Run

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` if needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/docmirror` | MongoDB connection |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |
| `UPLOAD_DIR` | `uploads` | Image upload directory |

### 3. Start MongoDB

Ensure MongoDB is running on your machine, or update `MONGODB_URI` to your Atlas cluster.

### 4. Run the app

```bash
# Run both frontend and backend
npm run dev

# Or separately:
npm run dev:server   # http://localhost:3001
npm run dev:client   # http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/documents` | List recent documents |
| GET | `/api/documents/:id` | Get document |
| POST | `/api/documents` | Create document |
| PUT | `/api/documents/:id` | Update document |
| PATCH | `/api/documents/:id/rename` | Rename document |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/uploads/image` | Upload image (multipart) |

## Export

### PDF
PDF export captures from a **hidden export container** (`ExportPreviewLayer`) rendered at 100% scale — not the visible zoomed preview. Uses JPEG compression and jsPDF mm units for reasonable file sizes.

### DOCX
- **Export**: Tiptap JSON → `docx` library structures
- **Import**: `.docx` → HTML (mammoth) → Tiptap JSON (`@tiptap/html`)

Import is available on the dashboard (creates new document) and in the editor toolbar (replaces current content after confirmation).

## Current Limitations & Future Improvements

- **DOCX import** — supports paragraphs, headings, bold/italic/underline, lists, tables, and embedded images (base64). Complex Word styles, headers/footers, and page layout are not preserved.
- **PDF export** — rasterized JPEG pages; vector PDF possible via server-side rendering in future.
- **Collaboration** — not implemented; architecture supports adding WebSocket sync later.
- **Authentication** — not implemented; add auth middleware when needed.
- **Image resize in editor** — images can be inserted; drag-resize could be added via Tiptap image extension config.
- **Table row/column add/remove** — tables are editable; dedicated table context menu can be added.

## Development

```bash
# Build for production
npm run build

# Type-check client
cd client && npx tsc --noEmit

# Type-check server
cd server && npx tsc --noEmit
```

## License

MIT
