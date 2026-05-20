'use client';

// ============================================================
// Navigation — floating desktop nav
// Adapts for /studio/* routes with Studio-specific nav items,
// icons, and user profile dropdown.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sun, Moon, ArrowLeft, User, LogOut,
  LayoutDashboard, BookOpen, FileText, Image as ImageIcon, Star, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { GradientText } from '@/components/ui/GradientText';
import { useUIStore } from '@/stores/useUIStore';
import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser';

// ── Navigation Items ──────────────────────────────────────────

const PUBLIC_NAV_ITEMS = [
  { href: '/',         label: 'Home',     exact: true,  title: undefined, icon: Home },
  { href: '/library',  label: 'Library',  exact: false, title: undefined, icon: BookOpen },
  { href: '/discover', label: 'Discover', exact: false, title: undefined, icon: Search },
  { href: '/tiers',    label: 'Tiers',    exact: false, title: undefined, icon: Star },
  { href: '/stats',    label: 'Stats',    exact: false, title: undefined, icon: LayoutDashboard },
  { href: '/news',     label: 'News',     exact: false, title: undefined, icon: FileText },
] as const;

const STUDIO_NAV_ITEMS = [
  { href: '/studio',          label: 'Dashboard', exact: true,  title: 'Overview, stats, and recent activity', icon: LayoutDashboard },
  { href: '/studio/titles',   label: 'Titles',    exact: false, title: 'Manage your manga, manhwa, and manhua collection', icon: BookOpen },
  { href: '/studio/articles', label: 'Articles',  exact: false, title: 'Write and manage editorial content', icon: FileText },
  { href: '/studio/media',    label: 'Media',     exact: false, title: 'Upload and organize images and assets', icon: ImageIcon },
  { href: '/studio/curation', label: 'Curation',  exact: false, title: 'Featured titles, collections, and mood groupings', icon: Star },
] as const;

// ── User Menu Component ───────────────────────────────────────

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/studio/login';
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center justify-center',
          'w-8 h-8 rounded-full',
          'bg-surface-elevated/50 border border-white/10',
          'text-text-secondary hover:text-text-primary',
          'hover:bg-surface-elevated/80',
          'transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <User size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'min-w-[200px] rounded-lg p-1',
            'bg-bg-surface border border-white/10',
            'shadow-lg shadow-black/20',
          )}
          role="menu"
        >
          {email && (
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="font-body text-xs text-text-tertiary">Signed in as</p>
              <p className="font-body text-sm text-text-primary truncate">{email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            role="menuitem"
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-md',
              'font-body text-sm text-text-secondary',
              'hover:text-text-primary hover:bg-white/5',
              'transition-colors duration-150',
            )}
          >
            <LogOut size={14} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Navigation Component ──────────────────────────────────────

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { theme, toggleTheme } = useUIStore();

  const isStudio = pathname.startsWith('/studio');
  const navItems = isStudio ? STUDIO_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      setScrolled(currentY > 20);
      if (currentY > 60) {
        if (delta > 8) setVisible(false);
        else if (delta < -8) setVisible(true);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          role="banner"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed top-0 inset-x-0 z-nav',
            'hidden md:flex items-center justify-between',
            'px-8 h-16',
            'transition-all duration-500',
            scrolled
              ? 'bg-bg-deep/60 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)]'
              : isStudio
                ? 'bg-bg-mid/50 backdrop-blur-sm border-b border-white/5'
                : 'bg-transparent backdrop-blur-none',
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            {isStudio && (
              <Link
                href="/"
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-sm',
                  'text-text-tertiary hover:text-text-primary',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                )}
                aria-label="Back to public site"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span className="font-body text-xs">Site</span>
              </Link>
            )}
            <Link
              href={isStudio ? '/studio' : '/'}
              className="font-heading font-bold text-lg tracking-wide focus-visible:outline-accent-primary"
              aria-label={isStudio ? 'Studio Dashboard' : 'Comic Curated — Home'}
            >
              <GradientText>{isStudio ? 'CC Studio' : 'CC'}</GradientText>
            </Link>
          </div>

          {/* Nav links */}
          <nav role="navigation" aria-label={isStudio ? 'Studio' : 'Main'}>
            <ul className="flex items-center gap-1" role="list">
              {navItems.map(({ href, label, exact, title, icon: Icon }) => {
                const isActive = exact
                  ? pathname === href
                  : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={title ?? undefined}
                      className={cn(
                        'relative flex items-center gap-1.5 px-3 py-2 rounded-sm',
                        'font-body text-sm font-medium',
                        'transition-colors duration-150',
                        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                        isActive
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:text-text-primary',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {Icon && <Icon size={15} aria-hidden="true" className="shrink-0" />}
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute inset-x-2 -bottom-px h-px bg-accent-primary"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search (public only) */}
            {!isStudio && (
              <Link
                href="/search"
                className={cn(
                  'p-2 rounded-sm text-text-tertiary hover:text-text-primary transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                )}
                aria-label="Search titles"
              >
                <Search size={18} aria-hidden="true" />
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-sm text-text-tertiary hover:text-text-primary transition-colors',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              )}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={18} aria-hidden="true" />
              ) : (
                <Moon size={18} aria-hidden="true" />
              )}
            </button>

            {/* User menu (Studio only) */}
            {isStudio && <UserMenu />}
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
