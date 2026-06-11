'use server';

import { getServerUser } from '@/lib/db/supabase-server';
import { generateTitleAutofill, GeminiTitleGeneratorError } from '@/services/studio/gemini-title-generator';
import type { AutofillPayload } from '@/types/studio';

export async function generateTitleAutofillAction(title: string): Promise<{ success: true; data: AutofillPayload } | { success: false; error: string; code: string }> {
  const user = await getServerUser();
  if (!user) return { success: false, error: 'Unauthorized.', code: 'unauthorized' };

  const seed = title.trim();
  if (!seed) return { success: false, error: 'Add a title before using AI.', code: 'missing-title' };

  try {
    const result = await generateTitleAutofill(seed);
    return { success: true, data: result.payload };
  } catch (error) {
    if (error instanceof GeminiTitleGeneratorError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: 'AI generation failed.', code: 'unknown' };
  }
}
