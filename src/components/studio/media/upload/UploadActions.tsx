'use client';

export function UploadActions({ disabled, onChoose }: { disabled: boolean; onChoose: () => void }) {
  return <button type="button" disabled={disabled} onClick={onChoose} className="inline-flex h-9 items-center rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-50">Upload Asset</button>;
}
