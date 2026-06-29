import { Link } from 'react-router-dom';
import { FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { formatRelativeDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useState } from 'react';

interface DocumentListProps {
  onCreateNew: () => void;
}

export function DocumentList({ onCreateNew }: DocumentListProps) {
  const documentList = useDocumentStore((s) => s.documentList);
  const isListLoading = useDocumentStore((s) => s.isListLoading);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);
  const renameDocument = useDocumentStore((s) => s.renameDocument);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleRename = async (id: string) => {
    if (renameValue.trim()) {
      await renameDocument(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      await deleteDocument(id);
    }
  };

  if (isListLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Documents</h2>
        <Button onClick={onCreateNew}>
          <Plus className="mr-1 h-4 w-4" />
          New Document
        </Button>
      </div>

      {documentList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No documents yet</p>
          <Button className="mt-4" onClick={onCreateNew}>
            Create your first document
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documentList.map((doc) => (
            <div
              key={doc._id}
              className="group relative rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <Link to={`/editor/${doc._id}`} className="block">
                <div className="mb-2 flex items-start gap-2">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {renamingId === doc._id ? (
                    <input
                      className="w-full rounded border px-2 py-1 text-sm"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(doc._id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(doc._id)}
                      autoFocus
                      onClick={(e) => e.preventDefault()}
                    />
                  ) : (
                    <h3 className="font-medium line-clamp-2">{doc.title}</h3>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formatRelativeDate(doc.updatedAt)}
                </p>
                {doc.metadata?.templateId && (
                  <span className="mt-2 inline-block rounded bg-accent px-2 py-0.5 text-xs">
                    {doc.metadata.templateId}
                  </span>
                )}
              </Link>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    setRenamingId(doc._id);
                    setRenameValue(doc.title);
                  }}
                  title="Rename"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(doc._id, doc.title);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
