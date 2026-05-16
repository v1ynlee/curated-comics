'use client';

// ============================================================
// DetailsTab — compact inline label: value layout
// Label on the left, value inline on the right.
// No dividers on tier, genres, vibe check, status, author, artist.
// ============================================================

import {
  Trophy, Star, BookOpen, Palette, Tag as TagIcon,
  MessageSquareQuote, Layers, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tag } from '@/components/ui/Tag';
import { RatingDisplay } from '@/components/title/RatingDisplay';
import { TIER_CONFIG } from '@/types/title';
import type { Title } from '@/types/title';

interface DetailsTabProps {
  title: Title;
}

// ── Inline row: icon + label on left, value on right ─────────

function Row({
  icon,
  label,
  children,
  divider = false,
  alignTop = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  divider?: boolean;
  alignTop?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-start gap-3 py-1.5',
      divider && 'border-b border-white/5',
    )}>
      {/* Icon + label — fixed width so values align */}
      <div className={cn(
        'flex items-center gap-1.5 shrink-0 w-28',
        alignTop ? 'mt-0.5' : '',
      )}>
        <span className="text-text-tertiary shrink-0">{icon}</span>
        <span className="font-heading text-[10px] uppercase tracking-[0.15em] text-text-tertiary whitespace-nowrap">
          {label}
        </span>
      </div>

      {/* Value — inline, right of label */}
      <div className="flex-1 min-w-0 font-body text-sm text-text-secondary">
        {children}
      </div>
    </div>
  );
}

export function DetailsTab({ title }: DetailsTabProps) {
  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;

  return (
    <div className="flex flex-col py-3">

      {/* Tier */}
      {tierConfig && (
        <Row icon={<Trophy size={13} />} label="Tier">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-heading text-[11px] font-bold uppercase tracking-widest"
            style={{
              color: tierConfig.color,
              backgroundColor: `${tierConfig.color}18`,
              border: `1px solid ${tierConfig.color}35`,
            }}
          >
            {title.tier} — {tierConfig.label}
          </span>
        </Row>
      )}

      {/* Rating */}
      {title.ratings && (
        <Row icon={<Star size={13} />} label="Ratings" alignTop divider>
          <RatingDisplay ratings={title.ratings} />
        </Row>
      )}

      {/* Author */}
      {title.author && (
        <Row icon={<BookOpen size={13} />} label="Author">
          <span className="text-text-primary font-medium">{title.author}</span>
        </Row>
      )}

      {/* Artist */}
      {title.artist && title.artist !== title.author && (
        <Row icon={<Palette size={13} />} label="Artist">
          <span className="text-text-primary font-medium">{title.artist}</span>
        </Row>
      )}

      {/* Genres — comma-separated inline */}
      {title.genres.length > 0 && (
        <Row icon={<TagIcon size={13} />} label="Genres" divider>
          <span className="text-text-secondary">
            {title.genres.map((g) => g.name).join(', ')}
          </span>
        </Row>
      )}

      {/* Themes / Moods — comma-separated inline */}
      {title.moods.length > 0 && (
        <Row icon={<Layers size={13} />} label="Themes">
          <span className="text-text-secondary">
            {title.moods.map((m) => m.name).join(', ')}
          </span>
        </Row>
      )}

      {/* Vibe Check */}
      {title.vibeCheck && (
        <Row icon={<MessageSquareQuote size={13} />} label="Vibe Check" divider>
          <p className="font-accent text-sm text-text-accent leading-snug italic">
            &ldquo;{title.vibeCheck}&rdquo;
          </p>
        </Row>
      )}

      {/* Status */}
      <Row icon={<Users size={13} />} label="Status">
        <span className="text-text-secondary">
          {title.origin} · {title.status} · {title.chaptersRead}
          {title.totalChapters ? `/${title.totalChapters}` : '+'} ch
        </span>
      </Row>
    </div>
  );
}
