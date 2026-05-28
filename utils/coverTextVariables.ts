export type CoverTextElementLike = {
  type?: string;
  text?: string;
};

export type CoverTextVariables = Record<string, string>;

export function buildCoverTextVariables(params: {
  name?: string;
  dadName?: string;
}): CoverTextVariables {
  const fullName = String(params.name ?? '').trim();
  const dadName = String(params.dadName ?? '').trim();
  return {
    name: fullName,
    full_name: fullName,
    recipient_name: fullName,
    dad_name: dadName,
  };
}

export function resolveCoverElementText(
  element: CoverTextElementLike,
  variables: CoverTextVariables,
): string {
  const template = String(element.text ?? '');
  if (template.includes('{')) {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => variables[key] ?? '');
  }

  const type = String(element.type ?? '').toLowerCase();
  const name = variables.name || variables.full_name || '';

  if (type === 'dynamic_possessive') {
    return name.endsWith('s') ? `${name}'` : `${name}'s`;
  }

  if (type === 'dynamic' || type === 'static') {
    return name;
  }

  return template;
}

export function isDrawableCoverTextElement(element: CoverTextElementLike | null | undefined): boolean {
  if (!element) return false;
  const type = String(element.type ?? '').toLowerCase();
  return type === 'dynamic' || type === 'dynamic_possessive' || type === 'static';
}

export function canDrawCoverTexts(
  texts: CoverTextElementLike[] | null | undefined,
  variables: CoverTextVariables,
): boolean {
  if (!Array.isArray(texts) || texts.length === 0) return false;
  return texts.some((t) => isDrawableCoverTextElement(t) && resolveCoverElementText(t, variables).trim().length > 0);
}

export function getCoverTextCacheKey(variables: CoverTextVariables): string {
  return Object.entries(variables)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|');
}
