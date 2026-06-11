import { EDITORIAL_STATE_LABELS } from '@/services/studio/article-workflow';
import type { EditorialState, PublicationState } from '@/types/article';

export function formatDateTime(value: string | null, fallback = 'No date') {
  if (!value) return fallback;

  return new Date(value)
    .toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    .replace(',', '');
}

export function formatState(value: PublicationState) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatWorkflowState(value: EditorialState) {
  return EDITORIAL_STATE_LABELS[value];
}

export function articleCategoryTone(name: string | null, slug: string | null) {
  const key = `${slug ?? ''} ${name ?? ''}`.toLowerCase();
  if (key.includes('release')) return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
  if (key.includes('hiatus')) return 'border-yellow-400/25 bg-yellow-400/10 text-yellow-300';
  if (key.includes('axed') || key.includes('cancel')) return 'border-red-400/25 bg-red-400/10 text-red-300';
  if (key.includes('anime') || key.includes('adaptation')) return 'border-violet-400/25 bg-violet-400/10 text-violet-300';
  if (key.includes('industry')) return 'border-sky-400/20 bg-sky-400/10 text-sky-300';
  if (key.includes('review')) return 'border-orange-400/25 bg-orange-400/10 text-orange-300';
  return 'border-white/10 bg-white/5 text-text-secondary';
}

export function buildFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}
