const FALLBACK_COVER = '/character-placeholder.png'

// 复用圣诞活动页里的封面图（同一套 bundle 里展示用）
const CHRISTMAS_BUNDLE_COVERS: Record<string, string> = {
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

export function getChristmasBundleCover(spuCode?: string | null) {
  if (!spuCode) return FALLBACK_COVER
  const key = normalizeSpu(spuCode)
  return CHRISTMAS_BUNDLE_COVERS[key] || FALLBACK_COVER
}


