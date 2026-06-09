'use client';

// ============================================================
// RichTextEditor — Tiptap-based rich text editor for Reviews card
// Provides toolbar with Bold, Italic, Image embed, Spoiler block,
// Warning block, Undo, and Redo actions using lucide-react icons.
// Requirements: 10.1, 10.2, 10.3
// ============================================================

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  Bold,
  Italic,
  Image as ImageIcon,
  AlertTriangle,
  AlertCircle,
  Undo2,
  Redo2,
} from 'lucide-react';

// ── Props ─────────────────────────────────────────────────────

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// ── Toolbar Button ────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={cn(
        'p-1.5 rounded-md transition-colors duration-150',
        'hover:bg-white/10',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
        isActive && 'bg-accent-primary/20 text-accent-primary',
        !isActive && 'text-text-secondary',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
      )}
    >
      {children}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────

export function RichTextEditor({
  content,
  onChange,
  disabled = false,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[200px] px-4 py-3 outline-none',
          'prose prose-invert prose-sm max-w-none',
          'prose-headings:font-heading prose-headings:text-text-primary',
          'prose-p:text-text-secondary prose-p:leading-relaxed',
          'prose-strong:text-text-primary',
          'prose-code:text-accent-secondary prose-code:bg-bg-surface/60 prose-code:px-1 prose-code:rounded',
        ),
        'data-placeholder': placeholder ?? 'Write your review...',
      },
    },
  });

  // Sync disabled state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-text-tertiary text-sm">
        Loading editor...
      </div>
    );
  }

  // ── Toolbar actions ─────────────────────────────────────────

  const handleImageEmbed = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSpoilerBlock = () => {
    // Insert a spoiler block as a blockquote with a spoiler marker
    editor
      .chain()
      .focus()
      .toggleBlockquote()
      .insertContent('<p><strong>Spoiler:</strong> </p>')
      .run();
  };

  const handleWarningBlock = () => {
    // Insert a warning block as a blockquote with a warning marker
    editor
      .chain()
      .focus()
      .toggleBlockquote()
      .insertContent('<p><strong>Warning:</strong> </p>')
      .run();
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-bg-deep/60 overflow-hidden',
        disabled && 'opacity-60 pointer-events-none',
      )}
    >
      {/* Toolbar */}
      <div
        className={cn(
          'flex items-center gap-1 px-3 py-2',
          'border-b border-white/10 bg-bg-surface/30',
        )}
        role="toolbar"
        aria-label="Text formatting toolbar"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={disabled}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={disabled}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" aria-hidden="true" />

        <ToolbarButton
          onClick={handleImageEmbed}
          disabled={disabled}
          title="Embed image"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={handleSpoilerBlock}
          isActive={editor.isActive('blockquote')}
          disabled={disabled}
          title="Spoiler block"
        >
          <AlertTriangle className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={handleWarningBlock}
          disabled={disabled}
          title="Warning block"
        >
          <AlertCircle className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" aria-hidden="true" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
