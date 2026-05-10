'use client';

// ============================================================
// useDebouncedValue
// ============================================================

import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of the value.
 * Useful for search inputs and filter controls.
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
