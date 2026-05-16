import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedCheckbox } from '@/components/studio/AnimatedCheckbox';

// ── Mock framer-motion ────────────────────────────────────────

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
}));

// ── Tests ─────────────────────────────────────────────────────

describe('AnimatedCheckbox', () => {
  it('renders with label text', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured on homepage"
        checked={false}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Featured on homepage')).toBeInTheDocument();
  });

  it('renders a checkbox input with correct checked state', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={true}
        onChange={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders unchecked state correctly', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={false}
        onChange={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange with new value when clicked', () => {
    const handleChange = vi.fn();
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={false}
        onChange={handleChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={false}
        onChange={handleChange}
        disabled={true}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies disabled styling when disabled', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={false}
        onChange={() => {}}
        disabled={true}
      />
    );

    const label = screen.getByText('Featured').closest('label');
    expect(label?.className).toContain('opacity-50');
    expect(label?.className).toContain('cursor-not-allowed');
  });

  it('has correct id linking label to input', () => {
    render(
      <AnimatedCheckbox
        id="my-checkbox"
        label="Hidden"
        checked={false}
        onChange={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'my-checkbox');

    const label = screen.getByText('Hidden').closest('label');
    expect(label).toHaveAttribute('for', 'my-checkbox');
  });

  it('uses default variant styling by default', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={false}
        onChange={() => {}}
      />
    );

    const labelText = screen.getByText('Featured');
    expect(labelText.className).toContain('group-hover:text-accent-primary');
  });

  it('uses warning variant styling when variant is warning', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Hidden from public"
        checked={false}
        onChange={() => {}}
        variant="warning"
      />
    );

    const labelText = screen.getByText('Hidden from public');
    expect(labelText.className).toContain('group-hover:text-yellow-400');
  });

  it('has aria-checked attribute for accessibility', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={true}
        onChange={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('does not use native visible checkbox (uses sr-only)', () => {
    render(
      <AnimatedCheckbox
        id="test-cb"
        label="Featured"
        checked={false}
        onChange={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('sr-only');
  });
});
