import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentList } from '@/components/documents/DocumentList';
import { CreateDocumentDialog } from '@/components/documents/CreateDocumentDialog';
import { ImportDocxButton } from '@/components/documents/ImportDocxButton';
import { getTemplate } from '@/lib/templates';
import { DEFAULT_PAGE_SETTINGS } from '@/types/document';
import { checkHealth } from '@/api/client';
import { Spinner } from '@/components/ui/Spinner';
import dashboardBg from '@/assets/dashboard-bg.jpg';

export function DashboardPage() {
  const navigate = useNavigate();
  const fetchDocumentList = useDocumentStore((s) => s.fetchDocumentList);
  const createDocument = useDocumentStore((s) => s.createDocument);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchDocumentList();
    checkHealth().then(setApiOnline);
  }, [fetchDocumentList]);

  const handleCreate = async (templateId: string) => {
    const template = getTemplate(templateId);
    const id = await createDocument({
      title: template?.name === 'Blank Document' ? 'Untitled Document' : template?.name ?? 'Untitled Document',
      content: template?.content,
      pageSettings: template?.pageSettings
        ? { ...DEFAULT_PAGE_SETTINGS, ...template.pageSettings }
        : undefined,
      metadata: { templateId },
    });
    setDialogOpen(false);
    navigate(`/editor/${id}`);
  };

  const handleImportDocx = async (
    content: Record<string, unknown>,
    title: string,
    _warnings: string[]
  ) => {
    const id = await createDocument({
      title,
      content,
      metadata: { templateId: 'imported-docx' },
    });
    navigate(`/editor/${id}`);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${dashboardBg})`,
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">DocMirror</h1>
              <p className="mt-2 text-muted-foreground">
                Word-like document editor with live paginated PDF preview
              </p>
            </div>
            <ImportDocxButton
              label="Import DOCX"
              size="md"
              onImport={handleImportDocx}
            />
          </div>
        </div>

        {apiOnline === null ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <DocumentList onCreateNew={() => setDialogOpen(true)} />
        )}

        <CreateDocumentDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={handleCreate}
        />
      </div>

    </div>
  );
}
