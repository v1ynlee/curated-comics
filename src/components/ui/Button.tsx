'use client';

// ============================================================
// Button — base interactive element
// Source of truth: docs/design/DESIGN_PRINCIPLES.md
//                  docs/motion/MOTION_SYSTEM.md
// ============================================================

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent-primary text-white',
    'hover:brightness-110',
    'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    'hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]',
  ].join(' '),
  secondary: [
    'bg-surface-elevated text-text-primary border border-white/10',
    'hover:border-white/20 hover:bg-surface-elevated/80',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-secondary',
    'hover:text-text-primary hover:bg-white/5',
  ].join(' '),
  danger: [
    'bg-semantic-danger text-white',
    'hover:brightness-110',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-base gap-2',
  lg: 'h-13 px-7 text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center',
          'font-heading font-medium tracking-wide',
          'rounded-sm transition-all duration-150',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
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
