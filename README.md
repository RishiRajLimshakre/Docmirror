# DocMirror

DocMirror is a full-stack document editor built to simulate a modern writing experience with real-time A4 PDF preview. You write on the left, and instantly see how your document will look across properly paginated A4 pages on the right.

It is designed as a production-style SaaS prototype, focusing on document structure, pagination logic, export workflows, and clean architecture.


## Overview

DocMirror combines a rich text editing system with a live paginated preview engine. The goal is to bridge the gap between writing and final output — allowing users to see document layout in real time instead of exporting blindly.

This project focuses on:

- Structured document modeling
- Dynamic pagination logic
- DOM-based block measurement
- Client-side export workflows
- Modular architecture for future scalability

## Key Features

### Rich Text Editing
- Headings, paragraphs, lists
- Tables and images
- Links and code blocks
- Inline formatting (bold, italic, underline, strike)
- Font families, font sizes, text colors, highlights
- Line spacing adjustments
- Manual page breaks

### Live A4 Preview
- Real-time pagination
- Multi-page flow
- Margin control
- Page numbers
- Zoom controls
- Page break support for manual layout control

### Document Management
- Create, rename, delete documents
- Recent documents dashboard
- Auto-save support
- Template-based document creation

### Export & Import
- Export to PDF (DOM-based rendering)
- Export to DOCX
- Import DOCX files (basic formatting supported)

### Image Upload
- Server-side image storage
- Image embedding inside documents
- Referenced and persisted via MongoDB

## How to Use DocMirror

1. **Create or open a document** from the dashboard.
2. Use the toolbar to format your content.
3. Watch the PDF preview panel update in real time.
4. Use **Page Break** to control where a new page starts for better layout control.
5. Export your document as PDF or DOCX when ready.

### Important Note on Pagination

DocMirror uses a custom-built pagination engine based on DOM measurement. While stable for most content, it is still under refinement.

If preview layout appears slightly misaligned:
- Insert a **Page Break** where you want the next page to begin.
- Refresh the page if preview rendering becomes inconsistent.

This is a prototype iteration and pagination improvements are ongoing.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Zustand (state management)
- Tiptap (ProseMirror)
- React Router
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB
- Mongoose

### Export Tools
- html2canvas + jsPDF (PDF export)
- docx (DOCX generation)
- mammoth (DOCX import)

## Architecture

DocMirror is structured around three core layers:

### 1. Editor Layer
Powered by Tiptap, with custom extensions for:
- Page breaks
- Font sizing
- Line spacing

The editor produces structured JSON content that serves as the single source of truth.

### 2. Document Model Layer

Documents are stored as:
- `content` (Tiptap JSON)
- `title`
- `pageSettings`
- `metadata`

This structured approach enables:
- Consistent preview rendering
- Reliable export
- Future collaborative features

### 3. Preview & Pagination Engine

The preview pipeline follows this flow:

1. Normalize Tiptap JSON into preview blocks
2. Measure rendered block heights in a hidden DOM layer
3. Distribute blocks across A4 pages
4. Render visible preview panel
5. Render separate export container at 100% scale
6. Generate PDF from export layer
7. Generate DOCX from structured content

This separation ensures preview zoom does not affect export quality.

## Project Structure

```
DocMirror/
├── client/                 # React frontend
│   └── src/
│       ├── api/            # API client
│       ├── components/     # UI components
│       ├── hooks/          # Custom hooks
│       ├── lib/            # Editor, preview & export logic
│       ├── pages/          # Dashboard & editor pages
│       ├── store/          # Zustand state management
│       ├── styles/         # Global styles
│       └── types/          # Shared types
├── server/                 # Express backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/
└── README.md
```
## Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)


### Install Dependencies

```
npm run install:all
```

### Run Application

```
npm run dev
```

Or separately:

```
npm run dev:server
npm run dev:client
```

Open:

```
http://localhost:5173
```

## Current Limitations

- DOCX import supports common formatting but not advanced Word layouts.
- PDF export is raster-based (JPEG pages).
- No real-time collaboration (future enhancement).
- Pagination engine still being refined for edge cases.
- Image resizing inside editor can be enhanced further.

## Future Improvements

- Server-side vector PDF generation
- Real-time collaborative editing
- Advanced DOCX style mapping
- Custom domains & production-grade scaling
- Pagination stability improvements
- Drag-resize image support
- Role-based authentication

- Improve your GitHub repo presentation further  

You’ve built something solid. Now we polish it like a product.
