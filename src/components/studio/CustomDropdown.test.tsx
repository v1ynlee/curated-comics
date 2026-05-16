import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomDropdown } from './CustomDropdown';
import type { DropdownOption } from './CustomDropdown';

// ── Test data ─────────────────────────────────────────────────

const tierOptions: DropdownOption[] = [
  { value: 'SSS+', label: 'SSS+ — Transcendent', color: '#FFD700', description: 'Changed my brain chemistry' },
  { value: 'S', label: 'S — Peak Fiction', color: '#E040FB', description: 'Masterpiece, no notes' },
  { value: 'A', label: 'A — Excellent', color: '#8B5CF6', description: 'Highly recommended' },
  { value: 'B', label: 'B — Good', color: '#3B82F6', description: 'Enjoyable, solid read' },
  { value: 'C', label: 'C — Generic But Addictive', color: '#6B7280', description: 'Mid but readable' },
];

const simpleOptions: DropdownOption[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
];

describe('CustomDropdown', () => {
  it('does NOT render native <select> or <option> elements', () => {
    const { container } = render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="ongoing"
        onChange={() => {}}
      />
    );

    expect(container.querySelector('select')).toBeNull();
    expect(container.querySelector('option')).toBeNull();
  });

  it('renders the label text', () => {
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Series Status"
        options={simpleOptions}
        value="ongoing"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Series Status')).toBeInTheDocument();
  });

  it('displays the selected value in closed state', () => {
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="completed"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays placeholder when no value matches', () => {
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value={'' as string}
        onChange={() => {}}
        placeholder="Pick one"
      />
    );

    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('opens options list on click', () => {
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="ongoing"
        onChange={() => {}}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onChange when an option is selected', () => {
    const handleChange = vi.fn();
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="ongoing"
        onChange={handleChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const completedOption = screen.getByText('Completed');
    fireEvent.mouseDown(completedOption);

    expect(handleChange).toHaveBeenCalledWith('completed');
  });

  it('closes on Escape key', () => {
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="ongoing"
        onChange={() => {}}
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with arrow keys and selects with Enter', () => {
    const handleChange = vi.fn();
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="ongoing"
        onChange={handleChange}
      />
    );

    const trigger = screen.getByRole('combobox');

    // Open with ArrowDown
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Move down from current selection (index 0) to index 1
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    // Select with Enter
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith('completed');
  });

  it('renders color badges for tier-level options', () => {
    const { container } = render(
      <CustomDropdown
        id="tier-dropdown"
        label="Tier"
        options={tierOptions}
        value="SSS+"
        onChange={() => {}}
      />
    );

    // The selected value in closed state should show a color badge
    const badges = container.querySelectorAll('[aria-hidden="true"]');
    // At minimum, the color badge for the selected option should be present
    const colorBadge = Array.from(badges).find(
      (el) => el.tagName === 'SPAN' && (el as HTMLElement).style.backgroundColor === 'rgb(255, 215, 0)'
    );
    expect(colorBadge).toBeTruthy();
  });

  it('retains styled appearance of selected value in closed state (Req 6.4)', () => {
    render(
      <CustomDropdown
        id="tier-dropdown"
        label="Tier"
        options={tierOptions}
        value="S"
        onChange={() => {}}
      />
    );

    // The selected option label should be visible in closed state
    expect(screen.getByText('S — Peak Fiction')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="ongoing"
        onChange={() => {}}
        disabled
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes when clicking outside', () => {
    render(
      <div>
        <CustomDropdown
          id="test-dropdown"
          label="Status"
          options={simpleOptions}
          value="ongoing"
          onChange={() => {}}
        />
        <button data-testid="outside">Outside</button>
      </div>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('wraps around when navigating past last/first option', () => {
    const handleChange = vi.fn();
    render(
      <CustomDropdown
        id="test-dropdown"
        label="Status"
        options={simpleOptions}
        value="hiatus"
        onChange={handleChange}
      />
    );

    const trigger = screen.getByRole('combobox');

    // Open dropdown - highlighted should be at index 2 (hiatus)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    // Move down from index 2 - should wrap to 0
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    // Select with Enter - should be 'ongoing' (index 0)
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith('ongoing');
  });
});
