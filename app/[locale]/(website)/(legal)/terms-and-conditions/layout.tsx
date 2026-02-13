import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Terms and Conditions | Dreamaze',
  description:
    'Read the terms and conditions for using Dreamaze personalized children\'s books website and services.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Terms and Conditions | Dreamaze',
    description: 'Read the terms and conditions for Dreamaze.',
    url: 'https://dreamazebook.com/terms-and-conditions',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/terms-and-conditions',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
