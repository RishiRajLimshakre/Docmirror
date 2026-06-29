import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  const labels = {
    idle: 'Unsaved changes',
    saving: 'Saving...',
    saved: 'All changes saved',
    error: 'Save failed',
  };

  const colors = {
    idle: 'text-amber-600',
    saving: 'text-blue-600',
    saved: 'text-green-600',
    error: 'text-red-600',
  };

  return (
    <span className={cn('text-xs font-medium', colors[status], className)}>
      {labels[status]}
    </span>
  );
}
