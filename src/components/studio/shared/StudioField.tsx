import type { ReactNode } from 'react';

interface StudioFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function StudioField({ label, htmlFor, required, hint, children }: StudioFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-text-secondary">
          {label}{required ? ' *' : ''}
        </label>
        {hint && <span className="font-data text-[11px] text-text-tertiary">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
