// ============================================================
// TierLabel — tier name with glow/gradient visual treatment
// Source of truth: docs/design/UI_UX_DIRECTION.md — Tier List View
//                  docs/architecture/CONTENT_STRUCTURE.md — Tier System
// ============================================================

import { cn } from '@/lib/utils/cn';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel } from '@/types/title';

interface TierLabelProps {
  tier: TierLevel;
  className?: string;
}

export function TierLabel({ tier, className }: TierLabelProps) {
  const config = TIER_CONFIG[tier];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Tier level */}
      <span
        className={cn(
          'font-heading font-black text-5xl md:text-6xl leading-none tracking-tight',
          config.textEffect === 'glow' && 'glow-text-gold',
        )}
        style={
          config.textEffect === 'gradient'
            ? {
                background: `linear-gradient(135deg, ${config.color}, ${config.color}88)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }
            : config.textEffect === 'glow'
            ? { color: config.color }
            : { color: config.color }
        }
      >
        {tier}
      </span>

      {/* Tier label */}
      <span
        className="font-heading text-xs uppercase tracking-[0.2em] font-medium"
        style={{ color: `${config.color}99` }}
      >
        {config.label}
      </span>

      {/* Tier description */}
      <span className="font-accent text-sm text-text-tertiary italic">
        {config.description}
      </span>
    </div>
  );
}
