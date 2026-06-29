import { useState } from 'react';
import { X } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CreateDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (templateId: string) => void;
}

export function CreateDocumentDialog({ open, onClose, onCreate }: CreateDocumentDialogProps) {
  const [selected, setSelected] = useState('blank');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create New Document</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">Choose a template to get started</p>

        <div className="mb-6 grid gap-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelected(template.id)}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors',
                selected === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-muted-foreground">{template.description}</div>
              <div className="mt-1 text-xs text-primary">{template.category}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onCreate(selected)}>Create Document</Button>
        </div>
      </div>
    </div>
  );
}
