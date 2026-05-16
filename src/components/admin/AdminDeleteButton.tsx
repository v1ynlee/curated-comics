'use client';

// ============================================================
// AdminDeleteButton — confirm + delete a single title
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminDeleteTitle } from '@/services/studio/admin';
import { cn } from '@/lib/utils/cn';

interface AdminDeleteButtonProps {
  titleId: string;
  titleName: string;
}

export function AdminDeleteButton({ titleId, titleName }: AdminDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${titleName}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await adminDeleteTitle(titleId);
      router.push('/admin/titles');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Delete failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={cn(
        'px-3 py-2 rounded-sm font-heading text-xs uppercase tracking-widest',
        'border border-semantic-danger/30 text-semantic-danger',
        'hover:bg-semantic-danger/10 transition-colors',
        'focus-visible:outline-2 focus-visible:outline-semantic-danger focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
