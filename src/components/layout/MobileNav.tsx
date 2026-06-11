'use client';

// ============================================================
// MobileNav — bottom tab bar for mobile
// Source of truth: docs/design/MOBILE_EXPERIENCE.md
//                  docs/design/UI_UX_DIRECTION.md
//
// Hides on scroll-down, reveals on scroll-up.
// Adapts for /studio/* routes with Studio-specific items.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, History, Home, Image as ImageIcon, LayoutDashboard, ListChecks, Search, Star, UsersRound, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
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

// ── Component ─────────────────────────────────────────────────

export function MobileNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isStudio = pathname.startsWith('/studio');
  const navItems = isStudio ? STUDIO_NAV_ITEMS : PUBLIC_NAV_ITEMS;
  const shouldShow = visible;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

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
      {shouldShow && (
        <motion.nav
          role="navigation"
          aria-label={isStudio ? 'Studio' : 'Main'}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed bottom-0 inset-x-0 z-nav',
            'md:hidden',
            'bg-bg-mid/95 backdrop-blur-md',
            'border-t border-white/5',
            'pb-safe',
          )}
        >
          <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul
              className="flex h-16 min-w-max items-center gap-1 px-2"
              role="list"
            >
            {navItems.map(({ href, label, exact, icon }) => {
              const Icon = NAV_ICONS[icon];
              const isActive = exact
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    className={cn(
                      'flex min-h-[44px] min-w-[64px] flex-col items-center gap-1 px-2 py-2',
                      'rounded-sm transition-colors duration-150',
                      'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                      isActive
                        ? 'text-accent-primary'
                        : 'text-text-tertiary hover:text-text-secondary',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-[10px] font-heading font-medium tracking-wide">
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
            </ul>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
