// ============================================================
// Tag — genre/mood label chip
// Source of truth: docs/design/TYPOGRAPHY_SYSTEM.md
// ============================================================

import { cn } from '@/lib/cn';

interface TagProps {
  label: string;
  color?: string;
  emoji?: string;
  size?: 'xs' | 'sm';
  className?: string;
}

export function Tag({ label, color, emoji, size = 'sm', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'font-heading font-medium uppercase tracking-widest',
        'rounded-sm border border-white/10',
        'transition-colors duration-150',
        size === 'xs' && 'px-1.5 py-0.5 text-[10px]',
        size === 'sm' && 'px-2 py-1 text-xs',
        className,
      )}
      style={
        color
          ? {
              color,
              borderColor: `${color}40`,
              backgroundColor: `${color}15`,
            }
          : undefined
      }
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
    </span>
  );
}
