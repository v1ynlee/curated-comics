'use client';

// ============================================================
// Navigation — floating desktop nav
// Hidden on /studio/* routes (StudioHeader takes over there).
// ============================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { GradientText } from '@/components/ui/GradientText';
import { useUIStore } from '@/stores/useUIStore';

const NAV_ITEMS = [
  { href: '/',         label: 'Home' },
  { href: '/library',  label: 'Library' },
  { href: '/discover', label: 'Discover' },
  { href: '/tiers',    label: 'Tiers' },
  { href: '/stats',    label: 'Stats' },
  { href: '/news',     label: 'News' },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { theme, toggleTheme } = useUIStore();

  // Studio has its own header — suppress the global nav there
  const isStudio = pathname.startsWith('/studio');
  if (isStudio) return null;

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
            'transition-all duration-300',
            scrolled
              ? 'bg-bg-mid/90 backdrop-blur-md border-b border-white/5 shadow-[0_1px_20px_rgba(0,0,0,0.15)]'
              : 'bg-transparent',
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-heading font-bold text-lg tracking-wide focus-visible:outline-accent-primary"
            aria-label="Comic Curated — Home"
          >
            <GradientText>CC</GradientText>
          </Link>

          {/* Nav links */}
          <nav role="navigation" aria-label="Main">
            <ul className="flex items-center gap-1" role="list">
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive =
                  href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'relative px-4 py-2 rounded-sm',
                        'font-body text-sm font-medium',
                        'transition-colors duration-150',
                        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                        isActive
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:text-text-primary',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
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
          <div className="flex items-center gap-1">
            {/* Search */}
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
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
