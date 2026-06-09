'use client';

import { useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import { ArticleEditorToolbar } from './ArticleEditorToolbar';
import { InlineInsertPanel } from './InlineInsertPanel';
import { editorJsonToMarkdown, escapeHtml, markdownToEditorHtml, type EditorJsonNode } from './markdown';

interface ArticleTiptapEditorProps {
  initialBody: string;
  wordCount: number;
  readingTimeMinutes: number;
  onBodyChange: (value: string) => void;
}

export function ArticleTiptapEditor({ initialBody, wordCount, readingTimeMinutes, onBodyChange }: ArticleTiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [activeInlinePanel, setActiveInlinePanel] = useState<'link' | 'image' | null>(null);
  const initialEditorHtml = useMemo(() => markdownToEditorHtml(initialBody), [initialBody]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: 'text-accent-primary underline decoration-accent-primary/40 underline-offset-2',
          },
        },
      }),
      TiptapImage.configure({
        allowBase64: false,
        inline: false,
        HTMLAttributes: {
          class: 'article-editor-image',
        },
      }),
    ],
    content: initialEditorHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'article-editor-content',
        'aria-label': 'Article body editor',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onBodyChange(editorJsonToMarkdown(currentEditor.getJSON() as EditorJsonNode));
    },
  });

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-bg-surface/35">
      <div className="flex flex-col gap-3 border-b border-white/10 p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-medium text-text-primary">Body</h2>
          <p className="mt-1 text-xs text-text-tertiary">
            {wordCount.toLocaleString()} words, {readingTimeMinutes} min read
          </p>
        </div>
        <ArticleEditorToolbar editor={editor} onOpenPanel={setActiveInlinePanel} />
      </div>

      {activeInlinePanel && editor && (
        <div className="border-b border-white/10 bg-bg-deep/35 p-3">
          {activeInlinePanel === 'link' ? (
            <InlineInsertPanel
              label="Link URL"
              value={linkUrl}
              placeholder="https://example.com"
              onChange={setLinkUrl}
              onCancel={() => setActiveInlinePanel(null)}
              onApply={() => {
                const href = linkUrl.trim();
                if (!href) {
                  editor.chain().focus().unsetLink().run();
                } else if (editor.state.selection.empty) {
                  editor.chain().focus().insertContent(`<a href="${escapeHtml(href)}">${escapeHtml(href)}</a>`).run();
                } else {
                  editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
                }
                setLinkUrl('');
                setActiveInlinePanel(null);
              }}
            />
          ) : (
            <InlineInsertPanel
              label="Image URL"
              value={imageUrl}
              placeholder="https://example.com/image.webp"
              onChange={setImageUrl}
              onCancel={() => setActiveInlinePanel(null)}
              onApply={() => {
                const src = imageUrl.trim();
                if (src) editor.chain().focus().setImage({ src }).run();
                setImageUrl('');
                setActiveInlinePanel(null);
              }}
            />
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </section>
  );
}
