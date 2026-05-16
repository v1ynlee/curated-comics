import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── Mocks ─────────────────────────────────────────────────────

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/studio',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock supabase browser client
vi.mock('@/lib/db/supabase-browser', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock StudioPageTransition
vi.mock('@/components/studio/StudioPageTransition', () => ({
  StudioPageTransition: ({ children }: any) => <div>{children}</div>,
}));

// Mock @radix-ui/react-dropdown-menu with a context-based approach
vi.mock('@radix-ui/react-dropdown-menu', () => {
  const React = require('react');

  const DropdownContext = React.createContext({ open: false, setOpen: (_: boolean) => {} });

  function Root({ children }: any) {
    const [open, setOpen] = React.useState(false);
    return (
      <DropdownContext.Provider value={{ open, setOpen }}>
        <div data-testid="dropdown-root" data-state={open ? 'open' : 'closed'}>
          {children}
        </div>
      </DropdownContext.Provider>
    );
  }

  function Trigger({ children, asChild, ...props }: any) {
    const { open, setOpen } = React.useContext(DropdownContext);
    if (asChild) {
      const child = React.Children.only(children);
      return React.cloneElement(child, {
        ...props,
        onClick: (e: any) => {
          setOpen(!open);
          child.props.onClick?.(e);
        },
        'aria-expanded': open ? 'true' : 'false',
      });
    }
    return (
      <button {...props} onClick={() => setOpen(!open)}>
        {children}
      </button>
    );
  }

  function Portal({ children }: any) {
    return <>{children}</>;
  }

  function Content({ children, ...props }: any) {
    const { open } = React.useContext(DropdownContext);
    if (!open) return null;
    return (
      <div role="menu" {...props}>
        {children}
      </div>
    );
  }

  function Label({ children, className }: any) {
    return <div className={className} role="note">{children}</div>;
  }

  function Item({ children, asChild, ...props }: any) {
    if (asChild) {
      return <>{children}</>;
    }
    return <div role="menuitem" {...props}>{children}</div>;
  }

  return {
    Root,
    Trigger,
    Portal,
    Content,
    Label,
    Item,
  };
});

// ── Imports (after mocks) ─────────────────────────────────────

import { StudioHeader } from '@/components/studio/StudioHeader';
import { StudioShell } from '@/components/studio/StudioShell';

// ── StudioHeader Tests ────────────────────────────────────────

describe('StudioHeader', () => {
  describe('Req 1.1 - No search icon in header', () => {
    it('does not render a search icon or search button', () => {
      const { container } = render(<StudioHeader user={null} />);

      // No element with aria-label containing "search"
      const searchByLabel = container.querySelector('[aria-label*="earch"]');
      expect(searchByLabel).toBeNull();

      // No Search icon from lucide-react (would have class lucide-search)
      const searchIcon = container.querySelector('.lucide-search');
      expect(searchIcon).toBeNull();

      // No text content "Search"
      expect(screen.queryByText(/search/i)).toBeNull();
    });

    it('renders a user profile icon button instead of search', () => {
      render(<StudioHeader user={null} />);

      const userButton = screen.getByLabelText('User menu');
      expect(userButton).toBeInTheDocument();
    });
  });

  describe('Req 2.2, 2.3 - UserProfileDropdown unauthenticated state', () => {
    it('shows only "Sign In" when user is not authenticated', () => {
      render(<StudioHeader user={null} />);

      // Open the dropdown
      const trigger = screen.getByLabelText('User menu');
      fireEvent.click(trigger);

      // Should show Sign In
      expect(screen.getByText('Sign In')).toBeInTheDocument();

      // Should NOT show navigation items
      expect(screen.queryByText('Dashboard')).toBeNull();
      expect(screen.queryByText('Titles')).toBeNull();
      expect(screen.queryByText('Articles')).toBeNull();
      expect(screen.queryByText('Media')).toBeNull();
      expect(screen.queryByText('Curation')).toBeNull();
    });

    it('Sign In links to /studio/login', () => {
      render(<StudioHeader user={null} />);

      const trigger = screen.getByLabelText('User menu');
      fireEvent.click(trigger);

      const signInLink = screen.getByText('Sign In').closest('a');
      expect(signInLink).toHaveAttribute('href', '/studio/login');
    });
  });

  describe('Req 2.2, 2.5 - UserProfileDropdown authenticated state', () => {
    const mockUser = { email: 'admin@example.com' };

    it('shows "Signed in as {email}" when authenticated', () => {
      render(<StudioHeader user={mockUser} />);

      const trigger = screen.getByLabelText('User menu');
      fireEvent.click(trigger);

      expect(
        screen.getByText(`Signed in as ${mockUser.email}`)
      ).toBeInTheDocument();
    });

    it('shows Dashboard, Titles, Articles, Media, Curation links when authenticated', () => {
      render(<StudioHeader user={mockUser} />);

      const trigger = screen.getByLabelText('User menu');
      fireEvent.click(trigger);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Titles')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('Media')).toBeInTheDocument();
      expect(screen.getByText('Curation')).toBeInTheDocument();
    });

    it('navigation links have correct hrefs', () => {
      render(<StudioHeader user={mockUser} />);

      const trigger = screen.getByLabelText('User menu');
      fireEvent.click(trigger);

      expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/studio');
      expect(screen.getByText('Titles').closest('a')).toHaveAttribute('href', '/studio/titles');
      expect(screen.getByText('Articles').closest('a')).toHaveAttribute('href', '/studio/articles');
      expect(screen.getByText('Media').closest('a')).toHaveAttribute('href', '/studio/media');
      expect(screen.getByText('Curation').closest('a')).toHaveAttribute('href', '/studio/curation');
    });

    it('does not show "Sign In" when authenticated', () => {
      render(<StudioHeader user={mockUser} />);

      const trigger = screen.getByLabelText('User menu');
      fireEvent.click(trigger);

      // Verify menu is open by checking for Dashboard
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      // Sign In should not be present
      expect(screen.queryByText('Sign In')).toBeNull();
    });
  });
});

// ── StudioShell Layout Tests ──────────────────────────────────

describe('StudioShell', () => {
  describe('Req 3.1, 3.2 - No sidebar in studio layout', () => {
    it('does not render StudioNav sidebar', () => {
      const { container } = render(
        <StudioShell>
          <div>Page content</div>
        </StudioShell>
      );

      // StudioNav renders a <nav> element — verify none exists
      const navElements = container.querySelectorAll('nav');
      expect(navElements.length).toBe(0);
    });

    it('does not display "Creative Workspace" branding text', () => {
      render(
        <StudioShell>
          <div>Page content</div>
        </StudioShell>
      );

      expect(screen.queryByText(/Creative Workspace/i)).toBeNull();
    });

    it('renders the StudioHeader at the top', () => {
      render(
        <StudioShell>
          <div>Page content</div>
        </StudioShell>
      );

      // Header should be present with the user menu button
      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    });

    it('renders main content area with full width', () => {
      const { container } = render(
        <StudioShell>
          <div>Page content</div>
        </StudioShell>
      );

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main?.className).toContain('w-full');
    });

    it('renders children inside the main content area', () => {
      render(
        <StudioShell>
          <div data-testid="child-content">Hello Studio</div>
        </StudioShell>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Hello Studio')).toBeInTheDocument();
    });

    it('uses a vertical flex layout (no sidebar flex row)', () => {
      const { container } = render(
        <StudioShell>
          <div>Page content</div>
        </StudioShell>
      );

      // The root wrapper should be flex-col (vertical), not flex-row (sidebar layout)
      const wrapper = container.firstElementChild;
      expect(wrapper?.className).toContain('flex-col');
      expect(wrapper?.className).not.toContain('flex-row');
    });
  });
});
