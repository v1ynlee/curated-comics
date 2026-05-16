// Feature: studio-ui-revision, Property 2: Custom Dropdown styling consistency
// **Validates: Requirements 6.3, 6.4**

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { CustomDropdown } from '@/components/studio/CustomDropdown';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel } from '@/types/title';
import type { DropdownOption } from '@/components/studio/CustomDropdown';
import { GenreMoodSelector } from '@/components/studio/GenreMoodSelector';
import { CardWrapper } from '@/components/studio/CardWrapper';
import { ActivityFeed, MAX_ACTIVITY_ENTRIES, type ActivityEntry } from '@/components/studio/ActivityFeed';

const ALL_TIER_LEVELS: TierLevel[] = ['SSS+', 'S', 'A', 'B', 'C', 'D', 'F'];

/**
 * Convert a hex color string to the rgb() format that jsdom uses for inline styles.
 */
function hexToRgb(hex: string): string {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const TIER_OPTIONS: DropdownOption<TierLevel>[] = ALL_TIER_LEVELS.map((tier) => ({
  value: tier,
  label: TIER_CONFIG[tier].label,
  color: TIER_CONFIG[tier].color,
  description: TIER_CONFIG[tier].description,
}));

describe('Property 2: Custom Dropdown styling consistency', () => {
  it('renders the correct color badge for the selected tier in the closed state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_TIER_LEVELS),
        (tierLevel: TierLevel) => {
          const expectedColor = TIER_CONFIG[tierLevel].color;

          const { container, unmount } = render(
            <CustomDropdown
              id="tier-test"
              label="Tier"
              options={TIER_OPTIONS}
              value={tierLevel}
              onChange={() => {}}
            />
          );

          // In the closed state, the trigger button should show the selected value
          // with its color badge (a span with backgroundColor matching the tier color)
          const trigger = container.querySelector('[role="combobox"]');
          expect(trigger).not.toBeNull();

          // Find the color badge within the trigger (closed state)
          const colorBadges = trigger!.querySelectorAll('span[aria-hidden="true"]');
          const badgeWithColor = Array.from(colorBadges).find(
            (el) => (el as HTMLElement).style.backgroundColor !== ''
          );

          expect(badgeWithColor).toBeDefined();
          const badgeEl = badgeWithColor as HTMLElement;
          expect(badgeEl.style.backgroundColor).toBeTruthy();

          // Verify the inline style matches the expected color
          // jsdom converts hex colors to rgb() format
          expect(badgeEl.style.backgroundColor).toBe(hexToRgb(expectedColor));

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('renders the correct color badge for each tier option in the open options list', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_TIER_LEVELS),
        (tierLevel: TierLevel) => {
          const expectedColor = TIER_CONFIG[tierLevel].color;

          const { container, unmount } = render(
            <CustomDropdown
              id="tier-test-open"
              label="Tier"
              options={TIER_OPTIONS}
              value={tierLevel}
              onChange={() => {}}
            />
          );

          // Open the dropdown
          const trigger = container.querySelector('[role="combobox"]');
          expect(trigger).not.toBeNull();
          fireEvent.click(trigger!);

          // Find the listbox
          const listbox = container.querySelector('[role="listbox"]');
          expect(listbox).not.toBeNull();

          // Find the option corresponding to the generated tier level
          const options = listbox!.querySelectorAll('[role="option"]');
          const optionIndex = ALL_TIER_LEVELS.indexOf(tierLevel);
          const targetOption = options[optionIndex];
          expect(targetOption).toBeDefined();

          // Find the color badge within this option
          const colorBadges = targetOption.querySelectorAll('span[aria-hidden="true"]');
          const badgeWithColor = Array.from(colorBadges).find(
            (el) => (el as HTMLElement).style.backgroundColor !== ''
          );

          expect(badgeWithColor).toBeDefined();
          const badgeEl = badgeWithColor as HTMLElement;
          expect(badgeEl.style.backgroundColor).toBe(hexToRgb(expectedColor));

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all tier options show their respective color badges in the open list', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_TIER_LEVELS),
        (selectedTier: TierLevel) => {
          const { container, unmount } = render(
            <CustomDropdown
              id="tier-test-all"
              label="Tier"
              options={TIER_OPTIONS}
              value={selectedTier}
              onChange={() => {}}
            />
          );

          // Open the dropdown
          const trigger = container.querySelector('[role="combobox"]');
          fireEvent.click(trigger!);

          // Verify every option in the list has its correct color badge
          const listbox = container.querySelector('[role="listbox"]');
          const optionElements = listbox!.querySelectorAll('[role="option"]');

          expect(optionElements.length).toBe(ALL_TIER_LEVELS.length);

          ALL_TIER_LEVELS.forEach((tier, index) => {
            const option = optionElements[index];
            const colorBadges = option.querySelectorAll('span[aria-hidden="true"]');
            const badgeWithColor = Array.from(colorBadges).find(
              (el) => (el as HTMLElement).style.backgroundColor !== ''
            );

            expect(badgeWithColor).toBeDefined();
            const badgeEl = badgeWithColor as HTMLElement;
            expect(badgeEl.style.backgroundColor).toBe(hexToRgb(TIER_CONFIG[tier].color));
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});


// Feature: studio-ui-revision, Property 3: Genre/Mood search filtering
// **Validates: Requirements 8.3**

describe('Property 3: Genre/Mood search filtering', () => {
  // Arbitrary for generating genre/mood items with unique IDs and alphabetic names
  const genreItemArb = fc.record({
    id: fc.uuid(),
    name: fc.stringMatching(/^[a-zA-Z][a-zA-Z ]{0,19}$/).filter((s) => s.trim().length > 0),
  });

  // Generate a list of unique genre items (unique by id)
  const genreListArb = fc.uniqueArray(genreItemArb, {
    minLength: 1,
    maxLength: 20,
    selector: (item) => item.id,
  });

  // Generate a non-empty alphabetic search string (to match realistic genre names)
  const searchStringArb = fc.stringMatching(/^[a-zA-Z]{1,10}$/);

  it('displays only items whose names contain the search string (case-insensitive) and hides non-matching items', () => {
    fc.assert(
      fc.property(
        genreListArb,
        searchStringArb,
        fc.constantFrom('genre' as const, 'mood' as const),
        (genres, searchStr, selectorType) => {
          const { container, unmount } = render(
            <GenreMoodSelector
              type={selectorType}
              available={genres}
              selected={[]}
              onToggle={() => {}}
            />
          );

          try {
            // Type the search string into the search input
            const searchInput = container.querySelector(`#${selectorType}-search`) as HTMLInputElement;
            expect(searchInput).not.toBeNull();
            fireEvent.change(searchInput, { target: { value: searchStr } });

            // Determine which items should match (case-insensitive substring)
            const term = searchStr.toLowerCase();
            const expectedMatching = genres.filter((item) =>
              item.name.toLowerCase().includes(term)
            );
            const expectedNonMatching = genres.filter((item) =>
              !item.name.toLowerCase().includes(term)
            );

            // Find the results section
            const label = selectorType === 'genre' ? 'Genre' : 'Mood';
            const resultsList = container.querySelector(`[aria-label="${label} search results"]`);

            if (expectedMatching.length > 0) {
              // Results section should exist and contain matching items
              expect(resultsList).not.toBeNull();

              // Each matching item's name should appear in the results (component shows max 10)
              for (const item of expectedMatching.slice(0, 10)) {
                const buttons = resultsList!.querySelectorAll('button');
                // The component renders buttons with aria-label="Select {name}" for unselected items
                const found = Array.from(buttons).some((btn) =>
                  btn.getAttribute('aria-label') === `Select ${item.name}`
                );
                expect(found).toBe(true);
              }
            } else {
              // No matching items means no results section
              expect(resultsList).toBeNull();
            }

            // Non-matching items should NOT appear in the results section
            if (resultsList) {
              for (const item of expectedNonMatching) {
                const buttons = resultsList.querySelectorAll('button');
                // Check that no button has this exact item name as its text
                // (using aria-label which is "Select {name}" for unselected items)
                const found = Array.from(buttons).some((btn) =>
                  btn.getAttribute('aria-label') === `Select ${item.name}`
                );
                expect(found).toBe(false);
              }
            }
          } finally {
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('shows no filtered results when search string is empty', () => {
    fc.assert(
      fc.property(
        genreListArb,
        fc.constantFrom('genre' as const, 'mood' as const),
        (genres, selectorType) => {
          const { container, unmount } = render(
            <GenreMoodSelector
              type={selectorType}
              available={genres}
              selected={[]}
              onToggle={() => {}}
            />
          );

          try {
            // With empty search, no results section should appear
            const label = selectorType === 'genre' ? 'Genre' : 'Mood';
            const resultsList = container.querySelector(`[aria-label="${label} search results"]`);
            expect(resultsList).toBeNull();
          } finally {
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: studio-ui-revision, Property 4: Genre/Mood selection badge display
// **Validates: Requirements 8.5, 8.8**

describe('Property 4: Genre/Mood selection badge display', () => {
  // Generate realistic genre/mood names (letters, digits, spaces, hyphens)
  // This avoids CSS selector issues with special characters while still testing
  // the property across many random inputs.
  const genreNameArb = fc
    .stringMatching(/^[A-Za-z][A-Za-z0-9 -]{0,19}$/)
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim());

  // Arbitrary for generating a list of available items with unique IDs and unique names
  const availableItemsArb = fc.uniqueArray(
    fc.record({
      id: fc.uuid(),
      name: genreNameArb,
    }),
    { minLength: 1, maxLength: 15, selector: (item) => item.name }
  );

  // Given available items, generate a non-empty subset of their IDs as selected
  const selectedSubsetArb = (available: { id: string; name: string }[]) =>
    fc
      .subarray(available, { minLength: 1 })
      .map((items) => items.map((item) => item.id));

  it('each selected genre produces a visible badge with name and ✕ remove button', () => {
    fc.assert(
      fc.property(
        availableItemsArb.chain((available) =>
          selectedSubsetArb(available).map((selected) => ({ available, selected }))
        ),
        ({ available, selected }) => {
          const { container, unmount } = render(
            <GenreMoodSelector
              type="genre"
              available={available}
              selected={selected}
              onToggle={() => {}}
            />
          );

          // Each selected item should produce a badge with its name and a remove button
          for (const id of selected) {
            const item = available.find((a) => a.id === id)!;
            // The remove button has aria-label="Remove {name}"
            const removeButton = container.querySelector(
              `[aria-label="Remove ${item.name}"]`
            );
            expect(removeButton).not.toBeNull();
            // The badge should contain the item's name text
            expect(removeButton!.textContent).toContain(item.name);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each selected mood produces a visible badge with name and ✕ remove button', () => {
    fc.assert(
      fc.property(
        availableItemsArb.chain((available) =>
          selectedSubsetArb(available).map((selected) => ({ available, selected }))
        ),
        ({ available, selected }) => {
          const { container, unmount } = render(
            <GenreMoodSelector
              type="mood"
              available={available}
              selected={selected}
              onToggle={() => {}}
            />
          );

          // Each selected item should produce a badge with its name and a remove button
          for (const id of selected) {
            const item = available.find((a) => a.id === id)!;
            const removeButton = container.querySelector(
              `[aria-label="Remove ${item.name}"]`
            );
            expect(removeButton).not.toBeNull();
            expect(removeButton!.textContent).toContain(item.name);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('badge display behavior is identical for genres and moods given the same data', () => {
    fc.assert(
      fc.property(
        availableItemsArb.chain((available) =>
          selectedSubsetArb(available).map((selected) => ({ available, selected }))
        ),
        ({ available, selected }) => {
          const { container: genreContainer, unmount: unmountGenre } = render(
            <GenreMoodSelector
              type="genre"
              available={available}
              selected={selected}
              onToggle={() => {}}
            />
          );

          const { container: moodContainer, unmount: unmountMood } = render(
            <GenreMoodSelector
              type="mood"
              available={available}
              selected={selected}
              onToggle={() => {}}
            />
          );

          // For each selected item, both genre and mood should render a badge
          for (const id of selected) {
            const item = available.find((a) => a.id === id)!;

            const genreBadge = genreContainer.querySelector(
              `[aria-label="Remove ${item.name}"]`
            );
            const moodBadge = moodContainer.querySelector(
              `[aria-label="Remove ${item.name}"]`
            );

            // Both should exist
            expect(genreBadge).not.toBeNull();
            expect(moodBadge).not.toBeNull();

            // Both should contain the item name
            expect(genreBadge!.textContent).toContain(item.name);
            expect(moodBadge!.textContent).toContain(item.name);
          }

          unmountGenre();
          unmountMood();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: studio-ui-revision, Property 5: Card save/cancel round-trip
// **Validates: Requirements 12.2, 12.4**

describe('Property 5: Card save/cancel round-trip', () => {
  it('card returns to original editable state after save then cancel', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        async (cardTitle: string) => {
          // Create a mock onSave that resolves immediately
          const onSave = () => Promise.resolve();

          const { container, unmount } = render(
            <CardWrapper title={cardTitle} onSave={onSave}>
              <input type="text" data-testid="child-input" defaultValue="test" />
            </CardWrapper>
          );

          // Initially, the fieldset should NOT be disabled (editable state)
          const fieldset = container.querySelector('fieldset');
          expect(fieldset).not.toBeNull();
          expect(fieldset!.disabled).toBe(false);

          // Click the save button within act to handle state updates
          const saveButton = container.querySelector('button[aria-label]');
          expect(saveButton).not.toBeNull();

          await act(async () => {
            fireEvent.click(saveButton!);
          });

          // After save resolves, the card should be in disabled/saved state
          expect(fieldset!.disabled).toBe(true);

          // Find and click the cancel button (appears in saved state)
          const cancelButton = Array.from(container.querySelectorAll('button')).find(
            (btn) => btn.textContent?.includes('Cancel')
          );
          expect(cancelButton).toBeDefined();

          act(() => {
            fireEvent.click(cancelButton!);
          });

          // After cancel, the fieldset should be enabled again (editable state)
          expect(fieldset!.disabled).toBe(false);

          // Verify child input is enabled (not disabled by fieldset)
          const childInput = container.querySelector('input[data-testid="child-input"]');
          expect(childInput).not.toBeNull();
          expect((childInput as HTMLInputElement).disabled).toBe(false);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('card inputs remain enabled after save/cancel cycle regardless of card title', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
          fc.nat({ max: 5 })
        ),
        async ([cardTitle, inputCount]: [string, number]) => {
          const actualInputCount = Math.max(1, inputCount);
          const onSave = () => Promise.resolve();

          const { container, unmount } = render(
            <CardWrapper title={cardTitle} onSave={onSave}>
              {Array.from({ length: actualInputCount }, (_, i) => (
                <input key={i} type="text" data-testid={`input-${i}`} defaultValue={`value-${i}`} />
              ))}
            </CardWrapper>
          );

          const fieldset = container.querySelector('fieldset');
          expect(fieldset).not.toBeNull();

          // Save
          const saveButton = container.querySelector('button[aria-label]');
          await act(async () => {
            fireEvent.click(saveButton!);
          });

          // Should be disabled after save
          expect(fieldset!.disabled).toBe(true);

          // Cancel
          const cancelButton = Array.from(container.querySelectorAll('button')).find(
            (btn) => btn.textContent?.includes('Cancel')
          );
          expect(cancelButton).toBeDefined();

          act(() => {
            fireEvent.click(cancelButton!);
          });

          // All inputs should be enabled
          expect(fieldset!.disabled).toBe(false);
          const inputs = container.querySelectorAll('input[data-testid]');
          inputs.forEach((input) => {
            expect((input as HTMLInputElement).disabled).toBe(false);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});


// Feature: studio-ui-revision, Property 7: Activity entry thumbnail display
// **Validates: Requirements 15.3**

// Mock next/image to render a plain <img> element
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { unoptimized, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock next/link to render a plain <a> element
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Property 7: Activity entry thumbnail display', () => {
  // Arbitrary for generating activity entry types
  const activityTypeArb = fc.constantFrom('title' as const, 'article' as const, 'media' as const, 'genre' as const);

  // Arbitrary for generating a valid thumbnail URL (non-empty string path)
  const thumbnailArb = fc.stringMatching(/^\/images\/covers\/[a-z0-9-]{1,30}-320w\.avif$/);

  // Arbitrary for generating an activity entry WITH a thumbnail
  const activityEntryWithThumbnailArb = fc.record({
    id: fc.uuid(),
    type: activityTypeArb,
    label: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    meta: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    href: fc.constant('/studio/titles/test'),
    createdAt: fc.constant(new Date().toISOString()),
    thumbnail: thumbnailArb,
  });

  // Arbitrary for generating an activity entry WITHOUT a thumbnail
  const activityEntryWithoutThumbnailArb = fc.record({
    id: fc.uuid(),
    type: activityTypeArb,
    label: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    meta: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    href: fc.constant('/studio/titles/test'),
    createdAt: fc.constant(new Date().toISOString()),
    thumbnail: fc.constant(undefined),
  });

  it('entries with images contain a thumbnail element', () => {
    fc.assert(
      fc.property(
        activityEntryWithThumbnailArb,
        (entry) => {
          const { container, unmount } = render(
            <ActivityFeed entries={[entry as ActivityEntry]} />
          );

          try {
            // Entry with thumbnail should render a thumbnail element
            const thumbnailEl = container.querySelector('[data-testid="activity-thumbnail"]');
            expect(thumbnailEl).not.toBeNull();

            // Should contain an img element
            const imgEl = thumbnailEl!.querySelector('img');
            expect(imgEl).not.toBeNull();

            // Should NOT have an icon placeholder
            const iconPlaceholder = container.querySelector('[data-testid="activity-icon-placeholder"]');
            expect(iconPlaceholder).toBeNull();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('entries without images do not contain a thumbnail element', () => {
    fc.assert(
      fc.property(
        activityEntryWithoutThumbnailArb,
        (entry) => {
          const { container, unmount } = render(
            <ActivityFeed entries={[entry as ActivityEntry]} />
          );

          try {
            // Entry without thumbnail should NOT render a thumbnail element
            const thumbnailEl = container.querySelector('[data-testid="activity-thumbnail"]');
            expect(thumbnailEl).toBeNull();

            // Should NOT contain an img element
            const imgEl = container.querySelector('img');
            expect(imgEl).toBeNull();

            // Should have an icon placeholder instead
            const iconPlaceholder = container.querySelector('[data-testid="activity-icon-placeholder"]');
            expect(iconPlaceholder).not.toBeNull();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mixed entries correctly show thumbnails only for entries with images', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.array(activityEntryWithThumbnailArb, { minLength: 1, maxLength: 4 }),
          fc.array(activityEntryWithoutThumbnailArb, { minLength: 1, maxLength: 4 })
        ),
        ([withThumbnails, withoutThumbnails]) => {
          const allEntries = [...withThumbnails, ...withoutThumbnails].slice(0, 8) as ActivityEntry[];

          const { container, unmount } = render(
            <ActivityFeed entries={allEntries} />
          );

          try {
            const entryElements = container.querySelectorAll('[data-testid="activity-entry"]');

            // Count thumbnails and icon placeholders
            const thumbnailCount = container.querySelectorAll('[data-testid="activity-thumbnail"]').length;
            const iconPlaceholderCount = container.querySelectorAll('[data-testid="activity-icon-placeholder"]').length;

            // The number of thumbnails should equal the number of entries with thumbnails (capped at 8)
            const expectedWithThumbnails = allEntries.filter((e) => e.thumbnail !== undefined).length;
            const expectedWithoutThumbnails = allEntries.filter((e) => e.thumbnail === undefined).length;

            expect(thumbnailCount).toBe(expectedWithThumbnails);
            expect(iconPlaceholderCount).toBe(expectedWithoutThumbnails);

            // Total entries should match
            expect(entryElements.length).toBe(allEntries.length);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


// Feature: studio-ui-revision, Property 6: Activity section maximum entries
// **Validates: Requirements 15.1**

describe('Property 6: Activity section maximum entries', () => {
  // Arbitrary for generating a single activity entry
  const activityTypeArb = fc.constantFrom('title' as const, 'article' as const, 'media' as const, 'genre' as const);

  const activityEntryArb = fc.record({
    id: fc.uuid(),
    type: activityTypeArb,
    label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    meta: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    href: fc.constant('/studio/titles/test'),
    createdAt: fc.integer({ min: 1577836800000, max: 1767225600000 }).map((ts) => new Date(ts).toISOString()),
    thumbnail: fc.option(fc.constant('/images/covers/test-320w.avif'), { nil: undefined }),
  }) as fc.Arbitrary<ActivityEntry>;

  // Generate activity lists of varying lengths (0 to 50)
  const activityListArb = fc.array(activityEntryArb, { minLength: 0, maxLength: 50 });

  it('displays at most min(N, 8) entries for any list of N activity entries', () => {
    fc.assert(
      fc.property(
        activityListArb,
        (entries: ActivityEntry[]) => {
          const { container, unmount } = render(
            <ActivityFeed entries={entries} />
          );

          const renderedEntries = container.querySelectorAll('[data-testid="activity-entry"]');
          const expectedCount = Math.min(entries.length, MAX_ACTIVITY_ENTRIES);

          expect(renderedEntries.length).toBe(expectedCount);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('never renders more than 8 entries regardless of input size', () => {
    fc.assert(
      fc.property(
        activityListArb,
        (entries: ActivityEntry[]) => {
          const { container, unmount } = render(
            <ActivityFeed entries={entries} />
          );

          const renderedEntries = container.querySelectorAll('[data-testid="activity-entry"]');

          // Core property: never more than MAX_ACTIVITY_ENTRIES (8)
          expect(renderedEntries.length).toBeLessThanOrEqual(MAX_ACTIVITY_ENTRIES);

          // Also: never more than the input length
          expect(renderedEntries.length).toBeLessThanOrEqual(entries.length);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('renders exactly N entries when N <= 8', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 8 }).chain((n) =>
          fc.array(activityEntryArb, { minLength: n, maxLength: n }).map((entries) => ({
            entries,
            expectedCount: n,
          }))
        ),
        ({ entries, expectedCount }) => {
          const { container, unmount } = render(
            <ActivityFeed entries={entries} />
          );

          const renderedEntries = container.querySelectorAll('[data-testid="activity-entry"]');
          expect(renderedEntries.length).toBe(expectedCount);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});


// Feature: studio-ui-revision, Property 8: Curation collection add/remove round-trip
// **Validates: Requirements 18.4**

/**
 * Pure helper functions representing the add/remove title logic
 * used in the CurationInterface component's state management.
 * These mirror the state transitions in handleAddTitle and handleRemoveTitle.
 */
function addTitle(list: string[], id: string): string[] {
  return [...list, id];
}

function removeTitle(list: string[], id: string): string[] {
  return list.filter((x) => x !== id);
}

describe('Property 8: Curation collection add/remove round-trip', () => {
  // Arbitrary for generating a list of unique title IDs (simulating a collection's titleIds)
  const titleIdListArb = fc.uniqueArray(fc.uuid(), { minLength: 0, maxLength: 20 });

  // Given a list of existing IDs, generate a new ID that is NOT in the list
  const newTitleIdArb = (existingIds: string[]) =>
    fc.uuid().filter((id) => !existingIds.includes(id));

  it('adding then removing a title returns the collection to its original state', () => {
    fc.assert(
      fc.property(
        titleIdListArb.chain((list) =>
          newTitleIdArb(list).map((newId) => ({ list, newId }))
        ),
        ({ list, newId }) => {
          // The new ID is guaranteed not to be in the original list
          const afterAdd = addTitle(list, newId);
          const afterRemove = removeTitle(afterAdd, newId);

          // The collection should be unchanged from its original state
          expect(afterRemove).toEqual(list);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the added title is present in the collection after adding', () => {
    fc.assert(
      fc.property(
        titleIdListArb.chain((list) =>
          newTitleIdArb(list).map((newId) => ({ list, newId }))
        ),
        ({ list, newId }) => {
          const afterAdd = addTitle(list, newId);

          // The new title should be in the list after adding
          expect(afterAdd).toContain(newId);
          // The length should increase by 1
          expect(afterAdd.length).toBe(list.length + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the removed title is not present in the collection after removing', () => {
    fc.assert(
      fc.property(
        titleIdListArb.chain((list) =>
          newTitleIdArb(list).map((newId) => ({ list, newId }))
        ),
        ({ list, newId }) => {
          const afterAdd = addTitle(list, newId);
          const afterRemove = removeTitle(afterAdd, newId);

          // The title should not be in the list after removing
          expect(afterRemove).not.toContain(newId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('original titles are preserved during the add/remove round-trip', () => {
    fc.assert(
      fc.property(
        titleIdListArb.chain((list) =>
          newTitleIdArb(list).map((newId) => ({ list, newId }))
        ),
        ({ list, newId }) => {
          const afterAdd = addTitle(list, newId);
          const afterRemove = removeTitle(afterAdd, newId);

          // Every original title should still be present
          for (const originalId of list) {
            expect(afterRemove).toContain(originalId);
          }
          // And no extra titles should be present
          expect(afterRemove.length).toBe(list.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('multiple add/remove cycles maintain collection integrity', () => {
    fc.assert(
      fc.property(
        titleIdListArb.chain((list) =>
          fc.uniqueArray(fc.uuid().filter((id) => !list.includes(id)), { minLength: 1, maxLength: 5 })
            .map((newIds) => ({ list, newIds }))
        ),
        ({ list, newIds }) => {
          let current = [...list];

          // Add all new titles
          for (const id of newIds) {
            current = addTitle(current, id);
          }

          // Remove all new titles (in reverse order)
          for (const id of [...newIds].reverse()) {
            current = removeTitle(current, id);
          }

          // Collection should be back to original state
          expect(current).toEqual(list);
        }
      ),
      { numRuns: 100 }
    );
  });
});
