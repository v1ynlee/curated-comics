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

import { OverviewCard } from '@/components/studio/OverviewCard';
import { ActivityFeed, type ActivityEntry } from '@/components/studio/ActivityFeed';

// ── Req 14.1, 14.2, 14.3: Dashboard shows artist/author/genre stat cards ──

describe('OverviewCard (Req 14.1, 14.2, 14.3)', () => {
  it('renders "Total Artists" label with correct value', () => {
    render(
      <OverviewCard
        icon={<span>icon</span>}
        label="Total Artists"
        value={42}
        accentClass="text-pink-400 bg-pink-400/10"
      />
    );

    expect(screen.getByText('Total Artists')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders "Total Authors" label with correct value', () => {
    render(
      <OverviewCard
        icon={<span>icon</span>}
        label="Total Authors"
        value={18}
        accentClass="text-sky-400 bg-sky-400/10"
      />
    );

    expect(screen.getByText('Total Authors')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('renders "Total Genres" label with correct value', () => {
    render(
      <OverviewCard
        icon={<span>icon</span>}
        label="Total Genres"
        value={7}
        accentClass="text-amber-400 bg-amber-400/10"
      />
    );

    expect(screen.getByText('Total Genres')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('formats large values with locale string (e.g., 1,234)', () => {
    render(
      <OverviewCard
        icon={<span>icon</span>}
        label="Total Artists"
        value={1234}
        accentClass="text-pink-400 bg-pink-400/10"
      />
    );

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders the icon within the card', () => {
    render(
      <OverviewCard
        icon={<span data-testid="stat-icon">🎨</span>}
        label="Total Artists"
        value={5}
        accentClass="text-pink-400 bg-pink-400/10"
      />
    );

    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
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
