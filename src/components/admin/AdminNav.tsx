'use client';

// ============================================================
// AdminNav — admin-specific navigation bar
// ============================================================

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/services/api';
import { cn } from '@/lib/cn';

const NAV_ITEMS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/titles', label: 'Titles' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header
      role="banner"
      className="fixed top-0 inset-x-0 z-nav h-16 flex items-center justify-between px-6 bg-bg-mid/95 backdrop-blur-md border-b border-white/5"
    >
      {/* Logo */}
      <Link
        href="/admin"
        className="font-heading text-sm font-bold uppercase tracking-widest text-text-primary focus-visible:outline-accent-primary"
      >
        CC Admin
      </Link>

      {/* Nav */}
      <nav role="navigation" aria-label="Admin navigation">
        <ul className="flex items-center gap-1" role="list">
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'px-3 py-1.5 rounded-sm font-body text-sm transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                    isActive
                      ? 'text-text-primary bg-surface-elevated'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-xs text-text-tertiary hover:text-text-secondary transition-colors focus-visible:outline-accent-primary"
        >
          View Site ↗
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            'px-3 py-1.5 rounded-sm font-body text-xs',
            'border border-white/10 text-text-secondary',
            'hover:border-white/20 hover:text-text-primary transition-colors',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          )}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
