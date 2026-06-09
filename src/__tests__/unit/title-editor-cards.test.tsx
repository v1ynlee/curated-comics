import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── Mocks ─────────────────────────────────────────────────────

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
    svg: ({ children, className, ...props }: any) => (
      <svg className={className} {...props}>{children}</svg>
    ),
    path: (props: any) => <path {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock Tiptap editor
vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    getHTML: () => '<p>test</p>',
    setEditable: vi.fn(),
    commands: { setContent: vi.fn() },
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: vi.fn() }),
        toggleItalic: () => ({ run: vi.fn() }),
        undo: () => ({ run: vi.fn() }),
        redo: () => ({ run: vi.fn() }),
        toggleBlockquote: () => ({ insertContent: () => ({ run: vi.fn() }) }),
        setImage: () => ({ run: vi.fn() }),
      }),
    }),
    isActive: () => false,
    can: () => ({ undo: () => true, redo: () => true }),
  }),
  EditorContent: ({ editor }: any) => (
    <div data-testid="tiptap-editor-content">Editor content area</div>
  ),
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: {},
}));

vi.mock('@tiptap/extension-image', () => ({
  default: { configure: () => ({}) },
}));

// Mock ImageUploader
vi.mock('@/components/studio/ImageUploader', () => ({
  ImageUploader: (props: any) => (
    <div data-testid="image-uploader" data-asset-type={props.assetType}>
      Image Uploader ({props.assetType})
    </div>
  ),
}));

// ── Imports (after mocks) ─────────────────────────────────────

import { DetailsCard } from '@/components/studio/DetailsCard';
import { CustomDropdown } from '@/components/studio/CustomDropdown';
import { MediaCard } from '@/components/studio/MediaCard';
import { ReviewsCard } from '@/components/studio/ReviewsCard';
import { ProgressCard } from '@/components/studio/ProgressCard';

// ── Test Helpers ──────────────────────────────────────────────

const defaultFormData = {
  englishTitle: 'Test Title',
  originalTitle: '',
  alternativeTitles: [],
  origin: 'manhwa',
  seriesStatus: 'ongoing',
  readingStatus: 'reading',
  author: '',
  artist: '',
  releaseDate: '',
  completedDate: '',
  chaptersRead: undefined,
  totalChapters: undefined,
  startedDate: '',
  lastReadDate: '',
  tier: 'B' as const,
  synopsis: '',
  vibeCheck: '',
  review: '',
  reviewHtml: '',
  isUnreviewed: false,
  featured: false,
  hidden: false,
  genres: [],
  moods: [],
};

// ── Req 5.1: Details card heading says "Details" not "Basic Info" ──

describe('DetailsCard (Req 5.1)', () => {
  it('renders with heading "Details"', () => {
    render(
      <DetailsCard
        slug="test-title"
        formData={defaultFormData}
        onFieldChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onToggleGenre={vi.fn()}
        onToggleMood={vi.fn()}
      />
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('does NOT render "Basic Info" heading', () => {
    render(
      <DetailsCard
        slug="test-title"
        formData={defaultFormData}
        onFieldChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onToggleGenre={vi.fn()}
        onToggleMood={vi.fn()}
      />
    );

    expect(screen.queryByText('Basic Info')).not.toBeInTheDocument();
  });

  it('renders the heading inside a <legend> element within a <fieldset>', () => {
    const { container } = render(
      <DetailsCard
        slug="test-title"
        formData={defaultFormData}
        onFieldChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onToggleGenre={vi.fn()}
        onToggleMood={vi.fn()}
      />
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeInTheDocument();

    const legend = fieldset?.querySelector('legend');
    expect(legend).toBeInTheDocument();
    expect(legend?.textContent).toContain('Details');
  });
});

// ── Req 6.2: CustomDropdown does not use native select/option ──

describe('CustomDropdown (Req 6.2)', () => {
  const options = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'hiatus', label: 'Hiatus' },
  ];

  it('does NOT render native <select> elements', () => {
    const { container } = render(
      <CustomDropdown
        id="test-status"
        label="Series Status"
        options={options}
        value="ongoing"
        onChange={vi.fn()}
      />
    );

    expect(container.querySelector('select')).toBeNull();
  });

  it('does NOT render native <option> elements', () => {
    const { container } = render(
      <CustomDropdown
        id="test-status"
        label="Series Status"
        options={options}
        value="ongoing"
        onChange={vi.fn()}
      />
    );

    expect(container.querySelector('option')).toBeNull();
  });

  it('does NOT render native <select> or <option> even when open', () => {
    const { container } = render(
      <CustomDropdown
        id="test-status"
        label="Series Status"
        options={options}
        value="ongoing"
        onChange={vi.fn()}
      />
    );

    // Open the dropdown
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(container.querySelector('select')).toBeNull();
    expect(container.querySelector('option')).toBeNull();
  });

  it('uses role="listbox" and role="option" for accessibility', () => {
    render(
      <CustomDropdown
        id="test-status"
        label="Series Status"
        options={options}
        value="ongoing"
        onChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });
});

// ── Req 7.3: Media card has no separate banner upload ──

describe('MediaCard (Req 7.3)', () => {
  it('does NOT render a separate banner upload form', () => {
    const { container } = render(
      <MediaCard
        slug="test-title"
        onCoverUpload={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    // Should not have any element labeled "Banner" for upload
    expect(screen.queryByText(/banner upload/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/upload banner/i)).not.toBeInTheDocument();

    // Should not have a second ImageUploader for banner
    const uploaders = container.querySelectorAll('[data-testid="image-uploader"]');
    expect(uploaders.length).toBe(1);

    // The single uploader should be for "cover" type
    expect(uploaders[0]).toHaveAttribute('data-asset-type', 'cover');
  });

  it('renders a banner preview section (derived from cover, not a separate upload)', () => {
    render(
      <MediaCard
        slug="test-title"
        onCoverUpload={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    // Should show "Banner Preview" label (it's a preview, not an upload)
    expect(screen.getByText('Banner Preview')).toBeInTheDocument();
  });

  it('does NOT have a banner-specific file input or upload button', () => {
    const { container } = render(
      <MediaCard
        slug="test-title"
        onCoverUpload={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    // No file input for banner
    const fileInputs = container.querySelectorAll('input[type="file"]');
    // If there are file inputs, none should be for banner
    fileInputs.forEach((input) => {
      expect(input.getAttribute('accept')).not.toContain('banner');
      expect(input.getAttribute('name')).not.toContain('banner');
    });
  });
});

// ── Req 10.4, 10.5: Reviews card has Editor/Preview tabs, no Quotable Lines ──

describe('ReviewsCard (Req 10.4, 10.5)', () => {
  const defaultReviewsProps = {
    review: '',
    reviewHtml: '',
    isUnreviewed: false,
    onReviewChange: vi.fn(),
    onReviewHtmlChange: vi.fn(),
    onUnreviewedChange: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  it('renders "Editor" tab button', () => {
    render(<ReviewsCard {...defaultReviewsProps} />);

    expect(screen.getByRole('tab', { name: 'Editor' })).toBeInTheDocument();
  });

  it('renders "Preview" tab button', () => {
    render(<ReviewsCard {...defaultReviewsProps} />);

    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument();
  });

  it('does NOT display "Quotable Lines" text anywhere', () => {
    render(<ReviewsCard {...defaultReviewsProps} />);

    expect(screen.queryByText(/quotable lines/i)).not.toBeInTheDocument();
  });

  it('switches between Editor and Preview tabs', () => {
    render(<ReviewsCard {...defaultReviewsProps} />);

    // Editor tab should be selected by default
    const editorTab = screen.getByRole('tab', { name: 'Editor' });
    expect(editorTab).toHaveAttribute('aria-selected', 'true');

    // Click Preview tab
    const previewTab = screen.getByRole('tab', { name: 'Preview' });
    fireEvent.click(previewTab);

    expect(previewTab).toHaveAttribute('aria-selected', 'true');
    expect(editorTab).toHaveAttribute('aria-selected', 'false');
  });

  it('has a tablist with proper aria-label', () => {
    render(<ReviewsCard {...defaultReviewsProps} />);

    expect(screen.getByRole('tablist', { name: 'Review editor tabs' })).toBeInTheDocument();
  });
});

// ── Req 10.7: "Mark as unreviewed" checkbox triggers disabled state ──

describe('ReviewsCard - Mark as unreviewed (Req 10.7)', () => {
  it('renders "Mark as unreviewed" checkbox', () => {
    render(
      <ReviewsCard
        review=""
        reviewHtml=""
        isUnreviewed={false}
        onReviewChange={vi.fn()}
        onReviewHtmlChange={vi.fn()}
        onUnreviewedChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByLabelText('Mark as unreviewed')).toBeInTheDocument();
  });

  it('when checked, the card enters a disabled state', () => {
    const { container } = render(
      <ReviewsCard
        review=""
        reviewHtml=""
        isUnreviewed={true}
        onReviewChange={vi.fn()}
        onReviewHtmlChange={vi.fn()}
        onUnreviewedChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    // The CardWrapper renders a <fieldset> that becomes disabled
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeInTheDocument();
    expect(fieldset).toBeDisabled();
  });

  it('when checked, shows a yellow warning message', () => {
    render(
      <ReviewsCard
        review=""
        reviewHtml=""
        isUnreviewed={true}
        onReviewChange={vi.fn()}
        onReviewHtmlChange={vi.fn()}
        onUnreviewedChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByText(/marked as unreviewed/i)).toBeInTheDocument();
  });

  it('when unchecked, the card is NOT disabled', () => {
    const { container } = render(
      <ReviewsCard
        review=""
        reviewHtml=""
        isUnreviewed={false}
        onReviewChange={vi.fn()}
        onReviewHtmlChange={vi.fn()}
        onUnreviewedChange={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeInTheDocument();
    expect(fieldset).not.toBeDisabled();
  });
});

// ── Req 9.1: Custom datepicker renders instead of native date input ──

describe('ProgressCard (Req 9.1)', () => {
  const defaultProgressProps = {
    chaptersRead: undefined,
    totalChapters: undefined,
    startedDate: '',
    completedDate: '',
    lastReadDate: '',
    onChaptersReadChange: vi.fn(),
    onTotalChaptersChange: vi.fn(),
    onStartedDateChange: vi.fn(),
    onCompletedDateChange: vi.fn(),
    onLastReadDateChange: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  it('does NOT render any native input[type="date"] elements', () => {
    const { container } = render(<ProgressCard {...defaultProgressProps} />);

    const nativeDateInputs = container.querySelectorAll('input[type="date"]');
    expect(nativeDateInputs.length).toBe(0);
  });

  it('renders custom datepicker buttons for date fields', () => {
    render(<ProgressCard {...defaultProgressProps} />);

    // CustomDatepicker renders buttons with aria-haspopup="dialog"
    const datepickerButtons = screen.getAllByRole('button', { name: /date/i });
    expect(datepickerButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders Started Date, Completed Date, and Last Read Date labels', () => {
    render(<ProgressCard {...defaultProgressProps} />);

    expect(screen.getByText('Started Date')).toBeInTheDocument();
    expect(screen.getByText('Completed Date')).toBeInTheDocument();
    expect(screen.getByText('Last Read Date')).toBeInTheDocument();
  });

  it('each date field uses CustomDatepicker with aria-haspopup="dialog"', () => {
    const { container } = render(<ProgressCard {...defaultProgressProps} />);

    const datepickerTriggers = container.querySelectorAll('[aria-haspopup="dialog"]');
    // Should have at least 3 datepicker triggers (started, completed, last read)
    expect(datepickerTriggers.length).toBeGreaterThanOrEqual(3);
  });
});
