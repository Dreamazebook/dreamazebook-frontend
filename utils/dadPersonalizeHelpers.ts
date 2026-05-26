export type DadQuestionConfig = {
  question: string;
  max_length: number;
  attribute_name: string;
  example_answer?: string;
};

export const DEFAULT_DAD_QUESTIONS_PREVIEW: DadQuestionConfig[] = [
  {
    question: 'What shopping rule do you and Dad follow?',
    max_length: 60,
    attribute_name: 'dad_question_1',
    example_answer: 'We pick one treat together and help carry the bags.',
  },
  {
    question: 'What does Dad teach you when you practice?',
    max_length: 25,
    attribute_name: 'dad_question_2',
    example_answer: 'He teaches patience.',
  },
  {
    question: "What makes Dad's builds so cool?",
    max_length: 80,
    attribute_name: 'dad_question_3',
    example_answer: 'He adds tiny details and lets me help with the best parts.',
  },
];

export function parseDadQuestionsFromProduct(product: unknown): DadQuestionConfig[] {
  const p = product as { customization_config?: { dad_questions?: unknown[] } } | null | undefined;
  const raw = p?.customization_config?.dad_questions;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((q): q is Record<string, unknown> => !!q && typeof q === 'object')
    .map(q => ({
      question: String(q.question ?? '').trim(),
      max_length: Math.max(1, Number(q.max_length) || 60),
      attribute_name: String(q.attribute_name ?? '').trim(),
      example_answer: q.example_answer ? String(q.example_answer).trim() : undefined,
    }))
    .filter(q => q.question && q.attribute_name);
}

export function buildDadQuestionAttributes(
  answers: Record<string, string> | undefined,
  questions: DadQuestionConfig[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const q of questions) {
    const value = String(answers?.[q.attribute_name] ?? '').trim();
    if (value) out[q.attribute_name] = value;
  }
  return out;
}

/** PICBOOK_DAD preview/render attributes（与后端 `dad_name` / `dad_question_*` 对齐） */
export function buildPicbookDadRenderAttributes(
  attrs: Record<string, unknown> | undefined | null,
): Record<string, string> {
  const a = attrs || {};
  const out: Record<string, string> = {};

  const dadName = String(a.dad_name ?? a.dad_title ?? '').trim();
  if (dadName) out.dad_name = dadName;

  const dadSkinTone = String(a.dad_skin_tone ?? '').trim();
  if (dadSkinTone) out.dad_skin_tone = dadSkinTone;

  for (const key of ['dad_question_1', 'dad_question_2', 'dad_question_3'] as const) {
    const value = String(a[key] ?? '').trim();
    if (value) out[key] = value;
  }

  return out;
}
