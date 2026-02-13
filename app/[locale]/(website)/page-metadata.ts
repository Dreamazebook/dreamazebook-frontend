/**
 * Home Page Server Component for SEO Metadata
 */
import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/utils/structuredData';

export const generateMetadata = (): Metadata => {
  return {
    ...sharedMetadata,
    title: 'Personalized Children\'s Books | Create Custom Stories | Dreamaze',
    description:
      'Create unique, personalized children\'s books where your loved ones become the heroes of their own magical stories. Handcrafted, high-quality custom books for every occasion.',
    openGraph: {
      ...sharedMetadata.openGraph,
      type: 'website',
      title: 'Dreamaze - Personalized Children\'s Books',
      description:
        'Create unique, personalized children\'s books where your loved ones become the heroes of their own magical stories.',
      url: 'https://dreamazebook.com',
    },
    alternates: {
      canonical: 'https://dreamazebook.com',
    },
  };
};

export const metadata = generateMetadata();

export default function HomeMetadata() {
  return null;
}
