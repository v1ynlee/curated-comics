'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/lib/utils/toast';
import { generateTitleAutofillAction } from '@/app/studio/titles/new/actions';
import type { AutofillPayload } from '@/types/studio';

type AutofillState = 'idle' | 'loading' | 'success';

export function useGeminiAutofill(onPreview: (payload: AutofillPayload) => void) {
  const [state, setState] = useState<AutofillState>('idle');

  const runAutofill = useCallback(async (title: string) => {
    const seed = title.trim();
    if (!seed) {
      toast.warning('Add a title before using AI.');
      return;
    }

    setState('loading');
    const toastId = toast.loading(`Searching "${seed}"...`);
    try {
      const result = await generateTitleAutofillAction(seed);
      if (!result.success) {
        toast.error(result.error, { id: toastId });
        setState('idle');
        return;
      }

      toast.success('Metadata found.', { id: toastId });
      toast.loading('Preparing preview...', { id: toastId });
      onPreview(result.data);
      toast.success('Ready to review.', { id: toastId });
      setState('success');
      window.setTimeout(() => setState('idle'), 1400);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gemini unavailable.', { id: toastId });
      setState('idle');
    }
  }, [onPreview]);

  return { state, runAutofill };
}
