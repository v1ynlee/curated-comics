'use client';

/* eslint-disable @next/next/no-img-element */

// ============================================================
// MarkdownRenderer — editorial markdown rendering with
// responsive images, syntax highlighting, and typographic hierarchy
// Source of truth: .kiro/specs/platform-evolution-planning/requirements.md
//                  Requirements 11.4, 16.1
// ============================================================

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Children, isValidElement, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';
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

function MarkdownImage({
  src,
  alt,
  ...props
}: ComponentPropsWithoutRef<'img'> & { node?: unknown }) {
  const domProps = { ...props };
  delete domProps.node;
  const imgSrc = typeof src === 'string' ? src : undefined;
  const isCdnImage = imgSrc ? CDN_PATTERN.test(imgSrc) : false;

  if (isCdnImage && imgSrc) {
    const widths = [480, 768, 1200];
    const srcSet = widths
      .map((w) => {
        const variantUrl = imgSrc.replace(/\/\d+w\./, `/${w}w.`);
        return `${variantUrl} ${w}w`;
      })
      .join(', ');

    return (
      <figure className="my-10 md:-mx-8">
        <img
          src={imgSrc}
          srcSet={srcSet}
          sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, 1200px"
          alt={alt || ''}
          loading="lazy"
          decoding="async"
          className="h-auto w-full rounded-lg border border-white/10 bg-bg-surface object-cover"
          {...domProps}
        />
        {alt && (
          <figcaption className="mt-3 text-center text-sm italic text-text-tertiary">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="my-10 md:-mx-8">
      <img
        src={imgSrc}
        alt={alt || ''}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-lg border border-white/10 bg-bg-surface object-cover"
        {...domProps}
      />
      {alt && (
        <figcaption className="mt-3 text-center text-sm italic text-text-tertiary">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Custom components for react-markdown with editorial typography
 * and responsive image handling.
 */
const markdownComponents: Components = {
  // ── Headings — typographic hierarchy with generous spacing ──
  h1: ({ children, ...props }) => (
    <h1
      className="mt-14 mb-6 font-display text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-4xl"
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }) => (
    <h2
      className="mt-12 mb-4 font-display text-2xl font-semibold leading-snug text-text-primary md:text-3xl"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }) => (
    <h3
      className="mt-9 mb-3 font-display text-xl font-semibold leading-snug text-text-primary md:text-2xl"
      {...props}
    >
      {children}
    </h3>
  ),

  h4: ({ children, ...props }) => (
    <h4
      className="mt-7 mb-2 font-display text-lg font-medium leading-snug text-text-primary md:text-xl"
      {...props}
    >
      {children}
    </h4>
  ),

  // ── Paragraphs — readable line length (60-75 chars) ──
  p: ({ children, ...props }) => (
    (() => {
      const childArray = Children.toArray(children);
      const onlyChild = childArray[0];

      if (childArray.length === 1 && isValidElement(onlyChild) && onlyChild.type === MarkdownImage) {
        return <>{children}</>;
      }

      return (
        <p
          className="mb-7 max-w-[65ch] text-base leading-8 text-text-secondary md:text-lg md:leading-9"
          {...props}
        >
          {children}
        </p>
      );
    })()
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
  img: MarkdownImage,

  // ── Code blocks — dark background with syntax highlighting ──
  pre: ({ children, ...props }) => (
    <pre
      className="my-8 overflow-x-auto rounded-lg border border-white/10 bg-bg-deep p-4 font-data text-sm leading-relaxed"
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
      className="my-10 rounded-lg border border-accent-primary/30 bg-accent-primary/10 px-5 py-4 italic text-text-secondary"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // ── Lists — proper spacing ──
  ul: ({ children, ...props }) => (
    <ul
      className="my-5 ml-6 max-w-[70ch] list-disc space-y-2 text-text-secondary"
      {...props}
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol
      className="my-5 ml-6 max-w-[70ch] list-decimal space-y-2 text-text-secondary"
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li className="text-base leading-8 md:text-lg md:leading-9" {...props}>
      {children}
    </li>
  ),

  // ── Tables — GFM table support ──
  table: ({ children, ...props }) => (
    <div className="my-10 overflow-x-auto rounded-lg border border-white/10">
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
        'prose-editorial',
        'max-w-prose',
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
