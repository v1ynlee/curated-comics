import type { PublicationState } from '@/types/article';

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

export function buildFormData(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}
