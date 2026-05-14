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

  describe('Upload flow', () => {
    it('calls /api/media/upload and invokes onUploadComplete on success', async () => {
      const onUploadComplete = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, asset: mockMediaAsset }),
      });

      render(
        <ImageUploader
          slug="solo-leveling"
          assetType="cover"
          onUploadComplete={onUploadComplete}
        />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('cover.jpg', 500 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/media/upload', {
          method: 'POST',
          body: expect.any(FormData),
        });
      });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalledWith(mockMediaAsset);
      });
    });

    it('shows error with guidance on 413 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: async () => ({ error: 'File size exceeds maximum 10MB' }),
      });

      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      // File passes client validation (just under 10MB) but server rejects
      const file = createMockFile('cover.jpg', 9.9 * 1024 * 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Try a smaller file/)).toBeInTheDocument();
      });
    });

    it('shows error with guidance on 503 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'Storage service unavailable' }),
      });

      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('cover.jpg', 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Check your connection/)).toBeInTheDocument();
      });
    });

    it('shows error on network failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('cover.jpg', 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
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

    it('handles file drop', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, asset: mockMediaAsset }),
      });

      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const dropZone = screen.getByRole('button', {
        name: /Drop or click to upload/,
      });

      const file = createMockFile('cover.jpg', 1024, 'image/jpeg');

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/media/upload', {
          method: 'POST',
          body: expect.any(FormData),
        });
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

    it('shows processing status with role="status"', async () => {
      // Make fetch hang to keep uploading state visible
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <ImageUploader slug="solo-leveling" assetType="cover" />
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('cover.jpg', 1024, 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
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
