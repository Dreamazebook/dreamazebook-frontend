import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Our Personalized Children\'s Books | Dreamaze',
  description:
    'Explore Dreamaze\'s collection of personalized children\'s books. Each story features your child as the hero in magical, illustrated adventures designed for every special occasion.',
  keywords: [
    'children\'s books',
    'personalized books for kids',
    'custom storybooks',
    'birthday books',
    'personalized gifts',
    'picture books',
  ],
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Our Personalized Children\'s Books | Dreamaze',
    description:
      'Explore Dreamaze\'s collection of personalized children\'s books. Each story features your child as the hero in magical, illustrated adventures.',
    url: 'https://dreamazebook.com/books',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/books',
  },
};

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
