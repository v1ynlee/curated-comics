'use client';

// ============================================================
// Button — redesigned with soft glow, layered shadows,
//          shimmer sweep, and modern rounded depth.
// Source of truth: docs/design/DESIGN_PRINCIPLES.md
//                  docs/motion/MOTION_SYSTEM.md
// ============================================================

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Render as child element (e.g. Link) */
  asChild?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    // Layered gradient background
    'bg-gradient-to-br from-accent-primary via-accent-primary to-[#6d28d9]',
    'text-white',
    // Soft multi-layer glow shadow
    'shadow-[0_2px_8px_rgba(139,92,246,0.35),0_0_0_1px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]',
    'hover:shadow-[0_4px_20px_rgba(139,92,246,0.55),0_0_0_1px_rgba(139,92,246,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:brightness-110',
    // Shimmer sweep on hover
    'btn-shimmer overflow-hidden',
  ].join(' '),
  secondary: [
    'bg-surface-elevated/60',
    'text-text-primary',
    'border border-white/10',
    'shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]',
    'hover:bg-surface-elevated/80',
    'hover:border-white/20',
    'hover:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
    'btn-shimmer overflow-hidden',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-text-secondary',
    'hover:text-text-primary',
    'hover:bg-white/5',
    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  ].join(' '),
  danger: [
    'bg-gradient-to-br from-semantic-danger to-[#b91c1c]',
    'text-white',
    'shadow-[0_2px_8px_rgba(239,68,68,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
    'hover:shadow-[0_4px_16px_rgba(239,68,68,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]',
    'hover:brightness-110',
    'btn-shimmer overflow-hidden',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-11 px-5 text-base gap-2 rounded-lg',
  lg: 'h-13 px-7 text-lg gap-2.5 rounded-xl',
};

const baseClasses = [
  'relative inline-flex items-center justify-center',
  'font-heading font-medium tracking-wide',
  'transition-all duration-200',
  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  'select-none',
].join(' ');

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      asChild = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={classes}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading && (
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
        <span className={cn('flex items-center gap-inherit', isLoading && 'invisible')}>
          {children}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
