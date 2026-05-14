'use client';

// ============================================================
// ReadTab — grouped reading platform links
// URLs are displayed as plain text (not clickable links).
// An icon button beside each URL opens it.
// ============================================================

import { ExternalLink, Globe, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PLATFORM_CONFIG } from '@/lib/constants';
import type { ExternalLink as ExternalLinkType } from '@/types/title';

interface ReadTabProps {
  links: ExternalLinkType[];
}

// Categorize platforms
const OFFICIAL_KR_JP_CN = ['kakaopage', 'naver', 'official'];
const OFFICIAL_EN = ['webtoon', 'tapas', 'tappytoon', 'lezhin'];
const SCANLATION = ['mangadex', 'other'];

function categorizeLinks(links: ExternalLinkType[]) {
  const official: ExternalLinkType[] = [];
  const en: ExternalLinkType[] = [];
  const fan: ExternalLinkType[] = [];

  for (const link of links) {
    if (OFFICIAL_KR_JP_CN.includes(link.platform)) official.push(link);
    else if (OFFICIAL_EN.includes(link.platform)) en.push(link);
    else fan.push(link);
  }

  return { official, en, fan };
}

function LinkGroup({
  icon,
  label,
  links,
}: {
  icon: React.ReactNode;
  label: string;
  links: ExternalLinkType[];
}) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-text-tertiary">{icon}</span>
        <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          {label}
        </span>
      </div>

      {links.map((link, i) => {
        const platform = (PLATFORM_CONFIG as Record<string, { name: string; color: string }>)[link.platform] ?? {
          name: link.label ?? link.platform,
          color: '#6B7280',
        };

        return (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg',
              'bg-surface-elevated/30 border border-white/5',
            )}
          >
            {/* Platform color dot */}
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: platform.color }}
              aria-hidden="true"
            />

            {/* Platform name */}
            <span className="font-heading text-xs font-medium text-text-primary shrink-0 w-24">
              {link.label ?? platform.name}
            </span>

            {/* URL — plain text, NOT a link, NOT browser-colored */}
            <span
              className="font-data text-[11px] text-text-tertiary truncate flex-1 select-all"
              title={link.url}
            >
              {link.url}
            </span>

            {/* Open button */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'shrink-0 p-1.5 rounded-md',
                'text-text-tertiary hover:text-text-primary',
                'hover:bg-white/10 transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              )}
              aria-label={`Open ${link.label ?? platform.name}`}
            >
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        );
      })}
    </div>
  );
}

export function ReadTab({ links }: ReadTabProps) {
  // Always show at least a dummy example so the tab is never empty
  const displayLinks: ExternalLinkType[] = links.length > 0 ? links : [
    { platform: 'kakaopage', url: 'https://page.kakao.com/content/58825221', label: 'KakaoPage' },
    { platform: 'webtoon',   url: 'https://page.kakao.com/content/58825221', label: 'Webtoon' },
    { platform: 'mangadex',  url: 'https://page.kakao.com/content/58825221', label: 'MangaDex' },
  ];

  const { official, en, fan } = categorizeLinks(displayLinks);

  return (
    <div className="flex flex-col gap-6 py-4">
      <LinkGroup icon={<Globe size={14} />} label="Official KR / JP / CN" links={official} />
      <LinkGroup icon={<BookOpen size={14} />} label="Official EN" links={en} />
      <LinkGroup icon={<Users size={14} />} label="Scanlations / Fan" links={fan} />
    </div>
  );
}
