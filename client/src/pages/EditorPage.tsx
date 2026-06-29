import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { ImportDocxButton } from '@/components/documents/ImportDocxButton';
import { SaveIndicator } from '@/components/ui/SaveIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ZoomIn, ZoomOut } from 'lucide-react';


function EditorZoomControls() {
  const editorZoom = useDocumentStore((s) => s.editorZoom);
  const setEditorZoom = useDocumentStore((s) => s.setEditorZoom);

  const zoomIn = () =>
    setEditorZoom(Math.min(1.5, editorZoom + 0.05));

  const zoomOut = () =>
    setEditorZoom(Math.max(0.5, editorZoom - 0.05));

  return (
    <div className="flex items-center gap-2">
      <button onClick={zoomOut}>
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="w-12 text-center text-xs">
        {Math.round(editorZoom * 100)}%
      </span>
      <button onClick={zoomIn}>
        <ZoomIn className="h-4 w-4" />
      </button>
    </div>
  );
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fetchDocument = useDocumentStore((s) => s.fetchDocument);
  const document = useDocumentStore((s) => s.document);
  const isLoading = useDocumentStore((s) => s.isLoading);
  const saveStatus = useDocumentStore((s) => s.saveStatus);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const setTitle = useDocumentStore((s) => s.setTitle);
  const saveDocument = useDocumentStore((s) => s.saveDocument);
  const importContent = useDocumentStore((s) => s.importContent);
  const reset = useDocumentStore((s) => s.reset);
  const [error, setError] = useState<string | null>(null);
  
  useAutoSave(true);

  useEffect(() => {
    if (!id) return;
    fetchDocument(id).catch(() => setError('Document not found'));
    return () => reset();
  }, [id, fetchDocument, reset]);

  const handleSave = async () => {
    try {
      await saveDocument();
    } catch {
      // handled in store
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error ?? 'Document not found'}</p>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <Input
          value={document.title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-xs border-none bg-transparent text-base font-medium shadow-none focus-visible:ring-0"
        />

        <div className="ml-auto flex items-center gap-3">
          <ImportDocxButton
            confirmReplace
            hasExistingContent={
              Boolean(
                document.content &&
                  JSON.stringify(document.content) !==
                    JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [] }] })
              )
            }
            onImport={(content, title) => {
              importContent(content, title);
            }}
          />
          <SaveIndicator status={isDirty && saveStatus === 'idle' ? 'idle' : saveStatus} />
          <Button variant="outline" size="sm" onClick={handleSave} disabled={!isDirty}>
            <Save className="mr-1 h-3 w-3" />
            Save
          </Button>
        </div>
      </header>

      {/* Split pane: editor | preview */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 min-w-0 flex-col border-r border-border">
  {/* Editor Header */}
  <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
    <span className="text-sm font-medium">Editor</span>

    <EditorZoomControls />
  </div>

  <RichTextEditor className="flex h-full flex-col" />
</div>
        <div className="w-1/2 min-w-0">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
