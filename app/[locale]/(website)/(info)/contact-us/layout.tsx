import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Contact Us | Dreamaze - Personalized Children\'s Books',
  description:
    'Get in touch with our Dreamaze team. We\'re here to answer your questions and help you create the perfect personalized children\'s book.',
  keywords: ['contact', 'support', 'email', 'customer service', 'dreamaze'],
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Contact Us | Dreamaze',
    description: 'Get in touch with our Dreamaze team for support and questions.',
    url: 'https://dreamazebook.com/contact-us',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/contact-us',
  },
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
