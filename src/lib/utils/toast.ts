'use client';

// ============================================================
// Toast helpers — concise Studio feedback wrappers
// ============================================================

import { toast } from 'sonner';

export interface ActionResult {
  success: boolean;
  error?: string | null;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

export function toastResult(result: ActionResult, successMessage: string, fallbackError = 'Action failed.'): boolean {
  if (result.success) {
    toast.success(successMessage);
    return true;
  }

  toast.error(result.error || fallbackError);
  return false;
}

export function toastUnexpected(error: unknown, fallback = 'Unexpected error.'): string {
  const message = getErrorMessage(error, fallback);
  toast.error(message);
  return message;
}

export { toast };
