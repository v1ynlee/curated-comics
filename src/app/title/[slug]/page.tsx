// ============================================================
// Title Detail Page
// Source of truth: docs/roadmap/ROADMAP.md — Phase 1: Title Detail
// ============================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchTitle } from '@/services/titles';
import { TitleDetailClient } from './TitleDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = await fetchTitle(slug);
  if (!title) return { title: 'Not Found' };

  return {
    title: title.titleEnglish,
    description: title.synopsis ?? title.vibeCheck ?? `${title.titleEnglish} — ${title.origin}`,
    openGraph: {
      title: title.titleEnglish,
      description: title.synopsis ?? undefined,
      images: title.coverImage
        ? [{ url: title.coverImage.sizes.lg, alt: title.coverImage.alt }]
        : undefined,
    },
  };
}

export default async function TitlePage({ params }: Props) {
  const { slug } = await params;
  const title = await fetchTitle(slug);

  if (!title) notFound();

  return <TitleDetailClient title={title} />;
}
