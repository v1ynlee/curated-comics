import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ScheduledCountdown } from '@/components/studio/ScheduledCountdown';

// ── Mocks ─────────────────────────────────────────────────────

// No framer-motion in this component, just basic React — no mocks needed.

// ── Helpers ───────────────────────────────────────────────────

function futureDate(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
}

function pastDate(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

// ── Tests ─────────────────────────────────────────────────────

describe('ScheduledCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays hours and minutes for a date more than 1 hour away', () => {
    // 2 hours and 30 minutes from now
    const scheduled = futureDate(150);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    expect(screen.getByRole('status')).toHaveTextContent('Publishes in 2h 30m');
  });

  it('displays only minutes when less than 1 hour away but more than 5 minutes', () => {
    const scheduled = futureDate(45);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    expect(screen.getByRole('status')).toHaveTextContent('Publishes in 45m');
  });

  it('displays "Publishing soon" when less than 5 minutes away', () => {
    const scheduled = futureDate(3);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    expect(screen.getByRole('status')).toHaveTextContent('Publishing soon');
  });

  it('displays "Overdue" when the scheduled date has passed', () => {
    const scheduled = pastDate(10);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    expect(screen.getByRole('status')).toHaveTextContent('Overdue');
  });

  it('updates the countdown after 1 minute interval', () => {
    // Start at 6 minutes away (should show "Publishes in 6m")
    const scheduled = futureDate(6);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    expect(screen.getByRole('status')).toHaveTextContent('Publishes in 6m');

    // Advance time by 2 minutes — should now show "Publishing soon" (4m remaining)
    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(screen.getByRole('status')).toHaveTextContent('Publishing soon');
  });

  it('transitions from countdown to overdue after time passes', () => {
    // Start at 1 minute away
    const scheduled = futureDate(1);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    // Should show "Publishing soon" (less than 5 min)
    expect(screen.getByRole('status')).toHaveTextContent('Publishing soon');

    // Advance past the scheduled time
    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(screen.getByRole('status')).toHaveTextContent('Overdue');
  });

  it('uses semantic-warning styling for countdown state', () => {
    const scheduled = futureDate(60);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    const el = screen.getByRole('status');
    expect(el.className).toContain('text-semantic-warning');
    expect(el.className).toContain('bg-semantic-warning/10');
  });

  it('uses semantic-danger styling for overdue state', () => {
    const scheduled = pastDate(5);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    const el = screen.getByRole('status');
    expect(el.className).toContain('text-semantic-danger');
    expect(el.className).toContain('bg-semantic-danger/10');
  });

  it('has accessible aria-label matching the displayed text', () => {
    const scheduled = futureDate(120);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label', 'Publishes in 2h 0m');
  });

  it('applies custom className when provided', () => {
    const scheduled = futureDate(30);
    render(<ScheduledCountdown scheduledDate={scheduled} className="mt-2" />);

    const el = screen.getByRole('status');
    expect(el.className).toContain('mt-2');
  });

  it('applies pulse animation class for "Publishing soon" state', () => {
    const scheduled = futureDate(3);
    render(<ScheduledCountdown scheduledDate={scheduled} />);

    const el = screen.getByRole('status');
    expect(el.className).toContain('animate-pulse-glow');
  });
});
