/**
 * JSON-LD Structured Data Components
 * These components render JSON-LD schema markup for SEO
 */

import { generateOrganizationSchema, generateWebsiteSchema } from '@/utils/structuredData';

/**
 * Organization Schema Component
 * Renders schema for the Dreamaze organization
 */
export const OrganizationSchema = () => {
  const schema = generateOrganizationSchema();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
    />
  );
};

/**
 * Website Schema Component
 * Renders schema for the Dreamaze website
 */
export const WebsiteSchema = () => {
  const schema = generateWebsiteSchema();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
    />
  );
};

/**
 * Product Schema for Book Detail Page
 */
export const ProductSchema = ({ book }: { book: any }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: book.name || book.title || 'Personalized Children\'s Book',
    description:
      book.description ||
      'A personalized children\'s book where your child becomes the hero of their own magical story.',
    image:
      book.image || book.imageCover || 'https://dreamazebook.com/landing-page/cover.png',
    brand: {
      '@type': 'Brand',
      name: 'Dreamaze',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: book.price || '29.99',
      availability: 'https://schema.org/InStock',
      url: `https://dreamazebook.com/books/${book.id || book.spu_code}`,
    },
    aggregateRating: book.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: book.rating,
          ratingCount: book.ratingCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
    />
  );
};

/**
 * Breadcrumb Schema Component
 */
export const BreadcrumbSchema = ({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
    />
  );
};

/**
 * FAQ Schema Component
 */
export const FAQSchema = ({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) => {
  const schema = {
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
    />
  );
};

export default OrganizationSchema;
