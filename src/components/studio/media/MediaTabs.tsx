'use client';

import { cn } from '@/lib/utils/cn';
import type { MediaTab } from '@/app/studio/media/types';

const TABS: { value: MediaTab; label: string }[] = [
  { value: 'assets', label: 'Assets' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'characters', label: 'Characters' },
  { value: 'storage-explorer', label: 'Storage Explorer' },
  { value: 'storage', label: 'Storage' },
  { value: 'usage', label: 'Usage' },
];

export function MediaTabs({ activeTab, onChange }: { activeTab: MediaTab; onChange: (tab: MediaTab) => void }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/10" aria-label="Media sections">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'h-10 shrink-0 border-b-2 px-3 font-heading text-sm transition-colors',
            activeTab === tab.value
              ? 'border-accent-primary text-text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary',
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
