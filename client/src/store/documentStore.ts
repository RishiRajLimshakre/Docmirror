import { create } from "zustand";
import type {
  DocMirrorDocument,
  DocumentListItem,
  PageSettings,
  SaveStatus,
  PreviewPage,
  PreviewBlock,
} from "@/types/document";
import { DEFAULT_PAGE_SETTINGS, EMPTY_DOC_CONTENT } from "@/types/document";
import { documentsApi } from "@/api/client";
import { computePreviewPipeline } from "@/lib/preview/previewPipeline";
import type { BlockMeasurement } from "@/lib/preview/paginationEngine";
import { PREVIEW_ZOOM_DEFAULT } from "@/lib/preview/pageConstants";

interface DocumentState {
  document: DocMirrorDocument | null;
  documentList: DocumentListItem[];
  isLoading: boolean;
  isListLoading: boolean;
  saveStatus: SaveStatus;
  isDirty: boolean;
  lastSavedAt: string | null;

  // Preview pipeline state
  previewBlocks: PreviewBlock[];
  previewPages: PreviewPage[];
  previewZoom: number;
  editorZoom: number;
  blockMeasurements: BlockMeasurement[];
  /** Bumped when content is loaded externally (import, fetch) to sync editor */
  contentRevision: number;

  setDocument: (doc: DocMirrorDocument) => void;
  setContent: (content: Record<string, unknown>) => void;
  setTitle: (title: string) => void;
  setPageSettings: (settings: Partial<PageSettings>) => void;
  setDirty: (dirty: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setPreviewZoom: (zoom: number) => void;
  setEditorZoom: (zoom: number) => void;
  setBlockMeasurements: (measurements: BlockMeasurement[]) => void;
  /** Force full pipeline recompute (e.g. manual refresh) */
  refreshPreview: () => void;
  /** Replace document content from external source (DOCX import) */
  importContent: (content: Record<string, unknown>, title?: string) => void;

  fetchDocumentList: () => Promise<void>;
  fetchDocument: (id: string) => Promise<void>;
  createDocument: (data?: Partial<DocMirrorDocument>) => Promise<string>;
  saveDocument: () => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  renameDocument: (id: string, title: string) => Promise<void>;
  reset: () => void;
}

const DRAFT_KEY = "docmirror-draft";

function loadLocalDraft(): Partial<DocMirrorDocument> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalDraft(doc: DocMirrorDocument) {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        _id: doc._id,
        title: doc.title,
        content: doc.content,
        pageSettings: doc.pageSettings,
      }),
    );
  } catch {
    // ignore quota errors
  }
}

/** Run preview pipeline and return state patch */
function runPipeline(
  content: Record<string, unknown>,
  measurements: BlockMeasurement[],
  pageSettings: PageSettings,
): Pick<DocumentState, "previewBlocks" | "previewPages"> {
  const { blocks, pages } = computePreviewPipeline(
    content,
    measurements,
    pageSettings,
  );
  return { previewBlocks: blocks, previewPages: pages };
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  documentList: [],
  isLoading: false,
  isListLoading: false,
  saveStatus: "idle",
  isDirty: false,
  lastSavedAt: null,
  previewBlocks: [],
  previewPages: [{ pageNumber: 1, blocks: [] }],
  previewZoom: PREVIEW_ZOOM_DEFAULT,
  editorZoom: 1,
  blockMeasurements: [],
  contentRevision: 0,

  setDocument: (doc) => {
    const pageSettings = { ...DEFAULT_PAGE_SETTINGS, ...doc.pageSettings };
    const pipeline = runPipeline(
      doc.content,
      get().blockMeasurements,
      pageSettings,
    );
    set({
      document: { ...doc, pageSettings },
      isDirty: false,
      saveStatus: "saved",
      contentRevision: get().contentRevision + 1,
      ...pipeline,
    });
  },

  setContent: (content) => {
    const { document, blockMeasurements } = get();
    if (!document) return;
    const updated = { ...document, content };
    const pipeline = runPipeline(
      content,
      blockMeasurements,
      document.pageSettings,
    );
    set({
      document: updated,
      isDirty: true,
      saveStatus: "idle",
      ...pipeline,
    });
    saveLocalDraft(updated);
  },

  setTitle: (title) => {
    const { document } = get();
    if (!document) return;
    set({
      document: { ...document, title },
      isDirty: true,
      saveStatus: "idle",
    });
  },

  setPageSettings: (settings) => {
    const { document, blockMeasurements } = get();
    if (!document) return;
    const pageSettings = { ...document.pageSettings, ...settings };
    const updated = { ...document, pageSettings };
    const pipeline = runPipeline(
      document.content,
      blockMeasurements,
      pageSettings,
    );
    set({ document: updated, isDirty: true, saveStatus: "idle", ...pipeline });
  },

  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setPreviewZoom: (zoom) => set({ previewZoom: zoom }),
  setEditorZoom: (zoom) => set({ editorZoom: zoom }),

  setBlockMeasurements: (measurements) => {
    const { document, previewBlocks, blockMeasurements: prev } = get();
    if (!document) return;

    //  Only measure non-pageBreak blocks
    const measurableBlocks = previewBlocks.filter(
      (b) => b.type !== "pageBreak",
    );

    //  Do NOT paginate if not all blocks measured
    if (measurements.length !== measurableBlocks.length) {
      return;
    }

    //  Skip if unchanged
    const same =
      measurements.length === prev.length &&
      measurements.every(
        (m, i) =>
          m.blockId === prev[i]?.blockId &&
          Math.abs(m.height - prev[i].height) < 0.5,
      );
    if (same) return;

    const pipeline = runPipeline(
      document.content,
      measurements,
      document.pageSettings,
    );

    set({
      blockMeasurements: measurements,
      ...pipeline,
    });
  },

  refreshPreview: () => {
    const { document, blockMeasurements } = get();
    if (!document) return;
    const pipeline = runPipeline(
      document.content,
      blockMeasurements,
      document.pageSettings,
    );
    set(pipeline);
  },

  importContent: (content, title) => {
    const { document } = get();
    if (!document) return;

    const updated = {
      ...document,
      content,
      ...(title ? { title } : {}),
      metadata: { ...document.metadata, templateId: "imported-docx" },
    };
    const pipeline = runPipeline(
      content,
      get().blockMeasurements,
      document.pageSettings,
    );
    set({
      document: updated,
      isDirty: true,
      saveStatus: "idle",
      contentRevision: get().contentRevision + 1,
      ...pipeline,
    });
    saveLocalDraft(updated);
  },

  fetchDocumentList: async () => {
    set({ isListLoading: true });
    try {
      const list = await documentsApi.list();
      set({ documentList: list });
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      set({ isListLoading: false });
    }
  },

  fetchDocument: async (id) => {
    set({ isLoading: true, blockMeasurements: [] });
    try {
      const doc = await documentsApi.get(id);
      const pageSettings = { ...DEFAULT_PAGE_SETTINGS, ...doc.pageSettings };
      const pipeline = runPipeline(doc.content, [], pageSettings);
      set({
        document: { ...doc, pageSettings },
        isDirty: false,
        saveStatus: "saved",
        lastSavedAt: doc.updatedAt ?? null,
        blockMeasurements: [],
        contentRevision: get().contentRevision + 1,
        ...pipeline,
      });

      void loadLocalDraft();
    } catch (err) {
      console.error("Failed to fetch document:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createDocument: async (data) => {
    const payload = {
      title: data?.title ?? "Untitled Document",
      content: data?.content ?? EMPTY_DOC_CONTENT,
      pageSettings: { ...DEFAULT_PAGE_SETTINGS, ...data?.pageSettings },
      metadata: data?.metadata ?? {},
    };
    const doc = await documentsApi.create(payload);
    const pageSettings = { ...DEFAULT_PAGE_SETTINGS, ...doc.pageSettings };
    const pipeline = runPipeline(doc.content, [], pageSettings);
    set({
      document: doc,
      isDirty: false,
      saveStatus: "saved",
      blockMeasurements: [],
      contentRevision: get().contentRevision + 1,
      ...pipeline,
    });
    await get().fetchDocumentList();
    return doc._id!;
  },

  saveDocument: async () => {
    const { document, isDirty } = get();
    if (!document?._id || !isDirty) return;

    set({ saveStatus: "saving" });
    try {
      const updated = await documentsApi.update(document._id, {
        title: document.title,
        content: document.content,
        pageSettings: document.pageSettings,
        metadata: document.metadata,
      });
      set({
        document: updated,
        isDirty: false,
        saveStatus: "saved",
        lastSavedAt: updated.updatedAt ?? new Date().toISOString(),
      });
      localStorage.removeItem(DRAFT_KEY);
      await get().fetchDocumentList();
    } catch (err) {
      console.error("Save failed:", err);
      set({ saveStatus: "error" });
      throw err;
    }
  },

  deleteDocument: async (id) => {
    await documentsApi.delete(id);
    const { document } = get();
    if (document?._id === id) {
      get().reset();
    }
    await get().fetchDocumentList();
  },

  renameDocument: async (id, title) => {
    await documentsApi.rename(id, title);
    const { document } = get();
    if (document?._id === id) {
      set({ document: { ...document, title } });
    }
    await get().fetchDocumentList();
  },

  reset: () => {
    set({
      document: null,
      isDirty: false,
      saveStatus: "idle",
      previewBlocks: [],
      previewPages: [{ pageNumber: 1, blocks: [] }],
      blockMeasurements: [],
    });
  },
}));
