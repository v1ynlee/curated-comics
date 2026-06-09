'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface StudioSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface StudioSelectProps<T extends string = string> {
  label: string;
  value: T;
  options: StudioSelectOption<T>[];
  onChange: (value: T) => void;
  hideLabel?: boolean;
  prefixLabel?: boolean;
  placeholder?: string;
  disabled?: boolean;
  triggerIcon?: ReactNode;
  align?: 'left' | 'right';
  maxMenuHeightClassName?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

export function StudioSelect<T extends string = string>({
  label,
  value,
  options,
  onChange,
  hideLabel = false,
  prefixLabel = false,
  placeholder = 'Select',
  disabled = false,
  triggerIcon,
  align = 'left',
  maxMenuHeightClassName = 'max-h-64',
  className,
  buttonClassName,
  menuClassName,
}: StudioSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative min-w-0', className)}>
      {!hideLabel && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-white/10 bg-bg-deep/60 px-3 text-left',
          'text-sm text-text-primary transition-colors duration-150 hover:border-white/20',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          buttonClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {triggerIcon}
          <span className="min-w-0 truncate">
            {prefixLabel && <span className="text-text-tertiary">{label}: </span>}
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={cn('shrink-0 text-text-tertiary transition-transform duration-150', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          data-lenis-prevent=""
          data-lenis-prevent-wheel=""
          data-lenis-prevent-touch=""
          onWheel={(event) => event.stopPropagation()}
          className={cn(
            'studio-dropdown-panel studio-dropdown-scroll absolute top-full z-50 mt-1 min-w-full rounded-md border border-white/10 bg-bg-surface py-1 shadow-lg shadow-black/15',
            align === 'right' ? 'right-0' : 'left-0',
            maxMenuHeightClassName,
            menuClassName,
          )}
        >
          <div role="listbox" aria-label={label}>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value || 'empty'}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors duration-100',
                    active ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
                  )}
                >
                  <span className="min-w-0 truncate">
                    <span className="truncate">{option.label}</span>
                    {option.description && <span className="ml-2 text-xs text-text-tertiary">{option.description}</span>}
                  </span>
                  {active && <Check size={14} className="shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
