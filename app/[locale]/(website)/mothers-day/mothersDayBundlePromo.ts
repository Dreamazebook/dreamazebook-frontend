import type { BundlePromotionBlockProps } from '../christmas/BundlePromotionBlock'

const R2_MOTHERS_DAY =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day'

export const MOTHERS_DAY_BUNDLE_PROMO: Pick<
  BundlePromotionBlockProps,
  | 'introTitle'
  | 'introSubtitle'
  | 'faqTitle'
  | 'faqs'
  | 'bundleGroupTabLabels'
  | 'bundleSectionTextureUrl'
> = {
  bundleSectionTextureUrl: `${R2_MOTHERS_DAY}/${encodeURIComponent('底纹.png')}`,
  bundleGroupTabLabels: {
    trio: 'Growing Together Set',
    four: 'Family Keepsake Set',
    classics: 'Growing Up Collection',
  },
  introTitle: "Gift More Love This Mother's Day",
  introSubtitle: 'Choose any stories you love, bundle joy for the whole family.',
  faqTitle: "Mother's Day Package FAQ",
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
      q: 'Will my package arrive in time for Mother’s Day?',
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
      a: 'No—packages already include multi-book discounts plus exclusive seasonal extras, making them the best-value option.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes, we deliver worldwide. Shipping costs are calculated at checkout.',
    },
  ],
}
