'use client';

// ============================================================
// StudioHeader — Top header bar for all Studio pages.
// Left: CC logo + "Studio" branding.
// Right: UserProfileDropdown (replaces search icon).
// Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
// ============================================================

import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  User,
  LayoutDashboard,
  BookOpen,
  FileText,
  Image,
  Star,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ── Types ─────────────────────────────────────────────────────

interface StudioHeaderProps {
  user?: { email: string } | null;
}

// ── Navigation Items ──────────────────────────────────────────

const NAV_MENU_ITEMS = [
  {
    href: '/studio',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/studio/titles',
    label: 'Titles',
    icon: BookOpen,
  },
  {
    href: '/studio/articles',
    label: 'Articles',
    icon: FileText,
  },
  {
    href: '/studio/media',
    label: 'Media',
    icon: Image,
  },
  {
    href: '/studio/curation',
    label: 'Curation',
    icon: Star,
  },
] as const;

// ── UserProfileDropdown ───────────────────────────────────────

function UserProfileDropdown({ user }: { user: { email: string } | null }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-center',
            'w-9 h-9 rounded-full',
            'bg-surface-elevated/50 border border-white/10',
            'text-text-secondary hover:text-text-primary',
            'hover:bg-surface-elevated/80',
            'transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
          aria-label="User menu"
        >
          <User size={18} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 min-w-[200px] rounded-lg p-1',
            'bg-bg-surface border border-white/10',
            'shadow-lg shadow-black/20',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          )}
        >
          {user ? (
            <>
              {/* Signed in header */}
              <DropdownMenu.Label
                className={cn(
                  'px-3 py-2 font-body text-xs text-text-tertiary',
                  'border-b border-white/5 mb-1',
                )}
              >
                Signed in as {user.email}
              </DropdownMenu.Label>

              {/* Navigation links */}
              {NAV_MENU_ITEMS.map(({ href, label, icon: Icon }) => (
                <DropdownMenu.Item key={href} asChild>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md',
                      'font-body text-sm text-text-secondary',
                      'hover:text-text-primary hover:bg-white/5',
                      'outline-none focus-visible:bg-white/5 focus-visible:text-text-primary',
                      'cursor-pointer transition-colors duration-150',
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </DropdownMenu.Item>
              ))}
            </>
          ) : (
            /* Unauthenticated: Sign In only */
            <DropdownMenu.Item asChild>
              <Link
                href="/studio/login"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md',
                  'font-body text-sm text-text-secondary',
                  'hover:text-text-primary hover:bg-white/5',
                  'outline-none focus-visible:bg-white/5 focus-visible:text-text-primary',
                  'cursor-pointer transition-colors duration-150',
                )}
              >
                <LogIn size={16} aria-hidden="true" />
                <span>Sign In</span>
              </Link>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ── StudioHeader ──────────────────────────────────────────────

export function StudioHeader({ user = null }: StudioHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'flex items-center justify-between',
        'h-14 px-4 md:px-6',
        'bg-bg-surface/90 backdrop-blur-md',
        'border-b border-white/5',
      )}
    >
      {/* Left: Logo + Branding */}
      <Link
        href="/studio"
        className={cn(
          'flex items-center gap-2',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          'rounded-md',
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-lg',
            'bg-accent-primary/20 border border-accent-primary/30',
            'flex items-center justify-center',
          )}
        >
          <span className="font-heading text-xs font-bold text-accent-primary">
            CC
          </span>
        </div>
        <span className="font-heading text-sm font-bold text-text-primary tracking-wide">
          Studio
        </span>
      </Link>

      {/* Right: User Profile Dropdown (no search icon) */}
      <div className="flex items-center">
        <UserProfileDropdown user={user} />
      </div>
    </header>
  );
}
