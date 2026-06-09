import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ── Mocks ─────────────────────────────────────────────────────

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Track the pathname for different test scenarios
let mockPathname = '/studio';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, className, initial: _initial, animate: _animate, exit: _exit, transition: _transition, layoutId: _layoutId, ...props }: any) => (
      <header className={className} {...props}>{children}</header>
    ),
    nav: ({ children, className, initial: _initial, animate: _animate, exit: _exit, transition: _transition, layoutId: _layoutId, ...props }: any) => (
      <nav className={className} {...props}>{children}</nav>
    ),
    span: ({ children, className, initial: _initial, animate: _animate, exit: _exit, transition: _transition, layoutId: _layoutId, ...props }: any) => (
      <span className={className} {...props}>{children}</span>
    ),
    div: ({ children, className, initial: _initial, animate: _animate, exit: _exit, transition: _transition, layoutId: _layoutId, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock supabase browser client
vi.mock('@/lib/db/supabase-browser', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      signOut: () => Promise.resolve(),
    },
  }),
}));

// Mock UI store
vi.mock('@/stores/useUIStore', () => ({
  useUIStore: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

// Mock GradientText
vi.mock('@/components/ui/GradientText', () => ({
  GradientText: ({ children }: any) => <span data-testid="gradient-text">{children}</span>,
}));

// ── Imports (after mocks) ─────────────────────────────────────

import { Navigation } from '@/components/layout/Navigation';
import { MobileNav } from '@/components/layout/MobileNav';

// ── Navigation Tests — Studio Mode ───────────────────────────

describe('Navigation — Studio adaptation', () => {
  beforeEach(() => {
    mockPathname = '/studio';
  });

  describe('Studio nav items are shown on /studio/* routes', () => {
    it('renders Studio navigation items when on /studio', () => {
      render(<Navigation />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Titles')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('Media')).toBeInTheDocument();
      expect(screen.getByText('Curation')).toBeInTheDocument();
    });

    it('does NOT render public nav items when on /studio', () => {
      render(<Navigation />);

      expect(screen.queryByText('Home')).toBeNull();
      expect(screen.queryByText('Library')).toBeNull();
      expect(screen.queryByText('Discover')).toBeNull();
      expect(screen.queryByText('Tiers')).toBeNull();
      expect(screen.queryByText('Stats')).toBeNull();
      expect(screen.queryByText('News')).toBeNull();
    });

    it('renders "CC Studio" branding instead of "CC"', () => {
      render(<Navigation />);

      const gradientTexts = screen.getAllByTestId('gradient-text');
      const studioText = gradientTexts.find(el => el.textContent === 'CC Studio');
      expect(studioText).toBeInTheDocument();
    });

    it('renders a "Back to Site" link', () => {
      render(<Navigation />);

      const backLink = screen.getByLabelText('Back to public site');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('does NOT render search icon on Studio routes', () => {
      const { container } = render(<Navigation />);

      const searchLink = container.querySelector('[aria-label="Search titles"]');
      expect(searchLink).toBeNull();
    });

    it('renders theme toggle on Studio routes', () => {
      render(<Navigation />);

      const themeButton = screen.getByLabelText(/switch to/i);
      expect(themeButton).toBeInTheDocument();
    });

    it('Studio nav links have correct hrefs', () => {
      render(<Navigation />);

      expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/studio');
      expect(screen.getByText('Titles').closest('a')).toHaveAttribute('href', '/studio/titles');
      expect(screen.getByText('Articles').closest('a')).toHaveAttribute('href', '/studio/articles');
      expect(screen.getByText('Media').closest('a')).toHaveAttribute('href', '/studio/media');
      expect(screen.getByText('Curation').closest('a')).toHaveAttribute('href', '/studio/curation');
    });
  });

  describe('Public nav items are shown on non-studio routes', () => {
    beforeEach(() => {
      mockPathname = '/library';
    });

    it('renders public navigation items when NOT on /studio', () => {
      render(<Navigation />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });

    it('does NOT render Studio nav items when NOT on /studio', () => {
      render(<Navigation />);

      expect(screen.queryByText('Dashboard')).toBeNull();
      expect(screen.queryByText('Curation')).toBeNull();
    });

    it('renders "CC" branding (not "CC Studio")', () => {
      render(<Navigation />);

      const gradientTexts = screen.getAllByTestId('gradient-text');
      const ccText = gradientTexts.find(el => el.textContent === 'CC');
      expect(ccText).toBeInTheDocument();
    });

    it('renders search icon on public routes', () => {
      const { container } = render(<Navigation />);

      const searchLink = container.querySelector('[aria-label="Search titles"]');
      expect(searchLink).toBeInTheDocument();
    });
  });
});

// ── MobileNav Tests — Studio Mode ────────────────────────────

describe('MobileNav — Studio adaptation', () => {
  describe('Studio nav items on /studio/* routes', () => {
    beforeEach(() => {
      mockPathname = '/studio';
    });

    it('renders Studio mobile nav items', () => {
      render(<MobileNav />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Titles')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('Media')).toBeInTheDocument();
      expect(screen.getByText('Curation')).toBeInTheDocument();
    });

    it('Studio nav links have correct hrefs', () => {
      render(<MobileNav />);

      const homeLink = screen.getByText('Dashboard').closest('a');
      expect(homeLink).toHaveAttribute('href', '/studio');
    });
  });

  describe('Public nav items on non-studio routes', () => {
    beforeEach(() => {
      mockPathname = '/';
    });

    it('renders public mobile nav items', () => {
      render(<MobileNav />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Discover')).toBeInTheDocument();
    });
  });
});
