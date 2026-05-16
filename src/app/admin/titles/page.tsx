'use client';

// ============================================================
// Admin Titles List — with bulk operations
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import {
  adminFetchTitles,
  adminBulkUpdateStatus,
  adminBulkDelete,
  type AdminTitleRow,
} from '@/services/studio/admin';
import { READING_STATUS_LABELS } from '@/lib/utils/constants';
import type { ReadingStatus } from '@/types/title';

export default function AdminTitlesPage() {
  const [titles, setTitles] = useState<AdminTitleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ReadingStatus>('reading');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminFetchTitles()
      .then(setTitles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = titles.filter((t) =>
    t.title_english.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  };

  const handleBulkStatus = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await adminBulkUpdateStatus([...selected], bulkStatus);
      setTitles((prev) =>
        prev.map((t) =>
          selected.has(t.id) ? { ...t, reading_status: bulkStatus } : t,
        ),
      );
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} title(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      await adminBulkDelete([...selected]);
      setTitles((prev) => prev.filter((t) => !selected.has(t.id)));
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="container-content py-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-text-primary">Titles</h1>
          <p className="font-body text-sm text-text-secondary">
            {loading ? '…' : `${titles.length} titles`}
          </p>
        </div>
        <Link
          href="/admin/titles/new"
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-sm',
            'font-heading text-xs uppercase tracking-widest',
            'bg-accent-primary text-white hover:brightness-110 transition-all',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Title
        </Link>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search titles…"
        className={cn(
          'w-full mb-4 px-3 py-2.5 rounded-sm',
          'bg-surface-elevated border border-white/10',
          'font-body text-sm text-text-primary placeholder:text-text-tertiary',
          'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-primary',
        )}
        aria-label="Search titles"
      />

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-sm bg-surface-elevated/50 border border-white/10">
          <span className="font-body text-sm text-text-secondary">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as ReadingStatus)}
              className={cn(
                'px-2 py-1.5 rounded-sm bg-surface-elevated border border-white/10',
                'font-body text-xs text-text-secondary',
                'focus:outline-none focus-visible:outline-accent-primary',
              )}
              aria-label="Bulk status"
            >
              {Object.entries(READING_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={handleBulkStatus}
              disabled={bulkLoading}
              className={cn(
                'px-3 py-1.5 rounded-sm font-heading text-xs uppercase tracking-widest',
                'bg-surface-elevated border border-white/10 text-text-secondary',
                'hover:border-white/20 hover:text-text-primary transition-colors',
                'disabled:opacity-50',
              )}
            >
              Update Status
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className={cn(
                'px-3 py-1.5 rounded-sm font-heading text-xs uppercase tracking-widest',
                'bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger',
                'hover:bg-semantic-danger/20 transition-colors',
                'disabled:opacity-50',
              )}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-sm animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="rounded-sm border border-white/10 overflow-hidden">
          <table className="w-full" role="grid" aria-label="Titles list">
            <thead>
              <tr className="border-b border-white/10 bg-surface-elevated/30">
                <th className="w-10 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded-sm accent-accent-primary"
                    aria-label="Select all"
                  />
                </th>
                <th className="px-3 py-3 text-left font-heading text-[10px] uppercase tracking-widest text-text-tertiary">
                  Title
                </th>
                <th className="px-3 py-3 text-left font-heading text-[10px] uppercase tracking-widest text-text-tertiary hidden sm:table-cell">
                  Status
                </th>
                <th className="px-3 py-3 text-left font-heading text-[10px] uppercase tracking-widest text-text-tertiary hidden md:table-cell">
                  Tier
                </th>
                <th className="px-3 py-3 text-left font-heading text-[10px] uppercase tracking-widest text-text-tertiary hidden md:table-cell">
                  Ch.
                </th>
                <th className="w-20 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center font-body text-sm text-text-tertiary">
                    No titles found.
                  </td>
                </tr>
              ) : (
                filtered.map((title) => (
                  <tr
                    key={title.id}
                    className={cn(
                      'border-b border-white/5 last:border-0',
                      'hover:bg-surface-elevated/20 transition-colors',
                      selected.has(title.id) && 'bg-accent-primary/5',
                    )}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(title.id)}
                        onChange={() => toggleSelect(title.id)}
                        className="h-4 w-4 rounded-sm accent-accent-primary"
                        aria-label={`Select ${title.title_english}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body text-sm text-text-primary line-clamp-1">
                          {title.title_english}
                        </span>
                        <span className="font-heading text-[10px] uppercase tracking-widest text-text-tertiary">
                          {title.origin}
                          {title.hidden && (
                            <span className="ml-2 text-semantic-warning">hidden</span>
                          )}
                          {title.featured && (
                            <span className="ml-2 text-accent-secondary">featured</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="font-body text-xs text-text-secondary">
                        {READING_STATUS_LABELS[title.reading_status] ?? title.reading_status}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="font-data text-xs text-text-tertiary">
                        {title.tier ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="font-data text-xs text-text-tertiary">
                        {title.chapters_read}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/titles/${title.slug}/edit`}
                        className={cn(
                          'px-2 py-1 rounded-sm font-heading text-[10px] uppercase tracking-widest',
                          'border border-white/10 text-text-tertiary',
                          'hover:border-white/20 hover:text-text-primary transition-colors',
                          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                        )}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
