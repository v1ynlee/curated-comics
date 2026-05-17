'use client';

// ============================================================
// MobileHeader — top bar for mobile (< md breakpoint)
// Contains: logo, search icon, theme toggle.
// Desktop nav handles everything at md+, so this is md:hidden.
// Hidden on /studio/* routes (StudioHeader takes over there).
// ============================================================

import Link from 'next/link';
import { Search, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { GradientText } from '@/components/ui/GradientText';
import { useUIStore } from '@/stores/useUIStore';

export function MobileHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Studio has its own header — suppress the global mobile header there
  const isStudio = pathname.startsWith('/studio');

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      setScrolled(currentY > 20);
      // Hide on scroll-down past 60px, reveal on scroll-up
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

  if (isStudio) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          role="banner"
          aria-label="Site header"
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            // Only visible on mobile — desktop nav takes over at md
            'fixed top-0 inset-x-0 z-nav',
            'flex md:hidden items-center justify-between',
            'px-4 h-14',
            'transition-all duration-300',
            scrolled
              ? 'bg-bg-mid/95 backdrop-blur-md border-b border-white/5 shadow-[0_1px_16px_rgba(0,0,0,0.12)]'
              : 'bg-bg-deep/80 backdrop-blur-sm',
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-heading font-bold text-base tracking-wide focus-visible:outline-accent-primary rounded-sm"
            aria-label="Comic Curated — Home"
          >
            <GradientText>Comic Curated</GradientText>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <Link
              href="/search"
              className={cn(
                'p-2.5 rounded-sm',
                'text-text-tertiary hover:text-text-primary',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                // Minimum touch target
                'min-h-[44px] min-w-[44px] flex items-center justify-center',
              )}
              aria-label="Search titles"
            >
              <Search size={18} aria-hidden="true" />
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2.5 rounded-sm',
                'text-text-tertiary hover:text-text-primary',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                'min-h-[44px] min-w-[44px] flex items-center justify-center',
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
