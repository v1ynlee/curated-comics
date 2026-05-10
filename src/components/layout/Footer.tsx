// ============================================================
// Footer — minimal cinematic footer
// ============================================================

import Link from 'next/link';
import { GradientText } from '@/components/ui/GradientText';

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-white/5 bg-bg-mid/50 py-8 mt-24"
    >
      <div className="container-content flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link
          href="/"
          className="font-heading font-bold text-sm tracking-wide focus-visible:outline-accent-primary"
          aria-label="Comic Curated — Home"
        >
          <GradientText>Comic Curated</GradientText>
        </Link>
        <p className="font-body text-xs text-text-tertiary">
          A personal reading archive. Built with passion.
        </p>
      </div>
    </footer>
  );
}
