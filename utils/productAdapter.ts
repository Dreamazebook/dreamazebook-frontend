// Normalization adapter for product detail API → frontend schema

export type UiOption = {
  value: string;
  label: string;
  priceDiff?: number;
  isDefault?: boolean;
};

export type UiField =
  | {
      kind: 'select' | 'radio';
      name: string;
      label: string;
      required: boolean;
      options: UiOption[];
      defaultValue?: string;
      affects: { price?: boolean; sku?: boolean; production?: boolean };
    }
  | {
      kind: 'text';
      name: string;
      label: string;
      required: boolean;
      defaultValue?: string;
      validation?: { minLength?: number; maxLength?: number };
    }
  | {
      kind: 'textarea';
      name: string;
      label: string;
      required: boolean;
      validation?: { maxLength?: number };
    }
  | {
      kind: 'file';
      name: string;
      label: string;
      required: boolean;
      validation: {
        maxFiles: number;
        maxFileSize?: number;
        allowedTypes: string[];
        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
      };
    };

export type ProductSchema = {
  productName: string;
  basePrice: number;
  commerceFields: UiField[];
  personalizationFields: UiField[];
  supportsDedication: boolean;
  hasFaceSwap: boolean;
  maxFaceImages: number;
  pagesPreview: Array<{ code: string; name: string; image: string }>;
};

function toNumber(n: any, fallback = 0): number {
  const num = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(num) ? num : fallback;
}

function getSkuKeys(api: any): Set<string> {
  const set = new Set<string>();
  const skus: any[] = api?.data?.available_skus || api?.available_skus || [];
  for (const s of skus) {
    Object.keys(s?.attributes || {}).forEach((k) => set.add(k));
  }
  return set;
}

function normalizeHairColorSpelling(value: string): string {
  const v = (value || '').toLowerCase();
  if (v === 'blone') return 'blonde';
  return value;
}

function reconcileGiftboxOptions(api: any, fields: any[]): any[] {
  const skus: any[] = api?.data?.available_skus || [];
  const skuValues = new Set<string>();
  for (const s of skus) {
    const val = s?.attributes?.giftbox;
    if (val) skuValues.add(val);
  }
  return fields.map((f) => {
    if (f?.name !== 'giftbox' || !Array.isArray(f?.options)) return f;
    const existing = new Set(f.options.map((o: any) => o.value));
    const merged = [...f.options];
    for (const v of skuValues) {
      if (!existing.has(v)) {
        merged.push({ value: v, label: v.replace(/_/g, ' '), price_diff: 0, is_default: false });
      }
    }
    return { ...f, options: merged };
  });
}

function normalizeImages(images: any): { main?: string; gallery: string[] } {
  if (!images) return { gallery: [] };
  if (Array.isArray(images)) {
    const flat = images.flatMap((i) => (Array.isArray(i) ? i : [i])).filter(Boolean);
    const [main, ...rest] = flat;
    return { main, gallery: rest };
  }
  if (typeof images === 'object') {
    const main = images.main || images[0];
    const gallery: string[] = Array.isArray(images.gallery) ? images.gallery : [];
    return { main, gallery };
  }
  return { gallery: [] };
}

export function buildProductSchema(api: any): ProductSchema {
  const data = api?.data || api || {};
  const skuKeys = getSkuKeys(api);

  // Source of truth for form structure
  const rawFields: any[] = Array.isArray(data.attributes) ? [...data.attributes] : [];

  // Fix common inconsistencies
  const fixedFields = reconcileGiftboxOptions(api, rawFields).map((a) => {
    if (a?.name === 'hair_color' && Array.isArray(a?.options)) {
      return {
        ...a,
        options: a.options.map((o: any) => ({ ...o, value: normalizeHairColorSpelling(o.value) })),
        default: normalizeHairColorSpelling(a.default),
      };
    }
    return a;
  });

  const sorted = fixedFields.sort((a: any, b: any) => (toNumber(a?.sort_order) - toNumber(b?.sort_order)));

  const fields: UiField[] = sorted.map((a: any): UiField => {
    if (a?.type === 'radio' || a?.type === 'select') {
      return {
        kind: a.type,
        name: a.name,
        label: a.label,
        required: !!a.required,
        options: (a.options || []).map((o: any) => ({
          value: String(o.value),
          label: o.label ?? String(o.value),
          priceDiff: toNumber(o.price_diff, 0),
          isDefault: !!o.is_default,
        })),
        defaultValue: a.default ? String(a.default) : undefined,
        affects: {
          price: !!a.affects_price,
          sku: skuKeys.has(a.name),
          production: !!a.affects_production,
        },
      } as UiField;
    }

    if (a?.type === 'text') {
      return {
        kind: 'text',
        name: a.name,
        label: a.label,
        required: !!a.required,
        defaultValue: a.default ?? undefined,
        validation: {
          minLength: a?.validation?.min_length,
          maxLength: a?.validation?.max_length,
        },
      } as UiField;
    }

    if (a?.type === 'textarea') {
      return {
        kind: 'textarea',
        name: a.name,
        label: a.label,
        required: !!a.required,
        validation: { maxLength: a?.validation?.max_length },
      } as UiField;
    }

    if (a?.type === 'file_upload') {
      const cfg = data?.customization_config || {};
      return {
        kind: 'file',
        name: a.name,
        label: a.label,
        required: !!a.required,
        validation: {
          maxFiles: a?.validation?.max_files ?? cfg?.max_face_images ?? 1,
          maxFileSize: a?.validation?.max_file_size,
          allowedTypes: a?.validation?.allowed_types ?? [],
          minWidth: a?.validation?.min_width,
          minHeight: a?.validation?.min_height,
          maxWidth: a?.validation?.max_width,
          maxHeight: a?.validation?.max_height,
        },
      } as UiField;
    }

    return {
      kind: 'text',
      name: a?.name || 'unknown',
      label: a?.label || 'Unknown',
      required: !!a?.required,
    } as UiField;
  });

  const commerceFields = fields.filter((f: any) => f?.affects?.sku);
  const personalizationFields = fields.filter((f: any) => !f?.affects?.sku);

  const pagesPreview = (data?.pages || [])
    .filter((p: any) => p?.is_preview_page)
    .sort((a: any, b: any) => toNumber(a?.preview_order) - toNumber(b?.preview_order))
    .map((p: any) => ({ code: p?.page_code, name: p?.name, image: p?.preview_image }));

  return {
    productName: data?.name || '',
    basePrice: toNumber(data?.base_price, 0),
    commerceFields,
    personalizationFields,
    supportsDedication: !!data?.customization_config?.supports_dedication,
    hasFaceSwap: !!data?.customization_config?.has_face_swap,
    maxFaceImages: data?.customization_config?.max_face_images ?? 1,
    pagesPreview,
  };
}

export function resolveSkuPrice(api: any, selections: Record<string, string>): { sku?: string; price: number } {
  const data = api?.data || api || {};
  const skus: any[] = data?.available_skus || [];
  const defaultSku = data?.default_sku;

  const commerceKeys = new Set<string>();
  skus.forEach((s) => Object.keys(s?.attributes || {}).forEach((k) => commerceKeys.add(k)));

  const pickEntries = Object.entries(selections || {}).filter(([k]) => commerceKeys.has(k));
  const hit = skus.find((s) => pickEntries.every(([k, v]) => s?.attributes?.[k] === v));

  return {
    sku: hit?.sku_code || defaultSku?.sku_code,
    price: toNumber(hit?.current_price, toNumber(defaultSku?.current_price, toNumber(data?.base_price))),
  };
}

export function extractFieldOptions(schema: ProductSchema, fieldName: string): string[] {
  const all = [...schema.commerceFields, ...schema.personalizationFields];
  const f = all.find((x: any) => x?.name === fieldName && (x?.kind === 'radio' || x?.kind === 'select')) as any;
  return f?.options?.map((o: UiOption) => o.value) || [];
}


