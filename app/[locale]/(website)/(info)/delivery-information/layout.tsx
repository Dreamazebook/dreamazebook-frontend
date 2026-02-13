import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Delivery Information | Dreamaze',
  description:
    'Learn about Dreamaze shipping options, delivery times, and tracking. We offer fast, reliable delivery for personalized children\'s books worldwide.',
  keywords: ['shipping', 'delivery', 'order tracking', 'shipping rates', 'delivery time'],
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Delivery Information | Dreamaze',
    description: 'Learn about Dreamaze shipping and delivery options.',
    url: 'https://dreamazebook.com/delivery-information',
  },
  alternates: {
    canonical: 'https://dreamazebook.com/delivery-information',
  },
};

export default function DeliveryInfoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
