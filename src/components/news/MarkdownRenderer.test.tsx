import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer, buildSrcSet } from './MarkdownRenderer';
import type { MediaVariant } from '@/types/media';

describe('MarkdownRenderer', () => {
  it('renders basic markdown paragraphs', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders headings with typographic hierarchy', () => {
    const md = '# Heading 1\n\n## Heading 2\n\n### Heading 3';
    render(<MarkdownRenderer content={md} />);

    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    const h3 = screen.getByRole('heading', { level: 3 });

    expect(h1).toHaveTextContent('Heading 1');
    expect(h2).toHaveTextContent('Heading 2');
    expect(h3).toHaveTextContent('Heading 3');

    // Verify typographic hierarchy classes
    expect(h1.className).toContain('font-display');
    expect(h1.className).toContain('text-3xl');
    expect(h2.className).toContain('text-2xl');
    expect(h3.className).toContain('text-xl');
  });

  it('renders paragraphs with readable line length (max-w-[65ch])', () => {
    render(<MarkdownRenderer content="A paragraph of text." />);
    const p = screen.getByText('A paragraph of text.');
    expect(p.className).toContain('max-w-[65ch]');
  });

  it('renders links with accent color styling', () => {
    render(<MarkdownRenderer content="[Click here](https://example.com)" />);
    const link = screen.getByRole('link', { name: 'Click here' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link.className).toContain('text-accent-primary');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders internal links without target="_blank"', () => {
    render(<MarkdownRenderer content="[Internal](/about)" />);
    const link = screen.getByRole('link', { name: 'Internal' });
    expect(link).toHaveAttribute('href', '/about');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders images with lazy loading', () => {
    render(<MarkdownRenderer content="![Alt text](https://example.com/image.jpg)" />);
    const img = screen.getByAltText('Alt text');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('renders CDN images with responsive srcset', () => {
    const cdnUrl = 'https://cdn.comic-curated.com/articles/test/abc123/768w.webp';
    render(<MarkdownRenderer content={`![CDN image](${cdnUrl})`} />);
    const img = screen.getByAltText('CDN image');
    expect(img).toHaveAttribute('srcset');
    expect(img.getAttribute('srcset')).toContain('480w');
    expect(img.getAttribute('srcset')).toContain('768w');
    expect(img.getAttribute('srcset')).toContain('1200w');
  });

  it('renders non-CDN images without srcset', () => {
    render(<MarkdownRenderer content="![Local](https://example.com/image.jpg)" />);
    const img = screen.getByAltText('Local');
    expect(img).not.toHaveAttribute('srcset');
  });

  it('renders code blocks with dark background styling', () => {
    const md = '```javascript\nconst x = 1;\n```';
    const { container } = render(<MarkdownRenderer content={md} />);
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre!.className).toContain('bg-bg-deep');
    expect(pre!.className).toContain('font-data');
  });

  it('renders inline code with surface background', () => {
    render(<MarkdownRenderer content="Use `npm install` to install." />);
    const code = screen.getByText('npm install');
    expect(code.tagName).toBe('CODE');
    expect(code.className).toContain('bg-surface-elevated/50');
    expect(code.className).toContain('font-data');
  });

  it('renders GFM tables', () => {
    const md = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    const { container } = render(<MarkdownRenderer content={md} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
  });

  it('renders GFM strikethrough', () => {
    render(<MarkdownRenderer content="~~deleted~~" />);
    const del = screen.getByText('deleted');
    expect(del.tagName).toBe('DEL');
    expect(del.className).toContain('line-through');
  });

  it('applies custom className to the container', () => {
    const { container } = render(
      <MarkdownRenderer content="Test" className="custom-class" />,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('custom-class');
    expect(article!.className).toContain('max-w-prose');
  });

  it('wraps content in an article element with editorial styling', () => {
    const { container } = render(<MarkdownRenderer content="Content" />);
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article!.className).toContain('prose-editorial');
    expect(article!.className).toContain('max-w-prose');
  });
});

describe('buildSrcSet', () => {
  it('builds srcset string from variants filtered by format', () => {
    const variants: MediaVariant[] = [
      { width: 480, format: 'webp', url: 'https://cdn.example.com/480w.webp', size: 1000 },
      { width: 768, format: 'webp', url: 'https://cdn.example.com/768w.webp', size: 2000 },
      { width: 480, format: 'avif', url: 'https://cdn.example.com/480w.avif', size: 800 },
      { width: 768, format: 'avif', url: 'https://cdn.example.com/768w.avif', size: 1600 },
    ];

    const webpSrcSet = buildSrcSet(variants, 'webp');
    expect(webpSrcSet).toBe(
      'https://cdn.example.com/480w.webp 480w, https://cdn.example.com/768w.webp 768w',
    );

    const avifSrcSet = buildSrcSet(variants, 'avif');
    expect(avifSrcSet).toBe(
      'https://cdn.example.com/480w.avif 480w, https://cdn.example.com/768w.avif 768w',
    );
  });

  it('returns empty string when no variants match format', () => {
    const variants: MediaVariant[] = [
      { width: 480, format: 'avif', url: 'https://cdn.example.com/480w.avif', size: 800 },
    ];
    expect(buildSrcSet(variants, 'webp')).toBe('');
  });

  it('defaults to webp format', () => {
    const variants: MediaVariant[] = [
      { width: 480, format: 'webp', url: 'https://cdn.example.com/480w.webp', size: 1000 },
      { width: 480, format: 'avif', url: 'https://cdn.example.com/480w.avif', size: 800 },
    ];
    expect(buildSrcSet(variants)).toBe('https://cdn.example.com/480w.webp 480w');
  });
});
