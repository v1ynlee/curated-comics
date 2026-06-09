'use client';

// ============================================================
// ReadTab — lightweight, scalable reading platform links
// URLs are displayed in an elegant list with favicons.
// ============================================================

import { ExternalLink, Globe, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PLATFORM_CONFIG } from '@/lib/utils/constants';
import type { ExternalLink as ExternalLinkType } from '@/types/title';

interface ReadTabProps {
  links: ExternalLinkType[];
}

// Categorize platforms
const OFFICIAL_KR_JP_CN = ['kakaopage', 'naver', 'official'];
const OFFICIAL_EN = ['webtoon', 'tapas', 'tappytoon', 'lezhin'];

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

// Helper to extract domain from URL for favicon
function getDomainFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'google.com';
  }
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
    <div className="flex flex-col mb-8">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
        <span className="text-text-tertiary">{icon}</span>
        <span className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary">
          {label}
        </span>
      </div>

      <div className="flex flex-col">
        {links.map((link, i) => {
          const platform = (PLATFORM_CONFIG as Record<string, { name: string; color: string }>)[link.platform] ?? {
            name: link.label ?? link.platform,
            color: '#6B7280',
          };

          const domain = getDomainFromUrl(link.url);
          const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

          return (
            <div
              key={i}
              className={cn(
                'group flex items-center gap-4 py-3 border-b border-white/5 last:border-0',
                'hover:bg-white/5 transition-colors duration-200 px-2 -mx-2 rounded-lg'
              )}
            >
              {/* Favicon */}
              <div className="relative w-5 h-5 shrink-0 rounded-sm overflow-hidden bg-white/10">
                <img
                  src={faviconUrl}
                  alt={`${platform.name} icon`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Platform name */}
              <span className="font-heading text-sm font-medium text-text-primary shrink-0 w-28">
                {link.label ?? platform.name}
              </span>

              {/* URL — plain text */}
              <span
                className="font-data text-xs text-text-tertiary truncate flex-1 select-all transition-colors group-hover:text-text-secondary"
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
                  'shrink-0 p-2 rounded-full',
                  'text-text-tertiary group-hover:text-accent-primary group-hover:bg-accent-primary/10',
                  'transition-all duration-200',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                )}
                aria-label={`Open ${link.label ?? platform.name}`}
              >
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReadTab({ links }: ReadTabProps) {
  // Always show at least a dummy example so the tab is never empty
  const displayLinks: ExternalLinkType[] = links.length > 0 ? links : [
    { platform: 'kakaopage', url: 'https://page.kakao.com/content/58825221', label: 'KakaoPage' },
    { platform: 'webtoon',   url: 'https://www.webtoons.com/en/', label: 'Webtoon' },
    { platform: 'mangadex',  url: 'https://mangadex.org/', label: 'MangaDex' },
  ];

  const { official, en, fan } = categorizeLinks(displayLinks);

  return (
    <div className="flex flex-col py-2 max-w-4xl">
      <p className="font-body text-sm text-text-tertiary mb-6">
        Select a source to begin reading. Official sources are recommended to support the creators.
      </p>
      <LinkGroup icon={<Globe size={16} />} label="Official KR / JP / CN" links={official} />
      <LinkGroup icon={<BookOpen size={16} />} label="Official EN" links={en} />
      <LinkGroup icon={<Users size={16} />} label="Scanlations / Fan" links={fan} />
    </div>
  );
}
