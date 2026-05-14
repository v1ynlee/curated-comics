'use client';

// ============================================================
// MarkdownRenderer — editorial markdown rendering with
// responsive images, syntax highlighting, and typographic hierarchy
// Source of truth: .kiro/specs/platform-evolution-planning/requirements.md
//                  Requirements 11.4, 16.1
// ============================================================

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/cn';
import type { MediaVariant } from '@/types/media';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  /** Markdown content string to render */
  content: string;
  /** Optional additional CSS class names */
  className?: string;
}

/**
 * CDN pattern to detect images served from the R2/CDN layer.
 * Matches URLs containing common CDN subdomains or R2 public URL patterns.
 */
const CDN_PATTERN = /cdn\.|r2\..*\.com|cloudflarestorage\.com/i;

/**
 * Build a responsive srcset string from media asset variants.
 * Groups by format and returns the best available format (AVIF preferred, WebP fallback).
 */
function buildSrcSet(variants: MediaVariant[], preferredFormat: 'avif' | 'webp' = 'webp'): string {
  return variants
    .filter((v) => v.format === preferredFormat)
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');
}

/**
 * Custom components for react-markdown with editorial typography
 * and responsive image handling.
 */
const markdownComponents: Components = {
  // ── Headings — typographic hierarchy with generous spacing ──
  h1: ({ children, ...props }) => (
    <h1
      className="font-display text-3xl md:text-4xl font-bold text-text-primary mt-12 mb-6 leading-tight tracking-tight"
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }) => (
    <h2
      className="font-display text-2xl md:text-3xl font-semibold text-text-primary mt-10 mb-4 leading-snug"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }) => (
    <h3
      className="font-display text-xl md:text-2xl font-semibold text-text-primary mt-8 mb-3 leading-snug"
      {...props}
    >
      {children}
    </h3>
  ),

  h4: ({ children, ...props }) => (
    <h4
      className="font-display text-lg md:text-xl font-medium text-text-primary mt-6 mb-2 leading-snug"
      {...props}
    >
      {children}
    </h4>
  ),

  // ── Paragraphs — readable line length (60-75 chars) ──
  p: ({ children, ...props }) => (
    <p
      className="text-text-secondary text-base md:text-lg leading-relaxed mb-6 max-w-[65ch]"
      {...props}
    >
      {children}
    </p>
  ),

  // ── Links — accent color with hover state ──
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-accent-primary hover:text-accent-primary/80 underline underline-offset-2 decoration-accent-primary/40 hover:decoration-accent-primary/80 transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // ── Images — responsive srcset for CDN images, lazy loading ──
  img: ({ src, alt, ...props }) => {
    const imgSrc = typeof src === 'string' ? src : undefined;
    const isCdnImage = imgSrc ? CDN_PATTERN.test(imgSrc) : false;

    if (isCdnImage && imgSrc) {
      // For CDN images, generate responsive srcset at common breakpoints
      const widths = [480, 768, 1200];
      const srcSet = widths
        .map((w) => {
          // Derive variant URL by replacing width descriptor in the URL path
          // CDN URLs follow pattern: .../content_hash/{width}w.{format}
          const variantUrl = imgSrc.replace(/\/\d+w\./, `/${w}w.`);
          return `${variantUrl} ${w}w`;
        })
        .join(', ');

      return (
        <figure className="my-8">
          <img
            src={imgSrc}
            srcSet={srcSet}
            sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1200px"
            alt={alt || ''}
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-md"
            {...props}
          />
          {alt && (
            <figcaption className="mt-2 text-center text-text-tertiary text-sm italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    // Non-CDN images: render normally with lazy loading
    return (
      <figure className="my-8">
        <img
          src={imgSrc}
          alt={alt || ''}
          loading="lazy"
          decoding="async"
          className="w-full h-auto rounded-md"
          {...props}
        />
        {alt && (
          <figcaption className="mt-2 text-center text-text-tertiary text-sm italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },

  // ── Code blocks — dark background with syntax highlighting ──
  pre: ({ children, ...props }) => (
    <pre
      className="my-6 p-4 rounded-lg bg-bg-deep border border-white/5 overflow-x-auto text-sm leading-relaxed font-data"
      {...props}
    >
      {children}
    </pre>
  ),

  code: ({ children, className, ...props }) => {
    // Inline code (no className from rehype-highlight)
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-sm bg-surface-elevated/50 text-accent-primary font-data text-[0.9em]"
          {...props}
        >
          {children}
        </code>
      );
    }

    // Block code (has language class from rehype-highlight)
    return (
      <code className={cn('font-data text-text-primary', className)} {...props}>
        {children}
      </code>
    );
  },

  // ── Blockquotes — editorial pull-quote style ──
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-8 pl-6 border-l-3 border-accent-primary/60 italic text-text-secondary"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // ── Lists — proper spacing ──
  ul: ({ children, ...props }) => (
    <ul
      className="my-4 ml-6 list-disc space-y-2 text-text-secondary max-w-[65ch]"
      {...props}
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol
      className="my-4 ml-6 list-decimal space-y-2 text-text-secondary max-w-[65ch]"
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li className="text-base md:text-lg leading-relaxed" {...props}>
      {children}
    </li>
  ),

  // ── Tables — GFM table support ──
  table: ({ children, ...props }) => (
    <div className="my-8 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm text-left" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }) => (
    <thead className="bg-surface-elevated/30 text-text-primary font-heading uppercase text-xs tracking-wider" {...props}>
      {children}
    </thead>
  ),

  th: ({ children, ...props }) => (
    <th className="px-4 py-3 border-b border-white/10" {...props}>
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td className="px-4 py-3 border-b border-white/5 text-text-secondary" {...props}>
      {children}
    </td>
  ),

  // ── Horizontal rule — decorative separator ──
  hr: (props) => (
    <hr
      className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent"
      {...props}
    />
  ),

  // ── Strikethrough (GFM) ──
  del: ({ children, ...props }) => (
    <del className="text-text-tertiary line-through" {...props}>
      {children}
    </del>
  ),

  // ── Strong/emphasis ──
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-text-primary" {...props}>
      {children}
    </strong>
  ),

  em: ({ children, ...props }) => (
    <em className="italic text-text-accent" {...props}>
      {children}
    </em>
  ),
};

/**
 * MarkdownRenderer — renders markdown content with editorial typography,
 * responsive images, GFM support, and code syntax highlighting.
 *
 * Uses react-markdown with remark-gfm for GitHub Flavored Markdown
 * (tables, strikethrough, autolinks, task lists) and rehype-highlight
 * for code block syntax highlighting.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <article
      className={cn(
        // Editorial typography container
        'prose-editorial',
        // Max-width for readable line length (60-75 chars)
        'max-w-prose',
        // Generous whitespace
        'space-y-0',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

export { buildSrcSet };
