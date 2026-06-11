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
  LayoutDashboard, BookOpen, FileText, Image as ImageIcon, Star, Home, UsersRound, History, ListChecks,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { GradientText } from '@/components/ui/GradientText';
import { useUIStore } from '@/stores/useUIStore';
import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser';
import { PUBLIC_NAV_ITEMS, STUDIO_NAV_ITEMS, type NavIconKey } from './nav-config';

const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  home: Home,
  book: BookOpen,
  search: Search,
  star: Star,
  dashboard: LayoutDashboard,
  users: UsersRound,
  file: FileText,
  image: ImageIcon,
  history: History,
  tasks: ListChecks,
};

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
          'w-9 h-9 rounded-full',
          'bg-gradient-to-tr from-surface-elevated/80 to-surface-elevated/30 shadow-sm',
          'border border-black/10 dark:border-white/10',
          'text-text-secondary hover:text-text-primary hover:border-black/20 dark:hover:border-white/20',
          'hover:shadow-md hover:scale-105',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <User size={16} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 top-full mt-3 z-50',
              'min-w-[220px] rounded-xl p-1.5',
              'bg-white/95 dark:bg-bg-surface/90 backdrop-blur-xl',
              'border border-black/10 dark:border-white/10',
              'shadow-xl shadow-black/5 dark:shadow-black/40',
            )}
            role="menu"
          >
            {email && (
              <div className="px-3 py-3 border-b border-black/5 dark:border-white/10 mb-1">
                <p className="font-body text-xs font-medium text-text-tertiary uppercase tracking-wider mb-0.5">Signed in as</p>
                <p className="font-body text-sm font-medium text-text-primary truncate">{email}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              role="menuitem"
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
                'font-body text-sm font-medium text-text-secondary',
                'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10',
                'transition-colors duration-150',
              )}
            >
              <LogOut size={15} aria-hidden="true" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className={cn(
            'fixed top-4 inset-x-4 md:inset-x-8 max-w-6xl mx-auto z-nav',
            'hidden md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-2',
            'px-4 h-14 rounded-full',
            'transition-all duration-300 ease-in-out',
            scrolled
              ? 'bg-white/80 dark:bg-bg-deep/75 backdrop-blur-lg border border-black/10 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
              : isStudio
                ? 'bg-white/60 dark:bg-bg-mid/60 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none'
                : 'bg-transparent backdrop-blur-none border border-transparent',
          )}
        >
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3 pl-1">
            {isStudio && (
              <Link
                href="/"
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5',
                  'bg-surface-elevated/30 hover:bg-surface-elevated/60',
                  'text-text-tertiary hover:text-text-primary',
                  'transition-all duration-200',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                )}
                aria-label="Back to public site"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span className="font-body text-xs font-medium">Site</span>
              </Link>
            )}
            <Link
              href={isStudio ? '/studio' : '/'}
              className={cn(
                'shrink-0 font-heading text-lg font-bold tracking-wide',
                'hover:opacity-80 transition-opacity duration-200',
                'focus-visible:outline-accent-primary',
              )}
              aria-label={isStudio ? 'Studio Dashboard' : 'Comic Curated — Home'}
            >
              <GradientText>{isStudio ? 'CC Studio' : 'CC'}</GradientText>
            </Link>
          </div>

          {/* Nav links */}
          <nav role="navigation" aria-label={isStudio ? 'Studio' : 'Main'} className="min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex min-w-max items-center justify-center gap-1" role="list">
              {navItems.map(({ href, label, exact, title, icon }) => {
                const Icon = NAV_ICONS[icon];
                const isActive = exact
                  ? pathname === href
                  : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={title ?? undefined}
                      className={cn(
                         'relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 xl:gap-2 xl:px-3',
                        'font-body text-sm font-medium',
                        'transition-colors duration-200',
                        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                        isActive
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:text-text-primary',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {Icon && (
                        <Icon 
                          size={15} 
                          aria-hidden="true" 
                          className={cn("shrink-0 transition-colors", isActive ? "text-accent-primary" : "")} 
                        />
                      )}
                      <span className="relative z-10 text-inherit">{label}</span>
                      
                      {/* Pill Background Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator-pill"
                          className="absolute inset-0 bg-text-primary/5 border border-text-primary/5 rounded-full -z-0 shadow-sm"
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right actions */}
           <div className="flex shrink-0 items-center gap-2 pr-1 xl:gap-3">
            {/* Search (public only) */}
            {!isStudio && (
              <Link
                href="/search"
                className={cn(
                  'p-2.5 rounded-full bg-surface-elevated/0 hover:bg-black/5 dark:hover:bg-white/10',
                  'text-text-tertiary hover:text-text-primary',
                  'transition-all duration-200',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                )}
                aria-label="Search titles"
              >
                <Search size={17} aria-hidden="true" />
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2.5 rounded-full bg-surface-elevated/0 hover:bg-black/5 dark:hover:bg-white/10',
                'text-text-tertiary hover:text-text-primary',
                'transition-all duration-200',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              )}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={17} aria-hidden="true" />
              ) : (
                <Moon size={17} aria-hidden="true" />
              )}
            </button>

            {/* User menu (Studio only) */}
            {isStudio && (
              <div className="pl-2 border-l border-black/10 dark:border-white/10">
                <UserMenu />
              </div>
            )}
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
