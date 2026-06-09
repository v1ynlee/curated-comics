'use client';

import { X } from 'lucide-react';
import { StudioField } from '@/components/studio/shared/StudioField';

interface InlineInsertPanelProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function InlineInsertPanel({ label, value, placeholder, onChange, onApply, onCancel }: InlineInsertPanelProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <StudioField label={label} htmlFor="inline-insert-input">
        <input
          id="inline-insert-input"
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="studio-input min-h-9 py-2 text-sm"
        />
      </StudioField>
      <div className="flex gap-2 sm:pb-0.5">
        <button type="button" onClick={onApply} className="studio-secondary-button">
          Apply
        </button>
        <button type="button" onClick={onCancel} className="studio-icon-button" aria-label="Cancel inline insert">
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
