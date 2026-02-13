import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Return Policy | Dreamaze',
  description:
    'Learn about Dreamaze return policy and how to return your personalized children\'s book if you\'re not satisfied.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Return Policy | Dreamaze',
    description: 'Learn about Dreamaze return policy.',
    url: 'https://dreamazebook.com/return-policy',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/return-policy',
  },
};

export default function ReturnPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
