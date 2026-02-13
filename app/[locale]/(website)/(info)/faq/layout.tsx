import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Frequently Asked Questions | Dreamaze',
  description:
    'Find answers to common questions about Dreamaze personalized children\'s books, customization options, shipping, and more.',
  keywords: ['FAQ', 'questions', 'personalized books', 'help', 'dreamaze support'],
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Frequently Asked Questions | Dreamaze',
    description: 'Find answers to common questions about Dreamaze personalized children\'s books.',
    url: 'https://dreamazebook.com/faq',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/faq',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
