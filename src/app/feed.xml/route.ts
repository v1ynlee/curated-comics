// ============================================================
// RSS Feed — /feed.xml
// Source of truth: docs/roadmap/ROADMAP.md — Phase 5
//
// Returns an RSS 2.0 feed of recently added/updated titles.
// Cached for 1 hour.
// ============================================================

import { NextResponse } from 'next/server';
import { fetchTitles } from '@/services/public/titles';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/utils/constants';

export const revalidate = 3600; // 1 hour

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { titles } = await fetchTitles({
    sortBy: 'date-added',
    pageSize: 50,
  });

  const now = new Date().toUTCString();

  const items = titles
    .map((title) => {
      const url = `${SITE_URL}/title/${title.slug}`;
      const pubDate = new Date(title.createdAt).toUTCString();
      const description = title.synopsis
        ? escapeXml(title.synopsis)
        : escapeXml(`${title.titleEnglish} — ${title.origin}`);

      const categories = title.genres
        .slice(0, 3)
        .map((g) => `<category>${escapeXml(g.name)}</category>`)
        .join('');

      return `
    <item>
      <title>${escapeXml(title.titleEnglish)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      ${categories}
      ${title.ratings?.overall ? `<rating>${title.ratings.overall}</rating>` : ''}
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
