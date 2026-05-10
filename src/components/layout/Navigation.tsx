'use client';

// ============================================================
// Navigation — floating desktop nav
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/architecture/COMPONENT_ARCHITECTURE.md
//
// Behavior:
//   - Transparent at top, solid on scroll
//   - Hides on scroll-down, reveals on scroll-up
//   - Active route highlighted
// ============================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { GradientText } from '@/components/ui/GradientText';

const NAV_ITEMS = [
  { href: '/',         label: 'Home' },
  { href: '/library',  label: 'Library' },
  { href: '/discover', label: 'Discover' },
  { href: '/tiers',    label: 'Tiers' },
  { href: '/stats',    label: 'Stats' },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      setScrolled(currentY > 20);

      // Hide on scroll-down (> 60px from top), show on scroll-up
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
            'transition-colors duration-300',
            scrolled
              ? 'bg-bg-mid/90 backdrop-blur-md border-b border-white/5'
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
        </motion.header>
      )}
    </AnimatePresence>
  );
}
