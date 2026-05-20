import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ── Mocks ─────────────────────────────────────────────────────

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/image to render a plain img
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// ── Imports (after mocks) ─────────────────────────────────────

import { SummaryBar } from '@/components/studio/SummaryBar';
import { ActivityFeed, type ActivityEntry } from '@/components/studio/ActivityFeed';

// ── Req 14.1, 14.2, 14.3: Dashboard shows stats (SummaryBar) ──

describe('SummaryBar (Req 14.1, 14.2, 14.3)', () => {
  const mockStats = [
    { label: 'Titles', value: 97, href: '/studio/titles' },
    { label: 'Articles', value: 12, href: '/studio/articles' },
    { label: 'Media', value: 340, href: '/studio/media' },
    { label: 'Artists', value: 42, href: '/studio/titles' },
    { label: 'Authors', value: 18, href: '/studio/titles' },
    { label: 'Genres', value: 7, href: '/studio/curation' },
  ];

  it('renders all stat labels', () => {
    render(<SummaryBar stats={mockStats} />);

    expect(screen.getByText('Titles')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Artists')).toBeInTheDocument();
    expect(screen.getByText('Authors')).toBeInTheDocument();
    expect(screen.getByText('Genres')).toBeInTheDocument();
  });

  it('renders stat values correctly', () => {
    render(<SummaryBar stats={mockStats} />);

    expect(screen.getByText('97')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('340')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('formats large values with locale string (e.g., 1,234)', () => {
    const stats = [{ label: 'Titles', value: 1234, href: '/studio/titles' }];
    render(<SummaryBar stats={stats} />);

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders each stat as a link to its section', () => {
    render(<SummaryBar stats={mockStats} />);

    const links = screen.getAllByRole('listitem');
    expect(links[0].closest('a')).toHaveAttribute('href', '/studio/titles');
    expect(links[1].closest('a')).toHaveAttribute('href', '/studio/articles');
    expect(links[2].closest('a')).toHaveAttribute('href', '/studio/media');
  });

  it('renders with role="list" for accessibility', () => {
    render(<SummaryBar stats={mockStats} />);

    expect(screen.getByRole('list', { name: 'Content overview' })).toBeInTheDocument();
  });
});

// ── Req 15.1: Activity section renders correct number of entries ──

describe('ActivityFeed (Req 15.1)', () => {
  function makeEntry(id: string, overrides?: Partial<ActivityEntry>): ActivityEntry {
    return {
      id,
      type: 'title',
      label: `Title ${id}`,
      meta: 'Tier S',
      href: `/studio/titles/title-${id}`,
      createdAt: new Date(Date.now() - parseInt(id) * 60000).toISOString(),
      thumbnail: `/images/covers/title-${id}-320w.avif`,
      ...overrides,
    };
  }

  it('renders 0 entries when given an empty list', () => {
    render(<ActivityFeed entries={[]} />);

    expect(screen.queryByTestId('activity-feed')).not.toBeInTheDocument();
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
  });

  it('renders all entries when given fewer than 8', () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeEntry(String(i + 1)));
    const { container } = render(<ActivityFeed entries={entries} />);

    const items = container.querySelectorAll('[data-testid="activity-entry"]');
    expect(items.length).toBe(5);
  });

  it('renders exactly 8 entries when given exactly 8', () => {
    const entries = Array.from({ length: 8 }, (_, i) => makeEntry(String(i + 1)));
    const { container } = render(<ActivityFeed entries={entries} />);

    const items = container.querySelectorAll('[data-testid="activity-entry"]');
    expect(items.length).toBe(8);
  });

  it('renders at most 8 entries when given more than 8', () => {
    const entries = Array.from({ length: 15 }, (_, i) => makeEntry(String(i + 1)));
    const { container } = render(<ActivityFeed entries={entries} />);

    const items = container.querySelectorAll('[data-testid="activity-entry"]');
    expect(items.length).toBe(8);
  });

  it('renders at most 8 entries when given 50 entries', () => {
    const entries = Array.from({ length: 50 }, (_, i) => makeEntry(String(i + 1)));
    const { container } = render(<ActivityFeed entries={entries} />);

    const items = container.querySelectorAll('[data-testid="activity-entry"]');
    expect(items.length).toBe(8);
  });

  it('renders entries with thumbnails for title-type items', () => {
    const entries = [makeEntry('1', { type: 'title', thumbnail: '/images/covers/test-320w.avif' })];
    const { container } = render(<ActivityFeed entries={entries} />);

    const thumbnails = container.querySelectorAll('[data-testid="activity-thumbnail"]');
    expect(thumbnails.length).toBe(1);
  });

  it('renders entries without thumbnails for genre-type items', () => {
    const entries = [makeEntry('1', { type: 'genre', thumbnail: undefined })];
    const { container } = render(<ActivityFeed entries={entries} />);

    const thumbnails = container.querySelectorAll('[data-testid="activity-thumbnail"]');
    expect(thumbnails.length).toBe(0);
  });
});
