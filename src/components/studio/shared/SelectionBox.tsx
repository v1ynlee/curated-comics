'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SelectionBoxProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

export function SelectionBox({ checked, label, onChange }: SelectionBoxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        checked
          ? 'border-accent-primary bg-accent-primary text-white'
          : 'border-white/15 bg-bg-deep/60 text-transparent hover:border-white/30',
      )}
    >
      <Check size={13} aria-hidden="true" />
    </button>
  );
}
