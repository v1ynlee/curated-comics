// ============================================================
// Admin Layout — isolated from public site layout
// Has its own nav, no public navigation/footer.
// ============================================================

import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: {
    default: 'Admin — Comic Curated',
    template: '%s — Admin',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-deep text-text-primary">
      <AdminNav />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
