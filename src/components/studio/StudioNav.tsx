'use client';

// ============================================================
// StudioNav — cinematic sidebar navigation for Studio CMS
// Card-based visual style with Framer Motion active indicators.
// Collapsible on mobile viewports (hamburger toggle).
// Respects prefers-reduced-motion.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

// ── Navigation Items ──────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: '/studio',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/studio/titles',
    label: 'Titles',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" />
        <path d="M8 11h6" />
      </svg>
    ),
  },
  {
    href: '/studio/articles',
    label: 'Articles',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/studio/media',
    label: 'Media',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    href: '/studio/curation',
    label: 'Curation',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
] as const;

// ── Component ─────────────────────────────────────────────────

export function StudioNav() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Shared nav content rendered in both desktop sidebar and mobile drawer
  const navContent = (
    <nav role="navigation" aria-label="Studio navigation">
      <ul className="flex flex-col gap-1" role="list">
        {NAV_ITEMS.map(({ href, label, exact, icon }) => {
          const active = isActive(href, exact);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 rounded-lg',
                  'font-body text-sm font-medium',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                  active
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {/* Animated active background indicator */}
                {active && (
                  <motion.span
                    layoutId="studio-nav-active"
                    className="absolute inset-0 rounded-lg bg-surface-elevated/50 border border-white/10"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 350, damping: 30 }
                    }
                  />
                )}
                <span className="relative z-base flex items-center gap-3">
                  {icon}
                  <span>{label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col',
          'w-64 h-screen sticky top-0',
          'bg-bg-surface/40 backdrop-blur-md',
          'border-r border-white/5',
          'p-4',
        )}
      >
        {/* Studio branding */}
        <div className="flex items-center gap-3 px-4 py-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
            <span className="font-heading text-xs font-bold text-accent-primary">CC</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-sm font-bold text-text-primary tracking-wide">
              Studio
            </span>
            <span className="font-body text-[10px] text-text-tertiary uppercase tracking-widest">
              Creative Workspace
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1">
          {navContent}
        </div>

        {/* Session status indicator */}
        <div
          className={cn(
            'mt-auto px-4 py-3 rounded-lg',
            'bg-bg-deep/60 border border-white/5',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full bg-semantic-success animate-pulse-glow"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-text-secondary">
              Signed in
            </span>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header Bar ────────────────────────────────── */}
      <div
        className={cn(
          'md:hidden fixed top-0 inset-x-0 z-nav',
          'flex items-center justify-between',
          'h-14 px-4',
          'bg-bg-surface/90 backdrop-blur-md',
          'border-b border-white/5',
        )}
      >
        {/* Branding */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
            <span className="font-heading text-[10px] font-bold text-accent-primary">CC</span>
          </div>
          <span className="font-heading text-sm font-bold text-text-primary">Studio</span>
        </div>

        {/* Session indicator + hamburger */}
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full bg-semantic-success"
            aria-label="Signed in"
            role="status"
          />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={cn(
              'p-2 rounded-sm',
              'text-text-secondary hover:text-text-primary',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            )}
            aria-expanded={mobileOpen}
            aria-controls="studio-mobile-nav"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
              className="md:hidden fixed inset-0 z-overlay bg-bg-deep/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.aside
              id="studio-mobile-nav"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 30 }
              }
              className={cn(
                'md:hidden fixed top-14 left-0 bottom-0 z-overlay',
                'w-72 p-4',
                'bg-bg-surface/95 backdrop-blur-xl',
                'border-r border-white/5',
                'overflow-y-auto',
              )}
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
