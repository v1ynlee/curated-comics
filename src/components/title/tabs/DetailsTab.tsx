'use client';

// ============================================================
// DetailsTab — premium, immersive, organized metadata layout
// ============================================================

import { cn } from '@/lib/utils/cn';
import { TIER_CONFIG } from '@/types/title';
import type { Title } from '@/types/title';
import Link from 'next/link';

interface DetailsTabProps {
  title: Title;
}

// Helper to handle multiple authors/artists splitting by comma
const splitNames = (str?: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

function MetaItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
        {label}
      </span>
      <div className="font-body text-sm text-text-primary font-medium">
        {children}
      </div>
    </div>
  );
}

export function DetailsTab({ title }: DetailsTabProps) {
  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;
  const authors = splitNames(title.author);
  const artists = splitNames(title.artist);

  return (
    <div className="flex flex-col gap-10 py-6 max-w-3xl">
      {/* Vibe Check Highlight */}
      {title.vibeCheck && (
        <div className="border-l border-accent-primary/40 pl-5 py-1">
          <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary block mb-3">
            Curator Vibe Check
          </span>
          <p className="font-accent text-xl text-text-primary/90 leading-relaxed italic">
            &ldquo;{title.vibeCheck}&rdquo;
          </p>
        </div>
      )}

      {/* Main Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
        
        {/* Tier */}
        {tierConfig && (
          <MetaItem label="Tier">
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: tierConfig.color }}
            >
              {title.tier}
            </span>
          </MetaItem>
        )}

        {/* Rating */}
        {title.ratings && (
          <MetaItem label="Rating">
            <span className="text-accent-secondary font-bold">{title.ratings.overall.toFixed(1)}</span>
            <span className="text-xs text-text-tertiary font-normal"> / 10</span>
          </MetaItem>
        )}

        {/* Type / Origin */}
        <MetaItem label="Type">
          <span className="capitalize">{title.origin}</span>
        </MetaItem>

        {/* Status */}
        <MetaItem label="Status">
          <span className="capitalize">{title.status}</span>
        </MetaItem>

        {/* Reading Status */}
        <MetaItem label="Reading Status">
          <span className="capitalize text-text-secondary">{title.readingStatus.replace('-', ' ')}</span>
        </MetaItem>

        {/* Chapters */}
        <MetaItem label="Total Chapters">
          <span className="text-text-secondary">{title.totalChapters ? `${title.totalChapters}` : 'Unknown'}</span>
        </MetaItem>

        {/* Chapters Read */}
        <MetaItem label="Chapters Read">
          <span className="text-text-secondary">{title.chaptersRead}</span>
        </MetaItem>

        {/* Release Date */}
        {title.startedDate && (
          <MetaItem label="Started Date">
            <span className="text-text-secondary">{new Date(title.startedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
          </MetaItem>
        )}
        
        {/* Completion Date */}
        {title.completedDate && (
          <MetaItem label="Completed Date">
            <span className="text-text-secondary">{new Date(title.completedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
          </MetaItem>
        )}

      </div>

      {/* Creators Section */}
      <div className="flex flex-col md:flex-row gap-10 border-t border-white/5 pt-8 mt-2">
        {authors.length > 0 && (
          <MetaItem label="Author(s)">
            <span className="text-text-secondary">{authors.join(', ')}</span>
          </MetaItem>
        )}
        
        {artists.length > 0 && (
          <MetaItem label="Artist(s)">
            <span className="text-text-secondary">{artists.join(', ')}</span>
          </MetaItem>
        )}
      </div>

      {/* Tags & Categorization */}
      <div className="flex flex-col gap-8 border-t border-white/5 pt-8 mt-2">
        {/* Genres */}
        {title.genres.length > 0 && (
          <MetaItem label="Genres">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-text-secondary">
              {title.genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/discover?genres=${genre.slug}`}
                  className="hover:text-accent-primary transition-colors duration-200"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </MetaItem>
        )}

        {/* Themes/Moods */}
        {title.moods.length > 0 && (
          <MetaItem label="Themes & Moods">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-text-tertiary">
              {title.moods.map((mood) => (
                <span key={mood.id}>
                  {mood.name}
                </span>
              ))}
            </div>
          </MetaItem>
        )}
      </div>
    </div>
  );
}
