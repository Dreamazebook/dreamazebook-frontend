import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

const TITLE = 'Personalized Books for Kids';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: TITLE,
  description:
    'Explore personalized books for kids made with real photos, names, and story details. Choose a bedtime, birthday, family, or keepsake gift.',
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    'children\'s books',
    TITLE,
    'custom storybooks',
    'birthday books',
    'personalized gifts',
    'picture books',
  ],
  openGraph: {
    ...sharedMetadata.openGraph,
    title: TITLE,
    description:
      'Choose a personalized storybook made with your child’s real photo — from bedtime books to birthday keepsakes and family gifts.',
    url: 'https://dreamazebook.com/books',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/books',
  },
};

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
