'use client';

// ============================================================
// DetailsTab — tier, genres, author, artist, themes, vibe check
// ============================================================

import {
  Trophy, Star, BookOpen, Palette, Users, Tag as TagIcon,
  MessageSquareQuote, Layers,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Tag } from '@/components/ui/Tag';
import { RatingDisplay } from '@/components/title/RatingDisplay';
import { TIER_CONFIG } from '@/types/title';
import type { Title } from '@/types/title';

interface DetailsTabProps {
  title: Title;
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-text-tertiary mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          {label}
        </span>
        <div className="font-body text-sm text-text-secondary">{children}</div>
      </div>
    </div>
  );
}

export function DetailsTab({ title }: DetailsTabProps) {
  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;

  return (
    <div className="flex flex-col gap-6 py-4">

      {/* Tier */}
      {tierConfig && (
        <DetailRow icon={<Trophy size={15} />} label="Tier">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-heading text-xs font-bold uppercase tracking-widest"
            style={{
              color: tierConfig.color,
              backgroundColor: `${tierConfig.color}18`,
              border: `1px solid ${tierConfig.color}35`,
            }}
          >
            {title.tier} — {tierConfig.label}
          </span>
          <p className="text-xs text-text-tertiary mt-1">{tierConfig.description}</p>
        </DetailRow>
      )}

      {/* Rating breakdown */}
      {title.ratings && (
        <DetailRow icon={<Star size={15} />} label="Ratings">
          <RatingDisplay ratings={title.ratings} />
        </DetailRow>
      )}

      {/* Author */}
      {title.author && (
        <DetailRow icon={<BookOpen size={15} />} label="Author">
          <span className="text-text-primary font-medium">{title.author}</span>
        </DetailRow>
      )}

      {/* Artist */}
      {title.artist && title.artist !== title.author && (
        <DetailRow icon={<Palette size={15} />} label="Artist">
          <span className="text-text-primary font-medium">{title.artist}</span>
        </DetailRow>
      )}

      {/* Genres */}
      {title.genres.length > 0 && (
        <DetailRow icon={<TagIcon size={15} />} label="Genres">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {title.genres.map((genre) => (
              <Tag key={genre.slug} label={genre.name} color={genre.color} size="sm" />
            ))}
          </div>
        </DetailRow>
      )}

      {/* Themes / Moods */}
      {title.moods.length > 0 && (
        <DetailRow icon={<Layers size={15} />} label="Themes & Vibes">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {title.moods.map((mood) => (
              <Tag key={mood.slug} label={mood.name} size="sm" />
            ))}
          </div>
        </DetailRow>
      )}

      {/* Vibe Check */}
      {title.vibeCheck && (
        <DetailRow icon={<MessageSquareQuote size={15} />} label="Vibe Check">
          <p className="font-accent text-base text-text-accent leading-snug italic">
            &ldquo;{title.vibeCheck}&rdquo;
          </p>
        </DetailRow>
      )}

      {/* Status info */}
      <DetailRow icon={<Users size={15} />} label="Status">
        <div className="flex flex-wrap gap-2">
          <span className="font-heading text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-surface-elevated/50 text-text-secondary">
            {title.origin}
          </span>
          <span className="font-heading text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-surface-elevated/50 text-text-secondary">
            {title.status}
          </span>
          <span className="font-data text-[10px] px-2 py-0.5 rounded-sm bg-surface-elevated/50 text-text-secondary">
            {title.chaptersRead}{title.totalChapters ? `/${title.totalChapters}` : '+'} ch
          </span>
        </div>
      </DetailRow>
    </div>
  );
}
