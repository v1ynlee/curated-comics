'use client';

// ============================================================
// BackToTop — floating bottom-right scroll-to-top button
// Appears after scrolling 400px, smooth-scrolls to top.
// Respects prefers-reduced-motion.
// ============================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (prefersReduced) {
      window.scrollTo({ top: 0 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          whileHover={{ y: -2, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className={cn(
            // Position — above mobile nav on small screens
            'fixed bottom-24 right-5 md:bottom-8 md:right-6',
            'z-toast',
            // Shape & size
            'h-11 w-11 rounded-xl',
            // Layered gradient + glow — matches primary button style
            'bg-gradient-to-br from-accent-primary via-accent-primary to-[#6d28d9]',
            'text-white',
            'shadow-[0_4px_16px_rgba(139,92,246,0.45),0_0_0_1px_rgba(139,92,246,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]',
            'hover:shadow-[0_6px_24px_rgba(139,92,246,0.65),0_0_0_1px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]',
            // Layout
            'flex items-center justify-center',
            'transition-shadow duration-200',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
        >
          <ArrowUp size={18} strokeWidth={2.5} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
