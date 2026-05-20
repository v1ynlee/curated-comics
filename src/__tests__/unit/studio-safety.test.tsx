import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// ── Mocks ─────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, onKeyDown, role, tabIndex, ...props }: any) => (
      <div className={className} onClick={onClick} onKeyDown={onKeyDown} role={role} tabIndex={tabIndex} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  CheckCircle2: () => <span data-testid="check-icon">✓</span>,
  AlertCircle: () => <span data-testid="alert-icon">!</span>,
  Info: () => <span data-testid="info-icon">i</span>,
}));

// ── Imports (after mocks) ─────────────────────────────────────

import { ConfirmAction } from '@/components/studio/ConfirmAction';
import { ToastProvider, useToast } from '@/components/ui/Toast';

// ── ConfirmAction Tests ───────────────────────────────────────

describe('ConfirmAction', () => {
  it('renders the trigger initially', () => {
    render(
      <ConfirmAction
        trigger={<span>Delete</span>}
        message="Are you sure?"
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Are you sure?')).toBeNull();
  });

  it('shows confirmation UI when trigger is clicked', () => {
    render(
      <ConfirmAction
        trigger={<span>Delete</span>}
        message="Are you sure?"
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmAction
        trigger={<span>Delete</span>}
        message="Are you sure?"
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm Delete'));
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('returns to trigger state when Cancel is clicked', () => {
    render(
      <ConfirmAction
        trigger={<span>Delete</span>}
        message="Are you sure?"
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        onConfirm={vi.fn()}
      />
    );

    // Enter confirmation state
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Are you sure?')).toBeNull();
  });

  it('cancels on Escape key', () => {
    render(
      <ConfirmAction
        trigger={<span>Delete</span>}
        message="Are you sure?"
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <ConfirmAction
        trigger={<span>Delete</span>}
        message="Are you sure?"
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        onConfirm={vi.fn()}
        loading={true}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Wait…')).toBeInTheDocument();
  });
});

// ── Toast Tests ───────────────────────────────────────────────

describe('Toast system', () => {
  function TestToastTrigger() {
    const { addToast } = useToast();
    return (
      <button
        onClick={() =>
          addToast({ type: 'success', message: 'Item deleted successfully' })
        }
      >
        Trigger Toast
      </button>
    );
  }

  it('renders toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByText('Item deleted successfully')).toBeInTheDocument();
  });

  it('renders toast with action button', () => {
    function TestWithAction() {
      const { addToast } = useToast();
      return (
        <button
          onClick={() =>
            addToast({
              type: 'success',
              message: 'Deleted',
              action: { label: 'Undo', onClick: vi.fn() },
            })
          }
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <TestWithAction />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger'));
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('dismisses toast when X button is clicked', () => {
    render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByText('Item deleted successfully')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(screen.queryByText('Item deleted successfully')).toBeNull();
  });

  it('limits to 3 toasts maximum', () => {
    function TestMultiple() {
      const { addToast } = useToast();
      return (
        <button
          onClick={() => {
            addToast({ type: 'success', message: 'Toast 1', duration: 0 });
            addToast({ type: 'success', message: 'Toast 2', duration: 0 });
            addToast({ type: 'success', message: 'Toast 3', duration: 0 });
            addToast({ type: 'success', message: 'Toast 4', duration: 0 });
          }}
        >
          Add 4
        </button>
      );
    }

    render(
      <ToastProvider>
        <TestMultiple />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add 4'));

    // Only the last 3 should be visible
    expect(screen.queryByText('Toast 1')).toBeNull();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
    expect(screen.getByText('Toast 4')).toBeInTheDocument();
  });

  it('has aria-live region for accessibility', () => {
    render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Trigger Toast'));

    const liveRegion = screen.getByText('Item deleted successfully').closest('[aria-live]');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
