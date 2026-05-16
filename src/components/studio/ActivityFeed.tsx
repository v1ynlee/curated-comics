'use client';

// ============================================================
// ActivityFeed — Renders a list of recent activity entries
// Displays at most 8 entries regardless of input length.
// Requirements: 15.1
// ============================================================

import Link from 'next/link';
import NextImage from 'next/image';
import {
  BookOpen,
  Newspaper,
  Image as ImageIcon,
  Tag,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const MAX_ACTIVITY_ENTRIES = 8;

export interface ActivityEntry {
  id: string;
  type: 'title' | 'article' | 'media' | 'genre';
  label: string;
  meta: string;
  href: string;
  createdAt: string;
  thumbnail?: string;
}

export interface ActivityFeedProps {
  entries: ActivityEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  // Cap displayed entries at MAX_ACTIVITY_ENTRIES
  const displayedEntries = entries.slice(0, MAX_ACTIVITY_ENTRIES);

  if (displayedEntries.length === 0) {
    return (
      <div className="state-empty">
        <TrendingUp size={32} className="text-text-tertiary" aria-hidden="true" />
        <p className="font-body text-sm text-text-secondary">
          No recent activity yet. Start by adding a title or writing an article.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2" data-testid="activity-feed">
      {displayedEntries.map((item) => (
        <ActivityFeedItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function ActivityFeedItem({ item }: { item: ActivityEntry }) {
  const timeAgo = getRelativeTime(item.createdAt);

  const typeLabel: Record<string, string> = {
    title: 'New Title',
    article: 'New Article',
    media: 'Media Upload',
    genre: 'New Genre',
  };

  const typeAccent: Record<string, string> = {
    title: 'bg-accent-primary/10 text-accent-primary',
    article: 'bg-accent-tertiary/10 text-accent-tertiary',
    media: 'bg-accent-quaternary/10 text-accent-quaternary',
    genre: 'bg-amber-400/10 text-amber-400',
  };

  const typeIcon: Record<string, React.ReactNode> = {
    title: <BookOpen size={14} />,
    article: <Newspaper size={14} />,
    media: <ImageIcon size={14} />,
    genre: <Tag size={14} />,
  };

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        'hover:border-white/10 hover:bg-bg-surface/60',
        'transition-all duration-fast',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
      data-testid="activity-entry"
    >
      {/* Thumbnail or icon placeholder */}
      {item.thumbnail ? (
        <div className="w-8 h-11 shrink-0 rounded overflow-hidden bg-bg-surface/60" data-testid="activity-thumbnail">
          <NextImage
            src={item.thumbnail}
            alt={item.label}
            width={32}
            height={44}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ) : (
        <span
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md shrink-0',
            typeAccent[item.type],
          )}
          aria-hidden="true"
          data-testid="activity-icon-placeholder"
        >
          {typeIcon[item.type]}
        </span>
      )}

      {/* Content */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-body text-sm text-text-primary truncate">
          {item.label}
        </span>
        <span className="font-heading text-[10px] uppercase tracking-[0.15em] text-text-tertiary">
          {typeLabel[item.type]} · {item.meta}
        </span>
      </div>

      {/* Timestamp */}
      <span className="flex items-center gap-1.5 shrink-0">
        <Clock size={12} className="text-text-tertiary" aria-hidden="true" />
        <time
          dateTime={item.createdAt}
          className="font-data text-[11px] text-text-tertiary"
        >
          {timeAgo}
        </time>
      </span>
    </Link>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
