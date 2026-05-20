'use client';

// ============================================================
// AnimatedCheckbox — Custom checkbox with smooth animated transitions
// Replaces native HTML checkboxes in the Settings card.
// Supports 'default' and 'warning' (yellow) variants.
// Requirements: 11.1, 11.2
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ── Props ─────────────────────────────────────────────────────

export interface AnimatedCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  variant?: 'default' | 'warning';
}

// ── Animation variants ────────────────────────────────────────

const checkmarkVariants = {
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
  unchecked: {
    pathLength: 0,
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
};

const boxVariants = {
  checked: { scale: 1 },
  unchecked: { scale: 1 },
  tap: { scale: 0.9 },
};

// ── Component ─────────────────────────────────────────────────

export function AnimatedCheckbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  variant = 'default',
}: AnimatedCheckboxProps) {
  const isWarning = variant === 'warning';

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-center gap-3 cursor-pointer group select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Hidden native checkbox for accessibility */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => {
          if (!disabled) onChange(e.target.checked);
        }}
        disabled={disabled}
        className="sr-only peer"
        aria-checked={checked}
      />

      {/* Animated checkbox box */}
      <motion.div
        variants={boxVariants}
        animate={checked ? 'checked' : 'unchecked'}
        whileTap={disabled ? undefined : 'tap'}
        className={cn(
          'relative flex items-center justify-center w-5 h-5 rounded border-2 transition-colors duration-200',
          // Unchecked states
          !checked && !isWarning && 'border-white/20 bg-bg-deep/60',
          !checked && isWarning && 'border-yellow-500/40 bg-bg-deep/60',
          // Checked states
          checked && !isWarning && 'border-accent-primary bg-accent-primary/20',
          checked && isWarning && 'border-yellow-500 bg-yellow-500/20',
          // Focus ring via peer
          'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-deep',
          !isWarning && 'peer-focus-visible:ring-accent-primary',
          isWarning && 'peer-focus-visible:ring-yellow-500'
        )}
        role="presentation"
      >
        {/* Animated checkmark SVG */}
        <motion.svg
          viewBox="0 0 16 16"
          fill="none"
          className="w-3 h-3"
          aria-hidden="true"
        >
          <motion.path
            d="M3 8.5L6.5 12L13 4"
            stroke={isWarning ? '#eab308' : 'currentColor'}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={checkmarkVariants}
            initial={false}
            animate={checked ? 'checked' : 'unchecked'}
            className={cn(!isWarning && 'text-accent-primary')}
          />
        </motion.svg>
      </motion.div>

      {/* Label text */}
      <span
        className={cn(
          'font-body text-sm transition-colors duration-200',
          !isWarning && 'text-text-primary group-hover:text-accent-primary',
          isWarning && 'text-text-primary group-hover:text-yellow-400',
          disabled && 'pointer-events-none'
        )}
      >
        {label}
      </span>
    </label>
  );
}
