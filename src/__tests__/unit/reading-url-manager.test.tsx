import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReadingUrlManager } from '@/components/studio/ReadingUrlManager';
import type { ReadingUrl } from '@/components/studio/ReadingUrlManager';

// ── Test Data ─────────────────────────────────────────────────

const mockUrls: ReadingUrl[] = [
  { id: 'url-1', url: 'https://tappytoon.com/series/solo-leveling', platform: 'Tappytoon', label: 'Read on Tappytoon' },
  { id: 'url-2', url: 'https://webtoons.com/solo-leveling', platform: 'Webtoon', label: 'Read on Webtoon' },
];

// ── Tests ─────────────────────────────────────────────────────

describe('ReadingUrlManager', () => {
  describe('Rendering', () => {
    it('renders the header and Add Link button', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={[]} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      expect(screen.getByText('Reading Links')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Link/i })).toBeInTheDocument();
    });

    it('shows empty state when no URLs are provided', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={[]} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      expect(screen.getByText(/No reading links added yet/i)).toBeInTheDocument();
    });

    it('renders URL entries with platform badge, label, and URL', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      // Platform badges
      expect(screen.getByText('Tappytoon')).toBeInTheDocument();
      expect(screen.getByText('Webtoon')).toBeInTheDocument();

      // Labels
      expect(screen.getByText('Read on Tappytoon')).toBeInTheDocument();
      expect(screen.getByText('Read on Webtoon')).toBeInTheDocument();

      // URLs displayed as text
      expect(screen.getByText('https://tappytoon.com/series/solo-leveling')).toBeInTheDocument();
      expect(screen.getByText('https://webtoons.com/solo-leveling')).toBeInTheDocument();
    });

    it('renders edit and delete buttons for each entry', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      const editButtons = screen.getAllByRole('button', { name: /Edit .* link/i });
      expect(editButtons).toHaveLength(2);

      const deleteButtons = screen.getAllByRole('button', { name: /Delete .* link/i });
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('Add Link', () => {
    it('shows inline form when Add Link button is clicked', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={[]} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      fireEvent.click(screen.getByRole('button', { name: /Add Link/i }));

      expect(screen.getByLabelText('Platform')).toBeInTheDocument();
      expect(screen.getByLabelText('Display Label')).toBeInTheDocument();
      expect(screen.getByLabelText('URL')).toBeInTheDocument();
    });

    it('calls onAdd with form data when Save Link is clicked', async () => {
      const onAdd = vi.fn().mockResolvedValue(undefined);
      render(
        <ReadingUrlManager titleId="title-1" urls={[]} onAdd={onAdd} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      fireEvent.click(screen.getByRole('button', { name: /Add Link/i }));

      fireEvent.change(screen.getByLabelText('Platform'), { target: { value: 'MangaDex' } });
      fireEvent.change(screen.getByLabelText('Display Label'), { target: { value: 'Read on MangaDex' } });
      fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://mangadex.org/title/123' } });

      fireEvent.click(screen.getByRole('button', { name: /Save Link/i }));

      await waitFor(() => {
        expect(onAdd).toHaveBeenCalledWith({
          platform: 'MangaDex',
          label: 'Read on MangaDex',
          url: 'https://mangadex.org/title/123',
        });
      });
    });

    it('hides the form when Cancel is clicked', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={[]} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      fireEvent.click(screen.getByRole('button', { name: /Add Link/i }));
      expect(screen.getByLabelText('Platform')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(screen.queryByLabelText('Platform')).not.toBeInTheDocument();
    });
  });

  describe('Edit', () => {
    it('shows edit form when edit button is clicked', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      const editButtons = screen.getAllByRole('button', { name: /Edit .* link/i });
      fireEvent.click(editButtons[0]);

      // Should show input fields pre-filled with current values
      expect(screen.getByDisplayValue('Tappytoon')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Read on Tappytoon')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://tappytoon.com/series/solo-leveling')).toBeInTheDocument();
    });

    it('calls onUpdate with changed fields when Save is clicked', async () => {
      const onUpdate = vi.fn().mockResolvedValue(undefined);
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={onUpdate} onDelete={vi.fn()} />
      );

      const editButtons = screen.getAllByRole('button', { name: /Edit .* link/i });
      fireEvent.click(editButtons[0]);

      const platformInput = screen.getByDisplayValue('Tappytoon');
      fireEvent.change(platformInput, { target: { value: 'MangaDex' } });

      fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith('url-1', { platform: 'MangaDex' });
      });
    });
  });

  describe('Delete with confirmation', () => {
    it('shows confirmation when delete button is clicked', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Delete .* link/i });
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Delete?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirm delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel delete/i })).toBeInTheDocument();
    });

    it('calls onDelete when confirmation is accepted', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined);
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={onDelete} />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Delete .* link/i });
      fireEvent.click(deleteButtons[1]);

      fireEvent.click(screen.getByRole('button', { name: /Confirm delete/i }));

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith('url-2');
      });
    });

    it('cancels delete when No is clicked', () => {
      const onDelete = vi.fn();
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={onDelete} />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Delete .* link/i });
      fireEvent.click(deleteButtons[0]);

      fireEvent.click(screen.getByRole('button', { name: /Cancel delete/i }));

      expect(onDelete).not.toHaveBeenCalled();
      // Confirmation should be gone
      expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has an accessible list container', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      expect(screen.getByRole('list', { name: 'Reading links list' })).toBeInTheDocument();
    });

    it('edit buttons have descriptive aria-labels', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: 'Edit Tappytoon link' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Webtoon link' })).toBeInTheDocument();
    });

    it('delete buttons have descriptive aria-labels', () => {
      render(
        <ReadingUrlManager titleId="title-1" urls={mockUrls} onAdd={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: 'Delete Tappytoon link' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete Webtoon link' })).toBeInTheDocument();
    });
  });
});
