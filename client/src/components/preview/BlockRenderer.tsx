import type { PreviewBlock } from '@/types/document';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  block: PreviewBlock;
  lineSpacing?: number;
  className?: string;
}

const ALIGN_CLASSES: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export function BlockRenderer({ block, lineSpacing = 1.5, className }: BlockRendererProps) {
  const alignClass = block.align ? (ALIGN_CLASSES[block.align] ?? 'text-left') : 'text-left';

  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level ?? 1}` as keyof JSX.IntrinsicElements;
      const sizeClass = {
        1: 'text-3xl font-bold mb-4',
        2: 'text-2xl font-semibold mb-3',
        3: 'text-xl font-semibold mb-2',
        4: 'text-lg font-medium mb-2',
      }[block.level ?? 1];
      return (
        <Tag
          className={cn(sizeClass, alignClass, className)}
          style={{ lineHeight: lineSpacing }}
          dangerouslySetInnerHTML={{ __html: block.html ?? '' }}
        />
      );
    }

    case 'paragraph':
      return (
        <p
          className={cn('mb-3 text-base text-gray-900', alignClass, className)}
          style={{ lineHeight: lineSpacing }}
          dangerouslySetInnerHTML={{ __html: block.html ?? '' }}
        />
      );

    case 'bulletList':
      return (
        <ul className={cn('mb-3 list-disc pl-6 space-y-1', className)} style={{ lineHeight: lineSpacing }}>
          {block.items?.map((item, i) => (
            <li key={i} className="text-base text-gray-900" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol className={cn('mb-3 list-decimal pl-6 space-y-1', className)} style={{ lineHeight: lineSpacing }}>
          {block.items?.map((item, i) => (
            <li key={i} className="text-base text-gray-900" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>
      );

    case 'blockquote':
      return (
        <blockquote
          className={cn('mb-3 border-l-4 border-gray-300 pl-4 italic text-gray-700', className)}
          style={{ lineHeight: lineSpacing }}
          dangerouslySetInnerHTML={{ __html: block.html ?? '' }}
        />
      );

    case 'horizontalRule':
      return <hr className={cn('my-4 border-gray-300', className)} />;

    case 'pageBreak':
      return null;

    case 'image':
      return (
        <div className={cn('mb-3', alignClass === 'text-center' && 'text-center', className)}>
          <img
            src={block.src}
            alt={block.alt ?? ''}
            style={{ maxWidth: block.width ? `${block.width}px` : '100%', width: block.width ? `${block.width}px` : 'auto' }}
            className="inline-block max-w-full h-auto rounded"
          />
        </div>
      );

    case 'table':
  return (
    <div className="mb-3 overflow-x-auto">
      <table
        className="w-full border-collapse border border-gray-300 text-sm"
        style={{
          tableLayout: 'fixed',
          width: '100%',
        }}
      >
        <tbody>
          {block.tableData?.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border border-gray-300 px-3 py-2 align-top"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className="mb-3 overflow-x-auto">
      <table
        className="w-full border-collapse border border-gray-300 text-sm table-fixed"
        style={{ tableLayout: 'fixed' }}
      >
        <tbody>
          {block.tableData?.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border border-gray-300 px-3 py-2 align-top break-words"
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

      return (
        <div className={cn('mb-3 overflow-x-auto', className)}>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <tbody>
              {block.tableData?.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        'border border-gray-300 px-3 py-2',
                        ri === 0 && 'bg-gray-50 font-medium'
                      )}
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'codeBlock':
      return (
        <pre className={cn('mb-3 rounded bg-gray-100 p-4 text-sm font-mono overflow-x-auto', className)}>
          <code>{block.text}</code>
        </pre>
      );

    default:
      return null;
  }
}
