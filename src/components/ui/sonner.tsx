'use client';

// ============================================================
// Sonner Toaster — application-wide notification surface
// ============================================================

import type { CSSProperties } from 'react';
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useUIStore } from '@/stores/useUIStore';

export function Toaster(props: ToasterProps) {
  const theme = useUIStore((state) => state.theme);

  return (
    <Sonner
      position="top-right"
      theme={theme}
      duration={4200}
      gap={10}
      visibleToasts={4}
      closeButton={false}
      offset={{ top: 'calc(env(safe-area-inset-top, 0px) + 88px)', right: 'calc(env(safe-area-inset-right, 0px) + 24px)' }}
      mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 72px)', right: 'calc(env(safe-area-inset-right, 0px) + 12px)' }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-semantic-success" />,
        info: <InfoIcon className="size-4 text-accent-tertiary" />,
        warning: <TriangleAlertIcon className="size-4 text-semantic-warning" />,
        error: <OctagonXIcon className="size-4 text-semantic-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin text-accent-primary" />,
      }}
      className="toaster group"
      style={{
        '--width': 'min(356px, calc(100vw - 24px))',
        '--normal-bg': 'var(--app-header-surface)',
        '--normal-text': 'var(--app-text-primary)',
        '--normal-border': 'var(--app-header-border)',
        '--success-bg': 'color-mix(in srgb, var(--color-semantic-success) 10%, var(--app-header-surface))',
        '--success-text': 'var(--app-text-primary)',
        '--success-border': 'color-mix(in srgb, var(--color-semantic-success) 28%, transparent)',
        '--error-bg': 'color-mix(in srgb, var(--color-semantic-danger) 10%, var(--app-header-surface))',
        '--error-text': 'var(--app-text-primary)',
        '--error-border': 'color-mix(in srgb, var(--color-semantic-danger) 28%, transparent)',
        '--warning-bg': 'color-mix(in srgb, var(--color-semantic-warning) 10%, var(--app-header-surface))',
        '--warning-text': 'var(--app-text-primary)',
        '--warning-border': 'color-mix(in srgb, var(--color-semantic-warning) 28%, transparent)',
        '--border-radius': '8px',
      } as CSSProperties}
      toastOptions={{
        classNames: {
          toast: 'border font-body text-sm shadow-[var(--app-header-shadow)] backdrop-blur-lg',
          title: 'font-body text-sm font-medium text-text-primary',
          description: 'font-body text-xs text-text-secondary',
          actionButton: 'rounded-md bg-accent-primary px-2.5 py-1 font-heading text-xs text-white',
          cancelButton: 'rounded-md border border-white/10 bg-bg-deep/60 px-2.5 py-1 font-heading text-xs text-text-secondary',
        },
      }}
      {...props}
    />
  );
}
