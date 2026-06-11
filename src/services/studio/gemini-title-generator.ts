import { GoogleGenAI } from '@google/genai';
import type { AutofillConfidence, AutofillFieldIntelligenceMap, AutofillPayload, AutofillPayloadField, GeminiTitleResponse } from '@/types/studio';

export class GeminiTitleGeneratorError extends Error {
  constructor(message: string, public code: 'missing-config' | 'not-found' | 'rate-limit' | 'invalid-response' | 'network' | 'unavailable') {
    super(message);
    this.name = 'GeminiTitleGeneratorError';
  }
}

const VALID_FORMATS = ['manga', 'manhwa', 'manhua', 'unknown'] as const;
const VALID_STATUSES = ['ongoing', 'hiatus', 'cancelled', 'completed', 'unknown'] as const;
const VALID_CONFIDENCE: AutofillConfidence[] = ['high', 'medium', 'low'];
const PAYLOAD_FIELDS: AutofillPayloadField[] = [
  'englishTitle',
  'originalTitle',
  'alternativeTitles',
  'origin',
  'seriesStatus',
  'readingStatus',
  'author',
  'artist',
  'releaseDate',
  'completedDate',
  'synopsis',
  'vibeCheck',
  'genres',
  'moods',
];

const RESPONSE_TO_PAYLOAD_FIELD: Record<string, AutofillPayloadField> = {
  title: 'englishTitle',
  english_title: 'englishTitle',
  original_title: 'originalTitle',
  alternative_titles: 'alternativeTitles',
  format: 'origin',
  status: 'seriesStatus',
  reading_status: 'readingStatus',
  authors: 'author',
  author: 'author',
  artists: 'artist',
  artist: 'artist',
  release_date: 'releaseDate',
  completed_date: 'completedDate',
  synopsis: 'synopsis',
  vibes: 'vibeCheck',
  vibe_check: 'vibeCheck',
  genres: 'genres',
  moods: 'moods',
};

function buildPrompt(title: string) {
  return `
You are a manga/manhwa/manhua metadata extractor.

Identify the comic series from the given title and return structured metadata.

Return ONLY valid JSON. Do not wrap response in markdown. Do not explain anything.

Rules:
- Always respond in English.
- If information is unknown, use null.
- alternative_titles, authors, artists, vibes, genres, and moods must always be arrays.
- synopsis must be concise but informative, 2-5 sentences.
- original titles should preserve native language characters if available.
- Dates should use ISO format when possible: YYYY-MM-DD. If exact day/month is unknown, use YYYY or YYYY-MM.
- Do not hallucinate missing information.
- If the title cannot be confidently identified, set title to null and all arrays to [].
- Add match_confidence using high, medium, or low.
- Add candidate_count when multiple plausible series could match; otherwise use 1 or null.
- Add field_intelligence for every non-empty field you return.
- Each field_intelligence entry must include confidence high/medium/low.
- Add source only when you can identify a likely source such as MAL, AniList, Kakao, Naver, Official Publisher, or Wikipedia.
- Generated summaries, vibes, genres, and moods should usually be low or medium confidence unless backed by a clear source.

JSON schema:
{
  "title": "Official English title or null",
  "original_title": { "jp": null, "kr": null, "cn": null },
  "alternative_titles": [],
  "format": "manga | manhwa | manhua | unknown",
  "status": "ongoing | hiatus | cancelled | completed | unknown",
  "release_date": null,
  "completed_date": null,
  "authors": [],
  "artists": [],
  "synopsis": null,
  "vibes": [],
  "genres": [],
  "moods": [],
  "match_confidence": "high | medium | low",
  "candidate_count": 1,
  "field_intelligence": {
    "title": { "confidence": "high", "source": "AniList", "source_note": "Retrieved from AniList metadata." },
    "synopsis": { "confidence": "low", "source": null, "source_note": "Generated summary; verify before publishing." }
  }
}

User query: ${title}
`;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim()) : [];
}

function asDate(value: unknown) {
  return typeof value === 'string' && /^\d{4}(-\d{2})?(-\d{2})?$/.test(value) ? value : null;
}

function asConfidence(value: unknown, fallback: AutofillConfidence = 'medium'): AutofillConfidence {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return VALID_CONFIDENCE.includes(normalized as AutofillConfidence) ? normalized as AutofillConfidence : fallback;
}

function cleanString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function sourceNoteFor(source: string | undefined, fallback?: string) {
  if (fallback) return fallback;
  if (!source) return undefined;
  return `Retrieved from ${source} metadata.`;
}

function normalizeFieldIntelligence(value: unknown): AutofillFieldIntelligenceMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const output: AutofillFieldIntelligenceMap = {};
  const raw = value as Record<string, unknown>;
  for (const [rawKey, rawInfo] of Object.entries(raw)) {
    const field = RESPONSE_TO_PAYLOAD_FIELD[rawKey] ?? (PAYLOAD_FIELDS.includes(rawKey as AutofillPayloadField) ? rawKey as AutofillPayloadField : null);
    if (!field || !rawInfo || typeof rawInfo !== 'object' || Array.isArray(rawInfo)) continue;

    const info = rawInfo as Record<string, unknown>;
    const source = cleanString(info.source);
    const sourceNote = cleanString(info.source_note) ?? cleanString(info.sourceNote);
    output[field] = {
      confidence: asConfidence(info.confidence),
      source,
      sourceNote: sourceNoteFor(source, sourceNote),
      rationale: cleanString(info.rationale) ?? cleanString(info.reason),
    };
  }
  return output;
}

function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

function normalizeResponse(value: unknown): GeminiTitleResponse {
  if (!value || typeof value !== 'object') {
    throw new GeminiTitleGeneratorError('Gemini returned an invalid response format.', 'invalid-response');
  }

  const raw = value as Record<string, unknown>;
  const original = raw.original_title && typeof raw.original_title === 'object'
    ? raw.original_title as Record<string, unknown>
    : null;
  const format = typeof raw.format === 'string' && VALID_FORMATS.includes(raw.format as never) ? raw.format as GeminiTitleResponse['format'] : 'unknown';
  const status = typeof raw.status === 'string' && VALID_STATUSES.includes(raw.status as never) ? raw.status as GeminiTitleResponse['status'] : 'unknown';
  const candidateCount = typeof raw.candidate_count === 'number' && Number.isFinite(raw.candidate_count) ? Math.max(1, Math.round(raw.candidate_count)) : null;

  return {
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : null,
    original_title: original ? {
      jp: typeof original.jp === 'string' && original.jp.trim() ? original.jp.trim() : null,
      kr: typeof original.kr === 'string' && original.kr.trim() ? original.kr.trim() : null,
      cn: typeof original.cn === 'string' && original.cn.trim() ? original.cn.trim() : null,
    } : null,
    alternative_titles: asStringArray(raw.alternative_titles),
    format,
    status,
    release_date: asDate(raw.release_date),
    completed_date: asDate(raw.completed_date),
    authors: asStringArray(raw.authors),
    artists: asStringArray(raw.artists),
    synopsis: typeof raw.synopsis === 'string' && raw.synopsis.trim() ? raw.synopsis.trim() : null,
    vibes: asStringArray(raw.vibes),
    genres: asStringArray(raw.genres),
    moods: asStringArray(raw.moods),
    match_confidence: asConfidence(raw.match_confidence, candidateCount && candidateCount > 1 ? 'medium' : 'high'),
    candidate_count: candidateCount,
    field_intelligence: normalizeFieldIntelligence(raw.field_intelligence),
  };
}

function capConfidence(confidence: AutofillConfidence, maximum: AutofillConfidence): AutofillConfidence {
  const score: Record<AutofillConfidence, number> = { low: 0, medium: 1, high: 2 };
  if (score[confidence] <= score[maximum]) return confidence;
  return maximum;
}

function defaultConfidence(field: AutofillPayloadField, response: GeminiTitleResponse): AutofillConfidence {
  const base = response.match_confidence;
  const factualFields: AutofillPayloadField[] = ['englishTitle', 'originalTitle', 'origin', 'seriesStatus', 'readingStatus', 'author', 'artist', 'releaseDate', 'completedDate'];
  if (field === 'synopsis' || field === 'vibeCheck') return 'low';
  if (field === 'genres' || field === 'moods' || field === 'alternativeTitles') return capConfidence(base, 'medium');
  if (factualFields.includes(field)) return response.candidate_count && response.candidate_count > 1 ? capConfidence(base, 'medium') : base;
  return 'medium';
}

function fallbackRationale(field: AutofillPayloadField, confidence: AutofillConfidence, response: GeminiTitleResponse) {
  if (field === 'synopsis' || field === 'vibeCheck') return 'Generated editorial text; verify before publishing.';
  if (response.candidate_count && response.candidate_count > 1) return 'Multiple candidate matches were possible.';
  if (confidence === 'high') return 'Known title match from structured metadata.';
  if (confidence === 'medium') return 'Field inferred from available metadata.';
  return 'Field is generated or weakly supported.';
}

function mergeIntelligence(response: GeminiTitleResponse, fields: AutofillPayloadField[]): AutofillFieldIntelligenceMap {
  const output: AutofillFieldIntelligenceMap = {};
  for (const field of fields) {
    const provided = response.field_intelligence[field];
    const confidence = provided?.confidence ?? defaultConfidence(field, response);
    const source = provided?.source;
    output[field] = {
      confidence,
      source,
      sourceNote: sourceNoteFor(source, provided?.sourceNote),
      rationale: provided?.rationale ?? fallbackRationale(field, confidence, response),
    };
  }
  return output;
}

function hasPayloadValue(payload: AutofillPayload, field: AutofillPayloadField) {
  const value = payload[field];
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

function toPayload(response: GeminiTitleResponse): AutofillPayload {
  if (!response.title) {
    throw new GeminiTitleGeneratorError('Title not found.', 'not-found');
  }

  const originalTitle = response.original_title?.kr ?? response.original_title?.jp ?? response.original_title?.cn ?? undefined;

  const payload: AutofillPayload = {
    englishTitle: response.title,
    originalTitle,
    alternativeTitles: response.alternative_titles,
    origin: response.format === 'unknown' ? undefined : response.format,
    seriesStatus: response.status === 'unknown' ? undefined : response.status,
    readingStatus: response.status === 'completed' ? 'completed' : undefined,
    author: response.authors.join(', '),
    artist: response.artists.join(', '),
    releaseDate: response.release_date ?? undefined,
    completedDate: response.completed_date ?? undefined,
    synopsis: response.synopsis ?? undefined,
    vibeCheck: response.vibes.join(', '),
    genres: response.genres,
    moods: response.moods,
  };
  const populatedFields = PAYLOAD_FIELDS.filter((field) => hasPayloadValue(payload, field));
  payload.fieldIntelligence = mergeIntelligence(response, populatedFields);
  return payload;
}

export async function generateTitleAutofill(title: string): Promise<{ raw: GeminiTitleResponse; payload: AutofillPayload }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    throw new GeminiTitleGeneratorError('Gemini is not configured. Set GEMINI_API_KEY and GEMINI_MODEL.', 'missing-config');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: buildPrompt(title),
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new GeminiTitleGeneratorError('Gemini returned an empty response.', 'invalid-response');
    const raw = normalizeResponse(parseJson(text));
    return { raw, payload: toPayload(raw) };
  } catch (error) {
    if (error instanceof GeminiTitleGeneratorError) throw error;
    const message = error instanceof Error ? error.message : 'Gemini request failed.';
    if (/rate|quota|429/i.test(message)) throw new GeminiTitleGeneratorError('Rate limit exceeded. Try again later.', 'rate-limit');
    if (/fetch|network|timeout/i.test(message)) throw new GeminiTitleGeneratorError('Network error while contacting Gemini.', 'network');
    if (/json|parse/i.test(message)) throw new GeminiTitleGeneratorError('Gemini returned invalid JSON.', 'invalid-response');
    throw new GeminiTitleGeneratorError('Gemini is unavailable right now.', 'unavailable');
  }
}
