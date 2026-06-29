import { useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { importDocxFile, isDocxFile } from '@/lib/import/docxImport';

interface ImportDocxButtonProps {
  /** Called with parsed content and suggested title */
  onImport: (content: Record<string, unknown>, title: string, warnings: string[]) => void | Promise<void>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  label?: string;
  /** If true, prompt before importing when content may be replaced */
  confirmReplace?: boolean;
  hasExistingContent?: boolean;
}

export function ImportDocxButton({
  onImport,
  variant = 'outline',
  size = 'sm',
  label = 'Import DOCX',
  confirmReplace = false,
  hasExistingContent = false,
}: ImportDocxButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const importingRef = useRef(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (importingRef.current) return;
      if (!isDocxFile(file)) {
        alert('Please select a .docx file.');
        return;
      }

      if (confirmReplace && hasExistingContent) {
        const ok = window.confirm(
          'Importing will replace the current document content. Continue?'
        );
        if (!ok) return;
      }

      importingRef.current = true;
      try {
        const { content, title, warnings } = await importDocxFile(file);
        await onImport(content, title, warnings);

        if (warnings.length > 0) {
          console.warn('DOCX import warnings:', warnings);
        }
      } catch (err) {
        console.error('DOCX import failed:', err);
        alert(`Failed to import DOCX: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        importingRef.current = false;
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [onImport, confirmReplace, hasExistingContent]
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => inputRef.current?.click()}
        title="Import a Word .docx file"
      >
        <Upload className="mr-1 h-3 w-3" />
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </>
  );
}
