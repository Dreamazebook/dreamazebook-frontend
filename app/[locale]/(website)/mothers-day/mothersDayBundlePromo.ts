import type {
  Bundle,
  BundleGroup,
  BundlePromotionBlockProps,
} from '../christmas/BundlePromotionBlock'

const R2_MOTHERS_DAY =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day'

const R2_CHRISTMAS_BUNDLE_ASSETS = 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/christmas'

// 与圣诞页同源的套餐图，按册数择近使用（母亲节专用主图可后续换 R2）
const MD_IMG = {
  threeClassic: `${R2_CHRISTMAS_BUNDLE_ASSETS}/bundle-storytime-classic.png`,
  threePremium: `${R2_CHRISTMAS_BUNDLE_ASSETS}/bundle-storytime-premium.png`,
  fourClassic: `${R2_CHRISTMAS_BUNDLE_ASSETS}/bundle-celebration-classic.png`,
  fourPremium: `${R2_CHRISTMAS_BUNDLE_ASSETS}/bundle-celebration-premium.png`,
  fiveClassic: `${R2_CHRISTMAS_BUNDLE_ASSETS}/bundle-celebration-classic.png`,
  fivePremium: `${R2_CHRISTMAS_BUNDLE_ASSETS}/bundle-celebration-premium.png`,
} as const

const mdBundle1Classic: Bundle = {
  id: 'trio-classic',
  title: 'Classic Hardcover Set',
  qtyLabel: 'x3',
  features: [
    '3 Hardcover Books',
    '3 Hand-drawn Sticker Sets',
    "3 Collector's Edition Bookmarks",
  ],
  originalPrice: 177.0,
  price: 141.6,
  ctaHref: '#',
  imageUrl: MD_IMG.threeClassic,
  bookCount: 3,
}

const mdBundle1Premium: Bundle = {
  id: 'trio-premium',
  title: 'Premium Lay-flat Set',
  qtyLabel: 'x3',
  features: [
    '3 Premium Lay-Flat Hardcover Books',
    '3 Hand-drawn Sticker Sets',
    "3 Collector's Edition Bookmarks",
    '1 Premium Gift Box',
  ],
  originalPrice: 237.0,
  price: 189.6,
  ctaHref: '#',
  imageUrl: MD_IMG.threePremium,
  bookCount: 3,
}

const mdBundle2Classic: Bundle = {
  id: 'four-classic',
  title: 'Classic Hardcover Set',
  qtyLabel: 'x4',
  features: [
    '4 Hardcover Books',
    '4 Personalized Book Covers (Free)',
    '4 Hand-drawn Sticker Sets',
    "4 Collector's Edition Bookmarks",
    '1 Premium Gift Box',
  ],
  originalPrice: 236.0,
  price: 188.8,
  ctaHref: '#',
  imageUrl: MD_IMG.fourClassic,
  bookCount: 4,
}

const mdBundle2Premium: Bundle = {
  id: 'four-premium',
  title: 'Premium Lay-flat Set',
  qtyLabel: 'x4',
  features: [
    '4 Premium Lay-Flat Hardcover Books',
    '4 Personalized Book Covers (Free)',
    '4 Hand-drawn Sticker Sets',
    "4 Collector's Edition Bookmarks",
    '2 Premium Gift Boxes',
  ],
  originalPrice: 316.0,
  price: 252.8,
  ctaHref: '#',
  imageUrl: MD_IMG.fourPremium,
  bookCount: 4,
}

const mdBundle3Classic: Bundle = {
  id: 'christmas-classic',
  title: 'Classic Hardcover Set',
  qtyLabel: 'x5',
  features: [
    '5 Hardcover Books',
    '5 Personalized Book Covers (Free)',
    '5 Hand-drawn Sticker Sets',
    "5 Collector's Edition Bookmarks",
    '2 Premium Gift Boxes',
  ],
  originalPrice: 295.0,
  price: 236.0,
  ctaHref: '#',
  imageUrl: MD_IMG.fiveClassic,
  bookCount: 5,
}

const mdBundle3Premium: Bundle = {
  id: 'christmas-premium',
  title: 'Premium Lay-flat Set',
  qtyLabel: 'x5',
  features: [
    '5 Premium Lay-Flat Hardcover Books',
    '5 Personalized Book Covers (Free)',
    '5 Hand-drawn Sticker Sets',
    "5 Collector's Edition Bookmarks",
    '3 Premium Gift Boxes',
  ],
  originalPrice: 395.0,
  price: 316.0,
  ctaHref: '#',
  imageUrl: MD_IMG.fivePremium,
  bookCount: 5,
}

const MOTHERS_DAY_BUNDLE_GROUPS: BundleGroup[] = [
  { id: 'trio', label: 'Growing Together Set', bundles: [mdBundle1Classic, mdBundle1Premium] },
  { id: 'four', label: 'Family Keepsake Set', bundles: [mdBundle2Classic, mdBundle2Premium] },
  { id: 'classics', label: 'Growing Up Collection', bundles: [mdBundle3Classic, mdBundle3Premium] },
]

/**
 * 与圣诞默认相同的 package_id 槽位，便于接现有加购接口；若后端有独立母亲节套餐，请只改此映射与后台对齐。
 */
const MOTHERS_DAY_PACKAGE_IDS: Record<string, number> = {
  'trio-classic': 1,
  'trio-premium': 2,
  'four-classic': 3,
  'four-premium': 4,
  'christmas-classic': 5,
  'christmas-premium': 6,
}

export const MOTHERS_DAY_BUNDLE_PROMO: Pick<
  BundlePromotionBlockProps,
  | 'introTitle'
  | 'introSubtitle'
  | 'faqTitle'
  | 'faqs'
  | 'bundleGroupTabLabels'
  | 'bundleSectionTextureUrl'
  | 'bundleOverrides'
  | 'openBundleBookSelection'
> = {
  bundleSectionTextureUrl: `${R2_MOTHERS_DAY}/${encodeURIComponent('底纹.png')}`,
  bundleGroupTabLabels: {
    trio: 'Growing Together Set',
    four: 'Family Keepsake Set',
    classics: 'Growing Up Collection',
  },
  introTitle: "More Stories, More Memories",
  introSubtitle: 'Choose any stories you love, bundle joy for the whole family.',
  faqTitle: "Gift Bundle FAQ",
  faqs: [
    {
      q: 'Can I choose which stories go into my package?',
      a: 'Yes! You can freely choose from any of our 5 stories to create your bundle.',
    },
    {
      q: 'What’s the difference between Classic (Hardcover) and Premium (Lay-flat) editions?',
      a: 'Classic hardcover is durable and perfect for everyday reading. Premium lay-flat has an elegant butterfly binding that opens fully flat—an ideal keepsake for years to come.',
    },
    {
      q: 'When will my package arrive?',
      a: 'Each book is made within 48 hours, and delivery usually takes 5–14 business days depending on your location. You can also check shipping times by country at checkout.',
    },
    {
      q: 'Can I personalize each book differently?',
      a: 'Absolutely—each book can feature a different child’s name, photo, and details. Perfect for siblings, cousins, or friends.',
    },
    {
      q: 'What age are these books suitable for?',
      a: 'Each story has a recommended age range—you can find the details on the product page to choose the best fit for your child.',
    },
    {
      q: 'Can I ship one package to multiple addresses?',
      a: 'Not at the moment—each package can only be shipped to one address. If you’d like to send to multiple families, we recommend placing separate orders.',
    },
    {
      q: 'Can I combine packages with other promotions?',
      a: 'No—packages already include multi-book discounts plus exclusive Christmas extras, making them the best-value option this season.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes, we deliver worldwide. Shipping costs are calculated at checkout.',
    },
  ],
  bundleOverrides: {
    groups: MOTHERS_DAY_BUNDLE_GROUPS,
    packageIdByBundleId: MOTHERS_DAY_PACKAGE_IDS,
  },
  openBundleBookSelection: true,
}
