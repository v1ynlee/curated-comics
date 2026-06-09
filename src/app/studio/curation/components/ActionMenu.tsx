'use client';

// ============================================================
// Editorial row action menu
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  Copy,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ActionTone = 'edit' | 'preview' | 'duplicate' | 'archive' | 'delete' | 'default';

const TONE_CLASS: Record<ActionTone, string> = {
  edit: 'text-amber-400 hover:bg-amber-400/10',
  preview: 'text-emerald-400 hover:bg-emerald-400/10',
  duplicate: 'text-accent-tertiary hover:bg-accent-tertiary/10',
  archive: 'text-text-secondary hover:bg-white/5',
  delete: 'text-semantic-danger hover:bg-semantic-danger/10',
  default: 'text-text-secondary hover:bg-white/5',
};

const ICONS: Record<ActionTone, LucideIcon> = {
  edit: Pencil,
  preview: Eye,
  duplicate: Copy,
  archive: Archive,
  delete: Trash2,
  default: MoreVertical,
};

export interface ActionMenuItem {
  label: string;
  tone: ActionTone;
  onSelect: () => void;
  disabled?: boolean;
}

export function ActionMenu({ items, label = 'Row actions' }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute right-0 top-full z-30 mt-1 min-w-40 rounded-lg border border-white/10 bg-bg-surface p-1 shadow-lg shadow-black/20"
            role="menu"
          >
            {items.map((item) => {
              const Icon = ICONS[item.tone];
              return (
                <button
                  key={item.label}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    item.onSelect();
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left font-body text-sm transition-colors',
                    TONE_CLASS[item.tone],
                    item.disabled && 'cursor-not-allowed opacity-40',
                  )}
                  role="menuitem"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
