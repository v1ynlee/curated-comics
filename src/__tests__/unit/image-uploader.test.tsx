import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from '@/components/studio/ImageUploader';
import type { MediaAsset } from '@/types/media';

// ── Mocks ─────────────────────────────────────────────────────

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

// ── Test Data ─────────────────────────────────────────────────

const mockMediaAsset: MediaAsset = {
  id: 'test-id-123',
  slug: 'solo-leveling',
  assetType: 'cover',
  contentHash: 'abc123def456',
  originalWidth: 800,
  originalHeight: 1200,
  aspectRatio: 0.6667,
  mimeType: 'image/jpeg',
  dominantColor: '#1a2b3c',
  blurDataUri: 'data:image/jpeg;base64,/9j/4AAQ...',
  variants: [
    { width: 320, format: 'webp', url: 'https://cdn.example.com/320w.webp', size: 24576 },
    { width: 640, format: 'webp', url: 'https://cdn.example.com/640w.webp', size: 49152 },
    { width: 1200, format: 'webp', url: 'https://cdn.example.com/1200w.webp', size: 98304 },
    { width: 320, format: 'avif', url: 'https://cdn.example.com/320w.avif', size: 20480 },
  ],
  r2BasePath: 'covers/solo-leveling/abc123def456',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

// ── Tests ─────────────────────────────────────────────────────

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the drop zone in idle state', () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      expect(
        screen.getByText('Drag & drop or click to browse')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/JPEG, PNG, WebP, AVIF, or GIF/)
      ).toBeInTheDocument();
    });

    it('renders preview when currentImage is provided', () => {
      render(
        <ImageUploader
          slug="solo-leveling"
          assetType="cover"
          currentImage={mockMediaAsset}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      // Should use the largest webp variant
      expect(image).toHaveAttribute('src', 'https://cdn.example.com/1200w.webp');
    });

    it('shows dimension badge when asset is loaded', () => {
      render(
        <ImageUploader
          slug="solo-leveling"
          assetType="cover"
          currentImage={mockMediaAsset}
        />
      );

      expect(screen.getByText('800×1200')).toBeInTheDocument();
    });
  });

  describe('Client-side validation', () => {
    it('shows error for invalid MIME type', async () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = createMockFile('test.pdf', 1024, 'application/pdf');

      fireEvent.change(input, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
      });
    });

    it('shows error for oversized file', async () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const bigFile = createMockFile('huge.jpg', 11 * 1024 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [bigFile] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/File too large/)).toBeInTheDocument();
        expect(screen.getByText(/Try a smaller file/)).toBeInTheDocument();
      });
    });
  });

  describe('Deferred upload flow', () => {
    it('does NOT call /api/media/upload on file selection', async () => {
      const onFileSelect = vi.fn();

      render(
        <ImageUploader
          slug="solo-leveling"
          assetType="cover"
          onFileSelect={onFileSelect}
        />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('cover.jpg', 500 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [validFile] } });

      await waitFor(() => {
        // Should NOT have called fetch — upload is deferred
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('calls onFileSelect with the selected file', async () => {
      const onFileSelect = vi.fn();

      render(
        <ImageUploader
          slug="solo-leveling"
          assetType="cover"
          onFileSelect={onFileSelect}
        />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('cover.jpg', 500 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(validFile);
      });
    });

    it('shows pending preview with blob URL after file selection', async () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('cover.jpg', 500 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalledWith(validFile);
        const image = screen.getByTestId('next-image');
        expect(image).toHaveAttribute('src', 'blob:http://localhost/fake-url');
      });
    });

    it('shows "Pending upload" badge after file selection', async () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('cover.jpg', 500 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.getByText('Pending upload')).toBeInTheDocument();
      });
    });

    it('revokes previous blob URL when a new file is selected', async () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file1 = createMockFile('cover1.jpg', 500 * 1024, 'image/jpeg');
      const file2 = createMockFile('cover2.jpg', 500 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [file1] } });

      await waitFor(() => {
        expect(screen.getByText('Pending upload')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { files: [file2] } });

      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-url');
      });
    });
  });

  describe('Drag and drop', () => {
    it('shows visual feedback on drag over', () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const dropZone = screen.getByRole('button', {
        name: /Drop or click to upload/,
      });

      fireEvent.dragEnter(dropZone, {
        dataTransfer: { files: [] },
      });

      // Text changes to "Drop to upload"
      expect(screen.getByText('Drop to upload')).toBeInTheDocument();
    });

    it('handles file drop without uploading', async () => {
      const onFileSelect = vi.fn();

      render(
        <ImageUploader
          slug="solo-leveling"
          assetType="cover"
          onFileSelect={onFileSelect}
        />
      );

      const dropZone = screen.getByRole('button', {
        name: /Drop or click to upload/,
      });

      const file = createMockFile('cover.jpg', 1024, 'image/jpeg');

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        // Should call onFileSelect, NOT fetch
        expect(onFileSelect).toHaveBeenCalledWith(file);
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible file input label', () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = screen.getByLabelText(/Upload cover image for solo-leveling/);
      expect(input).toBeInTheDocument();
    });

    it('shows pending preview state after valid file selection', async () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('cover.jpg', 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        // Pending state shows the preview with "Pending upload" badge
        expect(screen.getByText('Pending upload')).toBeInTheDocument();
        const image = screen.getByTestId('next-image');
        expect(image).toHaveAttribute(
          'alt',
          'cover preview for solo-leveling (pending upload)'
        );
      });
    });

    it('shows error with role="alert"', async () => {
      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = createMockFile('test.txt', 1024, 'text/plain');

      fireEvent.change(input, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});
