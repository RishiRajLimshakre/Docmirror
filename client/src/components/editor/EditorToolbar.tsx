import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus, Undo, Redo, Image, Table, Link, Code,
  Heading1, Heading2, Heading3, RemoveFormatting, SeparatorHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FONT_FAMILIES, FONT_SIZES, LINE_SPACINGS, TEXT_COLORS, HIGHLIGHT_COLORS } from '@/lib/editor/extensions';
import { cn } from '@/lib/utils';
import { useCallback, useRef } from 'react';
import { uploadsApi } from '@/api/client';

interface EditorToolbarProps {
  editor: Editor | null;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn('h-8 w-8 shrink-0', active && 'bg-primary/10 text-primary')}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border shrink-0" />;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      try {
        const result = await uploadsApi.uploadImage(file);
        editor
          .chain()
          .focus()
          .insertContent([
            { type: 'paragraph' },
            { type: 'image', attrs: { src: result.url, alt: file.name } },
            { type: 'paragraph' },
          ])
          .run();

      } catch (err) {
        console.error('Image upload failed:', err);
      }
      e.target.value = '';
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-card px-3 py-2">
      {/* Undo / Redo */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists & blocks */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor
        .chain()
        .focus()
        .insertContent([
          { type: 'paragraph' },
          { type: 'pageBreak' },
          { type: 'paragraph' },
        ])
        .run()}

        title="Page break (Ctrl+Enter)">
        <SeparatorHorizontal className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Font family */}
      <select
        className="h-8 rounded border border-border bg-background px-2 text-xs"
        value={editor.getAttributes('textStyle').fontFamily ?? ''}
        onChange={(e) => {
          if (e.target.value) {
            editor.chain().focus().setFontFamily(e.target.value).run();
          } else {
            editor.chain().focus().unsetFontFamily().run();
          }
        }}
        title="Font family"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Font size */}
      <select
        className="h-8 w-16 rounded border border-border bg-background px-2 text-xs"
        value={editor.getAttributes('textStyle').fontSize ?? '16px'}
        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        title="Font size"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s.replace('px', '')}</option>
        ))}
      </select>

      {/* Line spacing */}
      <select
        className="h-8 w-16 rounded border border-border bg-background px-2 text-xs"
        defaultValue="1.5"
        onChange={(e) => editor.chain().focus().setLineSpacing(e.target.value).run()}
        title="Line spacing"
      >
        {LINE_SPACINGS.map((ls) => (
          <option key={ls.value} value={ls.value}>{ls.label}</option>
        ))}
      </select>

      <ToolbarDivider />

      {/* Colors */}
      <div className="flex items-center gap-1" title="Text color">
        {TEXT_COLORS.slice(0, 5).map((color) => (
          <button
            key={color}
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: color }}
            onClick={() => editor.chain().focus().setColor(color).run()}
          />
        ))}
      </div>

      <div className="flex items-center gap-1" title="Highlight color">
        {HIGHLIGHT_COLORS.slice(0, 4).map((color) => (
          <button
            key={color}
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: color }}
            onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
          />
        ))}
      </div>

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Insert image">
        <Image className="h-4 w-4" />
      </ToolbarButton>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <ToolbarButton
        onClick={() => editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()}
        title="Insert table"
      >
        <Table className="h-4 w-4" />
      </ToolbarButton>

      {
        editor.isActive('table') && (
          <>
            <ToolbarDivider />

            {/* Row controls */}
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Add row above"
            >
              ⬆️
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add row below"
            >
              ⬇️
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Delete row"
            >
              ❌R
            </ToolbarButton>

            <ToolbarDivider />

            {/* Column controls */}
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Add column left"
            >
              ⬅️
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add column right"
            >
              ➡️
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete column"
            >
              ❌C
            </ToolbarButton>

            <ToolbarDivider />

            {/* Delete table */}
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete table"
            >
              🗑️
            </ToolbarButton>
          </>
        )
      }

      <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert link">
        <Link className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        title="Clear formatting"
      >
        <RemoveFormatting className="h-4 w-4" />
      </ToolbarButton>
    </div >
  );
}
