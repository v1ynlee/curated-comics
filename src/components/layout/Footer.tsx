// ============================================================
// Footer — cinematic footer with copyright
// ============================================================

import Link from 'next/link';
import { Copyright } from 'lucide-react';
import { GradientText } from '@/components/ui/GradientText';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-white/5 bg-bg-mid/50 py-8 mt-24"
    >
      <div className="container-content flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        {/* Brand */}
        <Link
          href="/"
          className="font-heading font-bold text-sm tracking-wide focus-visible:outline-accent-primary"
          aria-label="Comic Curated — Home"
        >
          <GradientText>Comic Curated</GradientText>
        </Link>

        {/* Copyright */}
        <div className="flex items-center gap-1.5 font-body text-xs text-text-tertiary">
          <Copyright size={12} aria-hidden="true" />
          <span>{year} v1ynlee. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
