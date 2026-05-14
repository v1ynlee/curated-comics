'use client';

// ============================================================
// NewsTab — Coming Soon placeholder
// ============================================================

import { Newspaper, Clock, Bell } from 'lucide-react';

export function NewsTab() {
  return (
    <div className="flex flex-col items-center gap-5 py-14 text-center px-4">
      {/* Icon cluster */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-surface-elevated/50 flex items-center justify-center">
          <Newspaper size={28} className="text-text-tertiary" aria-hidden="true" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
          <Clock size={12} className="text-accent-primary" aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-text-primary">
          Coming Soon
        </h3>
        <p className="font-body text-sm text-text-secondary leading-relaxed">
          News, articles, and updates for this title will appear here in a future update.
        </p>
      </div>

      {/* Notify placeholder */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-elevated/30 border border-white/5 text-text-tertiary">
        <Bell size={13} aria-hidden="true" />
        <span className="font-heading text-[10px] uppercase tracking-widest">
          Notifications coming soon
        </span>
      </div>
    </div>
  );
}
