'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StudioNoticeProps {
  notice: { type: 'success' | 'error'; message: string };
  onDismiss: () => void;
}

export function StudioNotice({ notice, onDismiss }: StudioNoticeProps) {
  return (
    <div
      className={cn(
        'mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
        notice.type === 'success'
          ? 'border-semantic-success/25 bg-semantic-success/10 text-semantic-success'
          : 'border-semantic-danger/25 bg-semantic-danger/10 text-semantic-danger',
      )}
      role="status"
    >
      <span>{notice.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-sm opacity-70 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2"
        aria-label="Dismiss message"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
