import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomDatepicker } from '@/components/studio/CustomDatepicker';

// ── Helpers ───────────────────────────────────────────────────

function renderDatepicker(props: Partial<React.ComponentProps<typeof CustomDatepicker>> = {}) {
  const defaultProps = {
    id: 'test-date',
    label: 'Start Date',
    value: '',
    onChange: vi.fn(),
    ...props,
  };
  return { ...render(<CustomDatepicker {...defaultProps} />), onChange: defaultProps.onChange };
}

// ── Tests ─────────────────────────────────────────────────────

describe('CustomDatepicker', () => {
  it('renders with label and placeholder', () => {
    renderDatepicker({ placeholder: 'Pick a date' });

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('does not use native input type="date"', () => {
    const { container } = renderDatepicker();
    const nativeDateInputs = container.querySelectorAll('input[type="date"]');
    expect(nativeDateInputs.length).toBe(0);
  });

  it('displays formatted date when value is provided', () => {
    renderDatepicker({ value: '2024-03-15' });

    expect(screen.getByText('March 15, 2024')).toBeInTheDocument();
  });

  it('opens calendar popup on click', () => {
    renderDatepicker();

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    renderDatepicker({ disabled: true });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to previous month', () => {
    renderDatepicker({ value: '2024-06-15' });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByText('June 2024')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: 'Previous month' });
    fireEvent.click(prevBtn);

    expect(screen.getByText('May 2024')).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    renderDatepicker({ value: '2024-06-15' });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    const nextBtn = screen.getByRole('button', { name: 'Next month' });
    fireEvent.click(nextBtn);

    expect(screen.getByText('July 2024')).toBeInTheDocument();
  });

  it('selects a date and calls onChange with ISO string', () => {
    const { onChange } = renderDatepicker({ value: '2024-06-15' });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    // Click day 20 using its accessible name
    const day20Btn = screen.getByRole('gridcell', { name: '20' });
    fireEvent.click(day20Btn);

    expect(onChange).toHaveBeenCalledWith('2024-06-20');
  });

  it('closes calendar on Escape key', () => {
    renderDatepicker();

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes calendar on click outside', () => {
    renderDatepicker();

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click outside the container
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation with arrow keys', () => {
    const { onChange } = renderDatepicker({ value: '2024-06-15' });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    const grid = screen.getByRole('grid');

    // Arrow right moves focus to next day
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    // Arrow right again
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    // Now focused on day 17, press Enter to select
    fireEvent.keyDown(grid, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('2024-06-17');
  });

  it('highlights today in the calendar', () => {
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    renderDatepicker({ value: todayISO });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    const todayCell = screen.getByRole('gridcell', { current: 'date' });
    expect(todayCell).toBeInTheDocument();
    expect(todayCell.textContent).toBe(String(today.getDate()));
  });

  it('renders day-of-week headers', () => {
    renderDatepicker();

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByText('Su')).toBeInTheDocument();
    expect(screen.getByText('Mo')).toBeInTheDocument();
    expect(screen.getByText('Fr')).toBeInTheDocument();
    expect(screen.getByText('Sa')).toBeInTheDocument();
  });

  it('has a Today shortcut button', () => {
    renderDatepicker();

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });

  it('wraps month from January backward to December of previous year', () => {
    renderDatepicker({ value: '2024-01-10' });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByText('January 2024')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: 'Previous month' });
    fireEvent.click(prevBtn);

    expect(screen.getByText('December 2023')).toBeInTheDocument();
  });

  it('wraps month from December forward to January of next year', () => {
    renderDatepicker({ value: '2024-12-10' });

    const trigger = screen.getByRole('button', { name: /start date/i });
    fireEvent.click(trigger);

    expect(screen.getByText('December 2024')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: 'Next month' });
    fireEvent.click(nextBtn);

    expect(screen.getByText('January 2025')).toBeInTheDocument();
  });
});
