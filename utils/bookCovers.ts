const FALLBACK_COVER = '/character-placeholder.png'

// 复用圣诞活动页里的封面图（购物车/Bundle 统一使用同一套 R2 封面风格）
const R2_BOOK_COVERS: Record<string, string> = {
  PICBOOK_SANTA:
    'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/bundles/BUNDLE_CHRISTMAS/PICBOOK_SANTA.png',
  PICBOOK_GOODNIGHT:
    'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/bundles/BUNDLE_CHRISTMAS/PICBOOK_GOODNIGHT.png',
  PICBOOK_BRAVEY:
    'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/bundles/BUNDLE_CHRISTMAS/PICBOOK_BRAVEY.png',
  PICBOOK_BIRTHDAY:
    'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/bundles/BUNDLE_CHRISTMAS/PICBOOK_BIRTHDAY.png',
  PICBOOK_MELODY:
    'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/bundles/BUNDLE_CHRISTMAS/PICBOOK_MELODY.png',
}

const normalizeSpu = (spu: string) => (spu === 'PICBOOK_GOODNIGHT3' ? 'PICBOOK_GOODNIGHT' : spu)

export function getR2BookCover(spuCode?: string | null, fallbackUrl?: string | null) {
  if (!spuCode) return fallbackUrl || FALLBACK_COVER
  const key = normalizeSpu(spuCode)
  return R2_BOOK_COVERS[key] || fallbackUrl || FALLBACK_COVER
}

// Backward-compatible name: cart christmas bundle 曾经专用
export function getChristmasBundleCover(spuCode?: string | null) {
  return getR2BookCover(spuCode)
}


