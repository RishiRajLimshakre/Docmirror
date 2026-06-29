import { useEffect, useRef, useCallback } from 'react';
import { useDocumentStore } from '@/store/documentStore';

const AUTO_SAVE_DELAY_MS = 3000;

export function useAutoSave(enabled = true) {
  const saveDocument = useDocumentStore((s) => s.saveDocument);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const documentId = useDocumentStore((s) => s.document?._id);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerSave = useCallback(async () => {
    try {
      await saveDocument();
    } catch {
      // error state handled in store
    }
  }, [saveDocument]);

  useEffect(() => {
    if (!enabled || !isDirty || !documentId) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(triggerSave, AUTO_SAVE_DELAY_MS);

    return () => clearTimeout(timerRef.current);
  }, [enabled, isDirty, documentId, triggerSave]);

  // Save on page unload if dirty
  useEffect(() => {
    const handler = () => {
      if (isDirty && documentId) {
        navigator.sendBeacon?.(
          `/api/documents/${documentId}`,
          new Blob(
            [JSON.stringify(useDocumentStore.getState().document)],
            { type: 'application/json' }
          )
        );
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, documentId]);
}
