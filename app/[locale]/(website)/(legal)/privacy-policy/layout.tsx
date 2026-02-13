import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Privacy Policy | Dreamaze',
  description:
    'Read Dreamaze privacy policy to understand how we collect, use, and protect your personal information.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Privacy Policy | Dreamaze',
    description: 'Read Dreamaze privacy policy.',
    url: 'https://dreamazebook.com/privacy-policy',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/privacy-policy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
