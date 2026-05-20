'use client';

// ============================================================
// Toast — Lightweight notification system for Studio.
// Fixed position, auto-dismiss, supports undo actions.
// Uses aria-live for screen reader announcements.
// ============================================================

import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ── Types ─────────────────────────────────────────────────────

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ── Context ───────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = toast.duration ?? 5000;

      setToasts((prev) => {
        const next = [...prev, { ...toast, id }];
        // Keep only the most recent MAX_TOASTS
        return next.slice(-MAX_TOASTS);
      });

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// ── Container ─────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'fixed bottom-4 right-4 z-toast',
        'flex flex-col gap-2',
        'max-w-sm w-full',
        // On mobile, center at bottom
        'max-sm:left-4 max-sm:right-4 max-sm:bottom-20',
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Individual Toast ──────────────────────────────────────────

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ICON_COLOR_MAP = {
  success: 'text-semantic-success',
  error: 'text-semantic-danger',
  info: 'text-accent-tertiary',
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = ICON_MAP[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg',
        'bg-bg-surface/95 backdrop-blur-md',
        'border border-white/10',
        'shadow-lg shadow-black/20',
      )}
      role="alert"
    >
      <Icon
        size={16}
        className={cn('shrink-0 mt-0.5', ICON_COLOR_MAP[toast.type])}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-text-primary">
          {toast.message}
        </p>
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className={cn(
              'mt-1 font-heading text-xs font-bold text-accent-primary',
              'hover:text-accent-primary/80 transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 rounded-sm',
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'shrink-0 p-1 rounded-sm',
          'text-text-tertiary hover:text-text-secondary',
          'transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
        aria-label="Dismiss notification"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
