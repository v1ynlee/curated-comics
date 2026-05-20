// ============================================================
// Studio Media Page — Manage title galleries, artist images,
// author images, and studio media assets.
// Server component that queries Supabase for media assets.
// Requirements: 17.1, 17.2
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Upload,
  Palette,
  User,
  BookOpen,
  FolderOpen,
} from 'lucide-react';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import type { AssetType } from '@/types/media';

export const metadata: Metadata = {
  title: 'Media',
  description: 'Manage title galleries, artist images, author images, and studio media assets.',
};

// ── Types ───────────────────────────────────────────────────────

interface MediaAssetRow {
  id: string;
  slug: string;
  asset_type: AssetType;
  original_width: number;
  original_height: number;
  mime_type: string;
  dominant_color: string;
  variants: { width: number; format: string; url: string; size: number }[];
  created_at: string;
  updated_at: string;
}

interface MediaSection {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
  assets: MediaAssetRow[];
}

// ── Data fetching ───────────────────────────────────────────────

async function fetchMediaAssets() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('media_assets')
    .select('id, slug, asset_type, original_width, original_height, mime_type, dominant_color, variants, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch media assets:', error);
    return [];
  }

  return (data ?? []) as MediaAssetRow[];
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioMediaPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const allAssets = await fetchMediaAssets();

  // Group assets by type into sections
  const titleGalleryAssets = allAssets.filter(
    (a) => a.asset_type === 'cover' || a.asset_type === 'banner',
  );
  const articleAssets = allAssets.filter((a) => a.asset_type === 'article-image');
  const thumbnailAssets = allAssets.filter((a) => a.asset_type === 'thumbnail');
  const ogAssets = allAssets.filter((a) => a.asset_type === 'og-asset');

  const sections: MediaSection[] = [
    {
      key: 'title-galleries',
      label: 'Title Galleries',
      description: 'Cover and banner images for comic titles.',
      icon: <BookOpen size={18} aria-hidden="true" />,
      accentClass: 'text-accent-primary bg-accent-primary/10',
      assets: titleGalleryAssets,
    },
    {
      key: 'artist-images',
      label: 'Artist Images',
      description: 'Profile images and artwork for artists.',
      icon: <Palette size={18} aria-hidden="true" />,
      accentClass: 'text-accent-secondary bg-accent-secondary/10',
      assets: [], // Placeholder — artist images not yet stored separately
    },
    {
      key: 'author-images',
      label: 'Author Images',
      description: 'Profile images and photos for authors.',
      icon: <User size={18} aria-hidden="true" />,
      accentClass: 'text-accent-tertiary bg-accent-tertiary/10',
      assets: [], // Placeholder — author images not yet stored separately
    },
    {
      key: 'studio-assets',
      label: 'Studio Media Assets',
      description: 'Article images, thumbnails, and OG assets.',
      icon: <FolderOpen size={18} aria-hidden="true" />,
      accentClass: 'text-accent-quaternary bg-accent-quaternary/10',
      assets: [...articleAssets, ...thumbnailAssets, ...ogAssets],
    },
  ];

  const totalAssets = allAssets.length;

  return (
    <div className="container-content py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
            Assets
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Media
          </h1>
          <p className="font-body text-sm text-text-secondary">
            {totalAssets} asset{totalAssets !== 1 ? 's' : ''} in your library
          </p>
        </div>

        <Link
          href="/api/media/upload"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-accent-primary text-white font-heading text-sm font-bold',
            'hover:bg-accent-primary/90 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            'self-start sm:self-auto',
            'pointer-events-none opacity-60',
          )}
          aria-disabled="true"
          tabIndex={-1}
        >
          <Upload size={16} aria-hidden="true" />
          Upload Media
        </Link>
      </div>

      {/* Media Sections */}
      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <MediaSectionCard key={section.key} section={section} />
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function MediaSectionCard({ section }: { section: MediaSection }) {
  return (
    <section
      aria-labelledby={`section-${section.key}`}
      className={cn(
        'rounded-lg border border-white/5',
        'bg-bg-surface/40 backdrop-blur-sm',
        'overflow-hidden',
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <span
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg',
            section.accentClass,
          )}
        >
          {section.icon}
        </span>
        <div className="flex flex-col gap-0.5">
          <h2
            id={`section-${section.key}`}
            className="font-heading text-sm font-bold text-text-primary"
          >
            {section.label}
          </h2>
          <p className="font-body text-xs text-text-secondary">
            {section.description}
          </p>
        </div>
        <span className="ml-auto font-data text-xs text-text-tertiary">
          {section.assets.length} item{section.assets.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Section content */}
      <div className="p-5">
        {section.assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-bg-surface/60 flex items-center justify-center">
              <ImageIcon size={20} className="text-text-tertiary" aria-hidden="true" />
            </div>
            <p className="font-body text-xs text-text-secondary max-w-xs">
              No assets in this section yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {section.assets.slice(0, 20).map((asset) => (
              <MediaAssetThumbnail key={asset.id} asset={asset} />
            ))}
            {section.assets.length > 20 && (
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg',
                  'bg-white/5 border border-white/10',
                  'aspect-square',
                )}
              >
                <span className="font-heading text-xs text-text-secondary">
                  +{section.assets.length - 20} more
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function MediaAssetThumbnail({ asset }: { asset: MediaAssetRow }) {
  // Pick the smallest variant for thumbnail display
  const thumbnail = asset.variants
    ?.filter((v) => v.format === 'webp')
    .sort((a, b) => a.width - b.width)[0];

  const imageUrl = thumbnail?.url ?? `/images/covers/${asset.slug}-320w.webp`;

  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden',
        'bg-bg-surface/60 border border-white/5',
        'aspect-[3/4]',
        'hover:border-white/15 transition-all duration-200',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={asset.slug}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ backgroundColor: asset.dominant_color || undefined }}
      />

      {/* Overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-end p-2',
          'bg-gradient-to-t from-black/70 via-transparent to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        )}
      >
        <span className="font-body text-[10px] text-white truncate">
          {asset.slug}
        </span>
        <span className="font-data text-[9px] text-white/60">
          {asset.original_width}×{asset.original_height}
        </span>
      </div>
    </div>
  );
}
