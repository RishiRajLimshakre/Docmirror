import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useCallback } from 'react';
import { createEditorExtensions } from '@/lib/editor/extensions';
import { EditorToolbar } from './EditorToolbar';
import { useDocumentStore } from '@/store/documentStore';
import { debounce } from '@/lib/utils';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '@/lib/preview/pageConstants';



interface RichTextEditorProps {
  className?: string;
}

export function RichTextEditor({ className }: RichTextEditorProps) {
  const document = useDocumentStore((s) => s.document);
  const setContent = useDocumentStore((s) => s.setContent);
  const contentRevision = useDocumentStore((s) => s.contentRevision);
  const pageSettings = useDocumentStore((s) => s.document?.pageSettings);

  const debouncedUpdate = useCallback(
    debounce((json: Record<string, unknown>) => {
      setContent(json);
    }, 300),
    [setContent]
  );

  const editorZoom = useDocumentStore((s) => s.editorZoom);

  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: document?.content ?? { type: 'doc', content: [] },
    editorProps: {
      attributes: {
        class: 'docmirror-editor focus:outline-none h-full',
      },
    },
    onUpdate: ({ editor: ed }) => {
      debouncedUpdate(ed.getJSON() as Record<string, unknown>);
    },
  });

  // Sync editor when document is loaded or content is imported externally
  useEffect(() => {
    if (!editor || !document?.content) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(document.content);
    if (current !== incoming) {
      editor.commands.setContent(document.content, false);
    }
  }, [editor, document?._id, contentRevision]);

  if (!editor) return null;

 


  return (
    <div className={className}>
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-auto bg-gray-100 p-6">
        <div
          className="mx-auto flex flex-col items-center gap-8"
          style={{
            transform: `scale(${editorZoom})`,
            transformOrigin: 'top center',
            width: A4_WIDTH_PX * editorZoom,
          }}
        >
          <div
            className="relative bg-white shadow-lg"
            style={{
              width: A4_WIDTH_PX,
             minHeight: A4_HEIGHT_PX,
              padding: `${pageSettings?.marginTop ?? 72}px ${pageSettings?.marginRight ?? 72}px ${pageSettings?.marginBottom ?? 72}px ${pageSettings?.marginLeft ?? 72}px`,
              boxSizing: 'border-box',
              
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
