/**
 * SEO Metadata utilities and helpers
 */

export interface SEOPageConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  locale?: string;
}

/**
 * Generate meta tags for Open Graph
 */
export const generateOGMetaTags = (config: SEOPageConfig) => {
  return {
    'og:type': 'website',
    'og:title': config.title,
    'og:description': config.description,
    'og:image': config.ogImage || 'https://dreamazebook.com/landing-page/cover.png',
    'og:url': config.canonicalUrl || 'https://dreamazebook.com',
    'og:locale': config.locale || 'en_US',
  };
};

/**
 * Generate meta tags for Twitter
 */
export const generateTwitterMetaTags = (config: SEOPageConfig) => {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': config.ogImage || 'https://dreamazebook.com/landing-page/cover.png',
    'twitter:creator': '@dreamazebook',
    'twitter:site': '@dreamazebook',
  };
};

/**
 * Generate canonical URL
 */
export const generateCanonicalUrl = (path: string, locale?: string) => {
  const basePath = locale && locale !== 'en' ? `/${locale}` : '';
  return `https://dreamazebook.com${basePath}${path}`;
};

/**
 * Page-specific SEO configurations
 */
export const seoConfigs: Record<string, SEOPageConfig> = {
  home: {
    title: 'Personalized Children\'s Books | Create Custom Stories | Dreamaze',
    description:
      'Create unique, personalized children\'s books where your loved ones become the heroes of their own magical stories. Handcrafted, high-quality custom books for every occasion.',
    keywords: [
      'personalized children\'s books',
      'custom children\'s books',
      'personalized gifts for kids',
      'custom storybooks',
    ],
    canonicalUrl: 'https://dreamazebook.com',
  },
  books: {
    title: 'Our Personalized Children\'s Books | Dreamaze',
    description:
      'Explore Dreamaze\'s collection of personalized children\'s books. Each story features your child as the hero in magical, illustrated adventures.',
    keywords: ['children\'s books', 'personalized books for kids', 'custom storybooks'],
    canonicalUrl: 'https://dreamazebook.com/books',
  },
  personalize: {
    title: 'Personalize Your Book | Create Custom Children\'s Story | Dreamaze',
    description:
      'Create your personalized children\'s book. Choose characters, add photos, customize names, and bring your child\'s unique story to life.',
    keywords: [
      'personalize book',
      'custom book creator',
      'create storybook',
      'personalized photo book',
    ],
    canonicalUrl: 'https://dreamazebook.com/personalize',
  },
  aboutUs: {
    title: 'About Dreamaze | Our Mission & Story',
    description:
      'Learn about Dreamaze and our mission to create magical, personalized children\'s books that make every child feel like the hero of their own story.',
    keywords: ['about dreamaze', 'personalized books', 'children\'s book company'],
    canonicalUrl: 'https://dreamazebook.com/about-us',
  },
  faq: {
    title: 'FAQ | Frequently Asked Questions | Dreamaze',
    description:
      'Find answers to common questions about Dreamaze personalized children\'s books, customization options, shipping, and more.',
    keywords: ['FAQ', 'help', 'personalized books', 'dreamaze support'],
    canonicalUrl: 'https://dreamazebook.com/faq',
  },
  contact: {
    title: 'Contact Us | Dreamaze Support',
    description:
      'Get in touch with our Dreamaze team. We\'re here to answer your questions and help you create the perfect personalized children\'s book.',
    keywords: ['contact', 'support', 'customer service'],
    canonicalUrl: 'https://dreamazebook.com/contact-us',
  },
  delivery: {
    title: 'Delivery Information | Shipping & Tracking',
    description:
      'Learn about Dreamaze shipping options, delivery times, and tracking. We offer fast, reliable delivery worldwide.',
    keywords: ['shipping', 'delivery', 'order tracking', 'delivery time'],
    canonicalUrl: 'https://dreamazebook.com/delivery-information',
  },
  terms: {
    title: 'Terms and Conditions | Dreamaze',
    description:
      'Read the terms and conditions for using Dreamaze personalized children\'s books website and services.',
    canonicalUrl: 'https://dreamazebook.com/terms-and-conditions',
  },
  privacy: {
    title: 'Privacy Policy | Dreamaze',
    description:
      'Read Dreamaze privacy policy to understand how we collect, use, and protect your personal information.',
    canonicalUrl: 'https://dreamazebook.com/privacy-policy',
  },
  returnPolicy: {
    title: 'Return Policy | Dreamaze',
    description:
      'Learn about Dreamaze return policy and how to return your personalized children\'s book if you\'re not satisfied.',
    canonicalUrl: 'https://dreamazebook.com/return-policy',
  },
};

/**
 * SEO content recommendations
 */
export const seoRecommendations = {
  titleLength: { min: 30, max: 60 },
  descriptionLength: { min: 120, max: 160 },
  h1Count: 1,
  minReadabilityScore: 60,
};
