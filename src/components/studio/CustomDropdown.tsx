'use client';

// ============================================================
// CustomDropdown — Fully custom select component for Studio CMS
// Replaces native <select>/<option> with styled React + Tailwind.
// Supports color badges (tier-level), keyboard navigation, and
// click-outside-to-close behavior.
// Requirements: 6.1, 6.2, 6.3, 6.4
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  color?: string;        // For tier-level visual badges
  description?: string;  // Optional secondary text
}

export interface CustomDropdownProps<T extends string = string> {
  id: string;
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
}

// ── Component ─────────────────────────────────────────────────

export function CustomDropdown<T extends string = string>({
  id,
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // ── Click outside handler ───────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ── Scroll highlighted option into view ─────────────────────

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;

    const items = listRef.current.querySelectorAll('[role="option"]');
    const item = items[highlightedIndex];
    if (item && typeof item.scrollIntoView === 'function') {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // ── Keyboard navigation ─────────────────────────────────────

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(
              options.findIndex((opt) => opt.value === value)
            );
          } else if (highlightedIndex >= 0) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(
              options.findIndex((opt) => opt.value === value)
            );
          } else {
            setHighlightedIndex((prev) =>
              prev < options.length - 1 ? prev + 1 : 0
            );
          }
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(
              options.findIndex((opt) => opt.value === value)
            );
          } else {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : options.length - 1
            );
          }
          break;
        }
        case 'Escape': {
          event.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        }
        case 'Tab': {
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        }
      }
    },
    [disabled, isOpen, highlightedIndex, options, value, onChange]
  );

  // ── Toggle open ─────────────────────────────────────────────

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (!prev) {
        setHighlightedIndex(options.findIndex((opt) => opt.value === value));
      } else {
        setHighlightedIndex(-1);
      }
      return !prev;
    });
  }, [disabled, options, value]);

  // ── Select option ───────────────────────────────────────────

  const handleSelect = useCallback(
    (optionValue: T) => {
      onChange(optionValue);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  // ── Render helpers ──────────────────────────────────────────

  const renderColorBadge = (option: DropdownOption<T>) => {
    if (!option.color) return null;
    return (
      <span
        className="inline-block w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: option.color }}
        aria-hidden="true"
      />
    );
  };

  const renderOptionContent = (option: DropdownOption<T>) => (
    <span className="flex items-center gap-2 min-w-0">
      {renderColorBadge(option)}
      <span className="truncate font-medium">{option.label}</span>
      {option.description && (
        <span className="text-text-tertiary text-xs truncate ml-auto">
          {option.description}
        </span>
      )}
    </span>
  );

  // ── Render ──────────────────────────────────────────────────

  const labelClass =
    'block font-heading text-xs uppercase tracking-wider text-text-secondary mb-1.5';

  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      <label id={`${id}-label`} className={labelClass}>
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${id}-option-${highlightedIndex}`
            : undefined
        }
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left',
          'bg-bg-deep/60 border border-white/10',
          'font-body text-sm text-text-primary',
          'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
          'transition-colors duration-150',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-white/20',
        )}
      >
        {selectedOption ? (
          renderOptionContent(selectedOption)
        ) : (
          <span className="text-text-tertiary">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-text-tertiary transition-transform duration-150',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {/* Options list */}
      {isOpen && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className={cn(
            'absolute z-50 mt-1 w-full max-h-60 overflow-y-auto overscroll-contain rounded-lg',
            'bg-bg-surface border border-white/10 shadow-lg shadow-black/20',
            'py-1',
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur before selection
                  handleSelect(option.value);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 cursor-pointer text-sm',
                  'transition-colors duration-75',
                  isHighlighted && 'bg-accent-primary/10',
                  isSelected && !isHighlighted && 'bg-white/5',
                  !isHighlighted && !isSelected && 'hover:bg-white/5',
                )}
              >
                {renderColorBadge(option)}
                <span
                  className={cn(
                    'truncate font-medium',
                    isSelected && 'text-accent-primary',
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-text-tertiary text-xs truncate ml-auto">
                    {option.description}
                  </span>
                )}
                {isSelected && (
                  <span className="ml-auto text-accent-primary text-xs" aria-hidden="true">
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
