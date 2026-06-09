// ============================================================
// Creator Detail Page
// ============================================================

import type { Metadata } from 'next';
import { CreatorDetailClient } from '@/components/creators/CreatorDetailClient';

interface CreatorPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Creator',
  description: 'Creator profile and linked comic titles.',
};

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { slug } = await params;

  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      <div className="absolute top-0 inset-x-0 -z-10 h-[720px] w-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-12%] left-[-20%] h-[480px] w-[420px] rounded-full bg-accent-primary/10 blur-[120px] md:left-[8%] md:w-[600px]" />
        <div className="absolute top-[12%] right-[-18%] h-[420px] w-[360px] rounded-full bg-accent-tertiary/10 blur-[110px] md:right-[12%] md:w-[520px]" />
      </div>

      <main className="container-content pt-24 md:pt-28 pb-24">
        <CreatorDetailClient slug={slug} />
      </main>
    </div>
  );
}
