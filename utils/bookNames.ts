const normalizeSpu = (spu: string) => (spu === 'PICBOOK_GOODNIGHT3' ? 'PICBOOK_GOODNIGHT' : spu)

// Our Books 页面展示用的标准书名（用于购物车映射）
const OUR_BOOK_NAMES_BY_SPU: Record<string, string> = {
  PICBOOK_GOODNIGHT: 'Good Night to You',
  PICBOOK_MOM: 'The Way I See You, Mama',
  PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
  PICBOOK_BIRTHDAY: 'Birthday Book for You',
  PICBOOK_SANTA: "Santa's Letter for You",
  PICBOOK_MELODY: 'Your Melody',
}

export function getOurBookDisplayName(spuCode?: string | null, fallback?: string | null) {
  const code = typeof spuCode === 'string' && spuCode.length > 0 ? normalizeSpu(spuCode) : null
  if (!code) return fallback || null
  return OUR_BOOK_NAMES_BY_SPU[code] || fallback || null
}

export function formatCartBookTitle(params: {
  spuCode?: string | null
  bookName?: string | null
  fullName?: string | null
  skuName?: string | null
  productName?: string | null
}) {
  const base =
    getOurBookDisplayName(params.spuCode, params.bookName || params.skuName || params.productName || params.spuCode || null) ||
    params.bookName ||
    params.skuName ||
    params.productName ||
    params.spuCode ||
    'Book'

  const fullName = params.fullName || ''
  if (!fullName) return base
  // 避免重复拼接（部分后端可能已经返回了带名字后缀的 book_name / product_name）
  if (base.includes(fullName)) return base
  // 购物车展示风格：用 "|" 作为分隔符（与现有非 bundle 卡片一致）
  return `${base} | ${fullName}`
}

export function getFormattedCartItemTitle(item: any): string {
  const spuCode = item?.spu_code
  const baseBookName =
    getOurBookDisplayName(spuCode, item.product_name || item.book_name || item.sku_name || spuCode || 'Book') || 'Book'
  const fullName = item.full_name || item.recipient_name || ''
  return fullName && !String(baseBookName).includes(String(fullName))
    ? `${baseBookName} | ${fullName}`
    : baseBookName
}


