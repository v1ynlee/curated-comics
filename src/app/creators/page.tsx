// ============================================================
// Creators Page — Artist, Author, and Studio Directory
// ============================================================

import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageHeading } from '@/components/ui/PageHeading';
import { CreatorsDirectory } from '@/components/creators/CreatorsDirectory';

export const metadata: Metadata = {
  title: 'Creators',
  description: 'Browse the artists, authors, and studios behind the curated comic library.',
};

export default function CreatorsPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden -mt-14 md:-mt-16">
      <div className="absolute top-0 inset-x-0 -z-10 h-[800px] w-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] h-[500px] w-[400px] rounded-full bg-accent-primary/10 blur-[120px] md:left-[10%] md:w-[600px]" />
        <div className="absolute top-[5%] right-[-20%] h-[500px] w-[400px] rounded-full bg-accent-secondary/10 blur-[120px] md:right-[10%] md:w-[500px]" />
      </div>

      <div className="container-content pt-12 md:pt-20 pb-24">
        <Breadcrumb
          className="mb-10 md:mb-5"
          items={[{ label: 'Home', href: '/' }, { label: 'Creators' }]}
        />

        <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center text-center md:mb-12">
          <PageHeading className="mb-6">Creators</PageHeading>
          <p className="max-w-lg text-balance font-body text-base leading-relaxed text-text-secondary md:text-lg">
            Browse the artists, authors, and studios behind the archive. Open a profile to see every linked title.
          </p>
          <div className="mt-10 h-px w-12 bg-text-primary/20" />
        </div>

        <CreatorsDirectory />
      </div>
    </div>
  );
}
