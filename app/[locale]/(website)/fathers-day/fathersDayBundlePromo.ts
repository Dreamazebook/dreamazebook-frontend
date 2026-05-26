import type {
  Bundle,
  BundleGroup,
  BundlePromotionBlockProps,
} from '../christmas/BundlePromotionBlock'
import { FATHERS_DAY_BUNDLE_PRODUCT_PRIORITY } from '../christmas/BundlePromotionBlock'
import { mobileAsset } from './fathersDayAssets'

const R2_FATHERS_DAY =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/fathers-day'

const FD_IMG = {
  threeClassic: `${R2_FATHERS_DAY}/set-3-classic-hardcover.webp`,
  threePremium: `${R2_FATHERS_DAY}/set-3-premium-layflat.webp`,
  fourClassic: `${R2_FATHERS_DAY}/set-4-classic-hardcover.webp`,
  fourPremium: `${R2_FATHERS_DAY}/set-4-premium-layflat.webp`,
  fiveClassic: `${R2_FATHERS_DAY}/set-5-classic-hardcover.webp`,
  fivePremium: `${R2_FATHERS_DAY}/set-5-premium-layflat.webp`,
} as const

const fdBundle1Classic: Bundle = {
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
  imageUrl: FD_IMG.threeClassic,
  bookCount: 3,
}

const fdBundle1Premium: Bundle = {
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
  imageUrl: FD_IMG.threePremium,
  bookCount: 3,
}

const fdBundle2Classic: Bundle = {
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
  imageUrl: FD_IMG.fourClassic,
  bookCount: 4,
}

const fdBundle2Premium: Bundle = {
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
  imageUrl: FD_IMG.fourPremium,
  bookCount: 4,
}

const fdBundle3Classic: Bundle = {
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
  imageUrl: FD_IMG.fiveClassic,
  bookCount: 5,
}

const fdBundle3Premium: Bundle = {
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
  imageUrl: FD_IMG.fivePremium,
  bookCount: 5,
}

const FATHERS_DAY_BUNDLE_GROUPS: BundleGroup[] = [
  { id: 'trio', label: 'Growing Together Set', bundles: [fdBundle1Classic, fdBundle1Premium] },
  { id: 'four', label: 'Family Keepsake Set', bundles: [fdBundle2Classic, fdBundle2Premium] },
  { id: 'classics', label: 'Growing Up Collection', bundles: [fdBundle3Classic, fdBundle3Premium] },
]

/**
 * 父亲节页面复用圣诞 bundle package_id 槽位，与后台 package 配置保持一致。
 */
const FATHERS_DAY_PACKAGE_IDS: Record<string, number> = {
  'trio-classic': 3, // CHRISTMAS_HARDCOVER_X3
  'trio-premium': 4, // CHRISTMAS_PREMIUM_LAYFLAT_X3
  'four-classic': 5, // CHRISTMAS_HARDCOVER_X4
  'four-premium': 6, // CHRISTMAS_PREMIUM_LAYFLAT_X4
  'christmas-classic': 17, // CHRISTMAS_HARDCOVER_X5
  'christmas-premium': 18, // CHRISTMAS_PREMIUM_LAYFLAT_X5
}

export const FATHERS_DAY_BUNDLE_PROMO: Pick<
  BundlePromotionBlockProps,
  | 'introTitle'
  | 'introSubtitle'
  | 'faqTitle'
  | 'faqs'
  | 'bundleGroupTabLabels'
  | 'bundleSectionTextureUrl'
  | 'bundleOverrides'
  | 'openBundleBookSelection'
  | 'bundleProductPriority'
> = {
  bundleSectionTextureUrl: mobileAsset('底纹.png'),
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
      a: 'No—packages already include multi-book discounts plus exclusive bundle extras, making them the best-value option this season.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes, we deliver worldwide. Shipping costs are calculated at checkout.',
    },
  ],
  bundleOverrides: {
    groups: FATHERS_DAY_BUNDLE_GROUPS,
    packageIdByBundleId: FATHERS_DAY_PACKAGE_IDS,
  },
  openBundleBookSelection: true,
  bundleProductPriority: FATHERS_DAY_BUNDLE_PRODUCT_PRIORITY,
}
