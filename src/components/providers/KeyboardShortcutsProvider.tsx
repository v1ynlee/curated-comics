'use client';

// ============================================================
// KeyboardShortcutsProvider — activates global keyboard shortcuts
// Must be a client component to use the hook.
// ============================================================

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}
