import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardWrapper } from './CardWrapper';

describe('CardWrapper', () => {
  it('renders title and children', () => {
    render(
      <CardWrapper title="Details" onSave={async () => {}}>
        <input data-testid="child-input" />
      </CardWrapper>
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByTestId('child-input')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <CardWrapper
        title="Details"
        icon={<span data-testid="test-icon">📝</span>}
        onSave={async () => {}}
      >
        <p>Content</p>
      </CardWrapper>
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders save button with icon', () => {
    render(
      <CardWrapper title="Details" onSave={async () => {}}>
        <p>Content</p>
      </CardWrapper>
    );

    const saveButton = screen.getByRole('button', { name: /save details/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveTextContent('Save');
  });

  it('transitions to saved/disabled state after save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CardWrapper title="Progress" onSave={onSave}>
        <input data-testid="child-input" />
      </CardWrapper>
    );

    const saveButton = screen.getByRole('button', { name: /save progress/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    // After save, the fieldset should be disabled
    await waitFor(() => {
      const fieldset = screen.getByRole('group');
      expect(fieldset).toBeDisabled();
    });
  });

  it('shows Cancel button in saved state', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CardWrapper title="Settings" onSave={onSave}>
        <input data-testid="child-input" />
      </CardWrapper>
    );

    // Initially no cancel button
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();

    // Save
    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it('restores editable state on cancel click', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CardWrapper title="Details" onSave={onSave}>
        <input data-testid="child-input" />
      </CardWrapper>
    );

    // Save the card
    fireEvent.click(screen.getByRole('button', { name: /save details/i }));

    await waitFor(() => {
      expect(screen.getByRole('group')).toBeDisabled();
    });

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Card should be editable again
    await waitFor(() => {
      expect(screen.getByRole('group')).not.toBeDisabled();
    });

    // Cancel button should be gone
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('returns to editing state on save error', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <CardWrapper title="Details" onSave={onSave}>
        <input data-testid="child-input" />
      </CardWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /save details/i }));

    await waitFor(() => {
      expect(screen.getByRole('group')).not.toBeDisabled();
    });
  });

  it('disables save button when externally disabled', () => {
    render(
      <CardWrapper title="Details" onSave={async () => {}} disabled>
        <input data-testid="child-input" />
      </CardWrapper>
    );

    const saveButton = screen.getByRole('button', { name: /save details/i });
    expect(saveButton).toBeDisabled();
  });

  it('shows loading state during save', async () => {
    // Create a save that we can control
    let resolveSave: () => void;
    const onSave = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => { resolveSave = resolve; })
    );

    render(
      <CardWrapper title="Details" onSave={onSave}>
        <p>Content</p>
      </CardWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /save details/i }));

    // Should show saving state
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    // Resolve the save
    resolveSave!();

    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });
});
