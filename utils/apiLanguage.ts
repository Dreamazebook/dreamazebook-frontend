/** 后端 /products 列表接口当前仅支持 en、zh */
const API_PRODUCT_LANGUAGES = new Set(['en', 'zh']);

/**
 * 将前端路由 locale 映射为后端 products 列表 API 可接受的 language 参数。
 * 例如 fr 等 UI 语言暂无对应商品数据时，回退到 en。
 */
export const toApiProductLanguage = (locale?: string | null): string => {
  const normalized = String(locale ?? '').trim().toLowerCase();
  if (API_PRODUCT_LANGUAGES.has(normalized)) return normalized;
  return 'en';
};
