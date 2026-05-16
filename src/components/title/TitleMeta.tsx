// ============================================================
// TitleMeta — genre tags, status, chapters, origin
// ============================================================

import { cn } from '@/lib/utils/cn';
import { Tag } from '@/components/ui/Tag';
import { READING_STATUS_LABELS } from '@/lib/utils/constants';
import { TIER_CONFIG } from '@/types/title';
import type { Title } from '@/types/title';

interface TitleMetaProps {
  title: Title;
  className?: string;
}

export function TitleMeta({ title, className }: TitleMetaProps) {
  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Status + origin row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-heading text-xs uppercase tracking-widest text-text-tertiary">
          {title.origin}
        </span>
        <span className="text-text-tertiary/30 text-xs">·</span>
        <span className="font-body text-xs text-text-secondary">
          {READING_STATUS_LABELS[title.readingStatus] ?? title.readingStatus}
        </span>
        {title.chaptersRead > 0 && (
          <>
            <span className="text-text-tertiary/30 text-xs">·</span>
            <span className="font-data text-xs text-text-tertiary">
              {title.chaptersRead}
              {title.totalChapters ? `/${title.totalChapters}` : '+'} chapters
            </span>
          </>
        )}
        {title.status === 'completed' && (
          <>
            <span className="text-text-tertiary/30 text-xs">·</span>
            <span className="font-heading text-[10px] uppercase tracking-widest text-semantic-success">
              Complete
            </span>
          </>
        )}
      </div>

      {/* Tier */}
      {tierConfig && (
        <div className="flex items-center gap-2">
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Tier
          </span>
          <span
            className="font-heading text-sm font-bold px-2 py-0.5 rounded-sm"
            style={{
              color: tierConfig.color,
              backgroundColor: `${tierConfig.color}15`,
              border: `1px solid ${tierConfig.color}30`,
            }}
          >
            {title.tier} — {tierConfig.label}
          </span>
        </div>
      )}

      {/* Genres */}
      {title.genres.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Genres
          </span>
          <div className="flex flex-wrap gap-1.5">
            {title.genres.map((genre) => (
              <Tag
                key={genre.slug}
                label={genre.name}
                color={genre.color}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Moods */}
      {title.moods.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Vibes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {title.moods.map((mood) => (
              <Tag
                key={mood.slug}
                label={mood.name}
                emoji={mood.emoji}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Vibe check */}
      {title.vibeCheck && (
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Vibe Check
          </span>
          <p className="font-accent text-lg text-text-accent leading-snug">
            &ldquo;{title.vibeCheck}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
