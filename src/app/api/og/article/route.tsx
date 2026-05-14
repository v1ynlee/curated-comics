// ============================================================
// Dynamic OG Image Generation — Article
// GET /api/og/article?slug=my-article
// Generates a 1200x630 Open Graph image for article social sharing.
// Uses Next.js ImageResponse API with article title, category, and
// featured image. Dark theme matching the site's cinematic aesthetic.
// Source of truth: .kiro/specs/platform-evolution-planning/requirements.md §15.4
// ============================================================

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { supabase } from '@/services/api';

export const runtime = 'edge';

// OG image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

interface ArticleOGData {
  title: string;
  categoryName: string | null;
  categoryColor: string | null;
  featuredImageUrl: string | null;
}

async function fetchArticleOGData(slug: string): Promise<ArticleOGData | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      title,
      article_categories ( name, color ),
      media_assets!articles_featured_image_id_fkey ( variants )
    `)
    .eq('slug', slug)
    .eq('publication_state', 'published')
    .single();

  if (error || !data) return null;

  // Supabase returns joined relations as arrays (or single object for belongsTo)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;

  // Extract category info (single relation via foreign key)
  const categoryRaw = raw.article_categories;
  const category = Array.isArray(categoryRaw) ? categoryRaw[0] : categoryRaw;

  // Extract featured image URL (use the largest variant)
  const mediaRaw = raw.media_assets;
  const mediaAsset = Array.isArray(mediaRaw) ? mediaRaw[0] : mediaRaw;
  let featuredImageUrl: string | null = null;
  if (mediaAsset?.variants && Array.isArray(mediaAsset.variants) && mediaAsset.variants.length > 0) {
    // Prefer the widest WebP variant for best quality/compatibility
    const variants = mediaAsset.variants as Array<{ url: string; width: number; format: string }>;
    const webpVariants = variants.filter((v) => v.format === 'webp');
    const sorted = (webpVariants.length > 0 ? webpVariants : variants)
      .sort((a, b) => b.width - a.width);
    featuredImageUrl = sorted[0]?.url ?? null;
  }

  return {
    title: raw.title as string,
    categoryName: category?.name ?? null,
    categoryColor: category?.color ?? null,
    featuredImageUrl,
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  const article = await fetchArticleOGData(slug);

  if (!article) {
    return new Response('Article not found', { status: 404 });
  }

  const { title, categoryName, categoryColor, featuredImageUrl } = article;

  // Truncate title if too long for the image
  const displayTitle = title.length > 80 ? title.slice(0, 77) + '...' : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#08080f',
        }}
      >
        {/* Background featured image with overlay */}
        {featuredImageUrl && (
          <img
            src={featuredImageUrl}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
            }}
          />
        )}

        {/* Gradient overlay for readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(8,8,15,0.4) 0%, rgba(8,8,15,0.85) 60%, rgba(8,8,15,0.95) 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
            gap: '20px',
          }}
        >
          {/* Category badge */}
          {categoryName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  backgroundColor: categoryColor || '#8b5cf6',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 600,
                  padding: '6px 16px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                }}
              >
                {categoryName}
              </div>
            </div>
          )}

          {/* Article title */}
          <div
            style={{
              fontSize: title.length > 50 ? '42px' : '52px',
              fontWeight: 700,
              color: '#f0f0f5',
              lineHeight: 1.2,
              display: 'flex',
              maxWidth: '900px',
            }}
          >
            {displayTitle}
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#8b5cf6',
              letterSpacing: '-0.02em',
              display: 'flex',
            }}
          >
            Comic Curated
          </div>
        </div>

        {/* Decorative accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #8b5cf6, #f59e0b, #06b6d4)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
