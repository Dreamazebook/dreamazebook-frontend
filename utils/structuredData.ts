/**
 * Structured Data (JSON-LD) utilities for SEO
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ReviewItem {
  author: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface AggregateRating {
  count: number;
  ratingValue: number;
}

/**
 * Generate Organization schema
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dreamaze',
  url: 'https://dreamazebook.com',
  logo: 'https://dreamazebook.com/logo.png',
  description:
    'Personalized children\'s books where your loved ones become the heroes of their own magical stories.',
  sameAs: [
    'https://www.facebook.com/dreamazebook',
    'https://www.instagram.com/dreamazebook',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'hello@dreamazebook.com',
  },
});

/**
 * Generate Website schema
 */
export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: 'https://dreamazebook.com',
  name: 'Dreamaze',
  description:
    'Personalized children\'s books where your loved ones become the heroes of their own magical stories.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://dreamazebook.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Generate Breadcrumb schema
 */
export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * Generate Product schema
 */
export const generateProductSchema = (product: {
  name: string;
  description: string;
  image?: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image || 'https://dreamazebook.com/placeholder.png',
  url: product.url,
  ...(product.price && {
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: product.url,
    },
  }),
  ...(product.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0,
    },
  }),
});

/**
 * Generate Review schema
 */
export const generateReviewSchema = (product: {
  name: string;
  image?: string;
  url: string;
  reviews: ReviewItem[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.image || 'https://dreamazebook.com/placeholder.png',
  url: product.url,
  review: product.reviews.map((review) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.comment,
    datePublished: review.date,
  })),
});

/**
 * Generate LocalBusiness schema
 */
export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Dreamaze',
  description:
    'Personalized children\'s books where your loved ones become the heroes of their own magical stories.',
  url: 'https://dreamazebook.com',
  image: 'https://dreamazebook.com/landing-page/cover.png',
  creator: {
    '@type': 'Organization',
    name: 'Dreamaze',
  },
});

/**
 * Generate FAQPage schema
 */
export const generateFAQPageSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Generate Article schema
 */
export const generateArticleSchema = (article: {
  headline: string;
  description: string;
  image?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.headline,
  description: article.description,
  image: article.image || 'https://dreamazebook.com/placeholder.png',
  author: {
    '@type': 'Organization',
    name: article.author,
  },
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  url: article.url,
  mainEntity: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

/**
 * Generate combined schema with multiple types
 */
export const generateCombinedSchema = (schemas: any[]) => ({
  '@context': 'https://schema.org',
  '@graph': schemas,
});
