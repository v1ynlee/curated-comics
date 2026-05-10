// ============================================================
// FormField — labeled input wrapper for admin forms
// ============================================================

import { cn } from '@/lib/cn';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-secondary"
      >
        {label}
        {required && (
          <span className="text-semantic-danger ml-1" aria-hidden="true">*</span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p className="font-body text-xs text-text-tertiary">{hint}</p>
      )}
      {error && (
        <p role="alert" className="font-body text-xs text-semantic-danger">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Shared input styles ───────────────────────────────────────

export const inputClasses = [
  'w-full px-3 py-2.5 rounded-sm',
  'bg-surface-elevated border border-white/10',
  'font-body text-sm text-text-primary',
  'placeholder:text-text-tertiary',
  'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
  'transition-colors hover:border-white/20',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

export const selectClasses = [
  inputClasses,
  'cursor-pointer',
].join(' ');

export const textareaClasses = [
  inputClasses,
  'resize-y min-h-[100px]',
].join(' ');
