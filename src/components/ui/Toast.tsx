'use client';

// ============================================================
// Toast — compatibility bridge to Sonner
// ============================================================

import { toast as sonnerToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id?: string | number;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
  message: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Toast) => string | number;
  removeToast: (id: string | number) => void;
}

function showToast({ type, message, description, action, duration, id }: Toast) {
  const options = { id, description, action, duration };

  if (type === 'success') return sonnerToast.success(message, options);
  if (type === 'error') return sonnerToast.error(message, options);
  if (type === 'warning') return sonnerToast.warning(message, options);
  if (type === 'loading') return sonnerToast.loading(message, options);
  return sonnerToast.info(message, options);
}

export function useToast(): ToastContextValue {
  return {
    addToast: showToast,
    removeToast: sonnerToast.dismiss,
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
