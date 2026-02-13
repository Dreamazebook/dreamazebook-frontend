import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'About Us | Dreamaze - Handcrafted Personalized Children\'s Books',
  description:
    'Learn about Dreamaze and our mission to create magical, personalized children\'s books that make every child feel like the hero of their own story.',
  keywords: ['about dreamaze', 'personalized books', 'children\'s book company', 'custom stories'],
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'About Us | Dreamaze',
    description:
      'Learn about Dreamaze and our mission to create magical, personalized children\'s books.',
    url: 'https://dreamazebook.com/about-us',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/about-us',
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
