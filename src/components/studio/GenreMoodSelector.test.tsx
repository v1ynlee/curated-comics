import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GenreMoodSelector } from './GenreMoodSelector';

// ── Test data ─────────────────────────────────────────────────

const availableGenres = [
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'drama', name: 'Drama' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'horror', name: 'Horror' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'romance', name: 'Romance' },
  { id: 'sci-fi', name: 'Sci-Fi' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'slice-of-life', name: 'Slice of Life' },
  { id: 'sports', name: 'Sports' },
];

const recentlyUsedIds = ['action', 'fantasy', 'romance', 'drama', 'comedy'];

describe('GenreMoodSelector', () => {
  it('renders the search input with correct label', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
      />
    );

    expect(screen.getByLabelText(/search genres/i)).toBeInTheDocument();
    expect(screen.getByText('Genres')).toBeInTheDocument();
  });

  it('renders as "Moods" when type is mood', () => {
    render(
      <GenreMoodSelector
        type="mood"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
      />
    );

    expect(screen.getByLabelText(/search moods/i)).toBeInTheDocument();
    expect(screen.getByText('Moods')).toBeInTheDocument();
  });

  it('displays max 10 popular badges when search is empty', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
      />
    );

    const popularSection = screen.getByLabelText(/popular genres/i);
    const badges = popularSection.querySelectorAll('button');
    expect(badges.length).toBeLessThanOrEqual(10);
  });

  it('shows 5 most recently used genres when search is empty and no selection', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        recentlyUsed={recentlyUsedIds}
        onToggle={() => {}}
      />
    );

    const recentSection = screen.getByLabelText(/recently used genres/i);
    const badges = recentSection.querySelectorAll('button');
    expect(badges).toHaveLength(5);
    expect(within(recentSection).getByText('Action')).toBeInTheDocument();
    expect(within(recentSection).getByText('Fantasy')).toBeInTheDocument();
  });

  it('does NOT show recently used when items are selected', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={['action']}
        recentlyUsed={recentlyUsedIds}
        onToggle={() => {}}
      />
    );

    expect(screen.queryByLabelText(/recently used genres/i)).not.toBeInTheDocument();
  });

  it('renders selected items as badges with ✕ remove icon', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={['action', 'drama']}
        onToggle={() => {}}
      />
    );

    const selectedSection = screen.getByLabelText(/selected genres/i);
    expect(selectedSection).toBeInTheDocument();

    // Check remove buttons exist
    expect(screen.getByLabelText('Remove Action')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Drama')).toBeInTheDocument();
  });

  it('calls onToggle when a selected badge ✕ is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={['action']}
        onToggle={handleToggle}
      />
    );

    fireEvent.click(screen.getByLabelText('Remove Action'));
    expect(handleToggle).toHaveBeenCalledWith('action');
  });

  it('calls onToggle when a popular badge is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={handleToggle}
      />
    );

    fireEvent.click(screen.getByLabelText('Select Action'));
    expect(handleToggle).toHaveBeenCalledWith('action');
  });

  it('filters items by case-insensitive substring match', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
      />
    );

    const input = screen.getByLabelText(/search genres/i);
    fireEvent.change(input, { target: { value: 'act' } });

    const resultsSection = screen.getByLabelText(/genre search results/i);
    expect(resultsSection).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('filters case-insensitively', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
      />
    );

    const input = screen.getByLabelText(/search genres/i);
    fireEvent.change(input, { target: { value: 'FANTASY' } });

    expect(screen.getByText('Fantasy')).toBeInTheDocument();
  });

  it('shows add-new tooltip when search term not found', () => {
    const handleAddNew = vi.fn();
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
        onAddNew={handleAddNew}
      />
    );

    const input = screen.getByLabelText(/search genres/i);
    fireEvent.change(input, { target: { value: 'Isekai' } });

    expect(screen.getByText(/not found/i)).toBeInTheDocument();
    expect(screen.getByText(/add as new genre/i)).toBeInTheDocument();
  });

  it('calls onAddNew when add button is clicked', () => {
    const handleAddNew = vi.fn();
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
        onAddNew={handleAddNew}
      />
    );

    const input = screen.getByLabelText(/search genres/i);
    fireEvent.change(input, { target: { value: 'Isekai' } });
    fireEvent.click(screen.getByText(/add as new genre/i));

    expect(handleAddNew).toHaveBeenCalledWith('Isekai');
  });

  it('does NOT show add tooltip when onAddNew is not provided', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
      />
    );

    const input = screen.getByLabelText(/search genres/i);
    fireEvent.change(input, { target: { value: 'Isekai' } });

    expect(screen.queryByText(/add as new genre/i)).not.toBeInTheDocument();
  });

  it('hides popular badges when searching', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={[]}
        onToggle={() => {}}
      />
    );

    // Popular should be visible initially
    expect(screen.getByLabelText(/popular genres/i)).toBeInTheDocument();

    const input = screen.getByLabelText(/search genres/i);
    fireEvent.change(input, { target: { value: 'act' } });

    // Popular should be hidden while searching
    expect(screen.queryByLabelText(/popular genres/i)).not.toBeInTheDocument();
  });

  it('excludes already-selected items from popular badges', () => {
    render(
      <GenreMoodSelector
        type="genre"
        available={availableGenres}
        selected={['action']}
        onToggle={() => {}}
      />
    );

    const popularSection = screen.getByLabelText(/popular genres/i);
    const badges = popularSection.querySelectorAll('button');
    const badgeTexts = Array.from(badges).map((b) => b.textContent);
    expect(badgeTexts).not.toContain('Action');
  });

  it('applies identical behavior for moods as for genres', () => {
    const handleToggle = vi.fn();
    render(
      <GenreMoodSelector
        type="mood"
        available={[
          { id: 'dark', name: 'Dark' },
          { id: 'uplifting', name: 'Uplifting' },
        ]}
        selected={['dark']}
        onToggle={handleToggle}
      />
    );

    // Selected badge with remove
    expect(screen.getByLabelText('Remove Dark')).toBeInTheDocument();

    // Click to remove
    fireEvent.click(screen.getByLabelText('Remove Dark'));
    expect(handleToggle).toHaveBeenCalledWith('dark');
  });
});
