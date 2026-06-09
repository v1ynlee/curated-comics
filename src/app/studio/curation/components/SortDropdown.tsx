'use client';

// ============================================================
// SortDropdown — non-native curation sort selector
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type SortKey = 'title' | 'updated' | 'created' | 'total-titles';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'updated', label: 'Updated date' },
  { value: 'created', label: 'Created date' },
  { value: 'title', label: 'Title' },
  { value: 'total-titles', label: 'Total titles' },
];

export function SortDropdown({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => OPTIONS.findIndex((option) => option.value === value));
  const ref = useRef<HTMLDivElement>(null);
  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(OPTIONS.length - 1, index + 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const option = OPTIONS[activeIndex];
        if (option) {
          onChange(option.value);
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [activeIndex, onChange, open]);

  return (
    <div ref={ref} className="relative min-w-40">
      <button
        type="button"
        onClick={() => {
          setActiveIndex(OPTIONS.findIndex((option) => option.value === value));
          setOpen((current) => !current);
        }}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-white/10 bg-bg-deep/50 px-3 font-body text-sm text-text-secondary outline-none transition-colors hover:border-white/20 hover:text-text-primary focus-visible:border-accent-primary/60 focus-visible:outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort curation items"
      >
        {selected.label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute right-0 top-full z-30 mt-1 w-full rounded-lg border border-white/10 bg-bg-surface p-1 shadow-lg shadow-black/20"
            role="listbox"
          >
            {OPTIONS.map((option, index) => {
              const selectedOption = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left font-body text-sm transition-colors',
                    activeIndex === index ? 'bg-white/7 text-text-primary' : 'text-text-secondary',
                  )}
                  role="option"
                  aria-selected={selectedOption}
                >
                  {option.label}
                  {selectedOption && <Check className="h-4 w-4 text-accent-primary" aria-hidden="true" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
