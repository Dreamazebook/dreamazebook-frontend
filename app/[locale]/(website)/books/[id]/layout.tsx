import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const bookTitles: Record<string, string> = {
    PICBOOK_GOODNIGHT3: 'Good Night to You',
    PICBOOK_GOODNIGHT: 'Good Night to You',
    PICBOOK_MOM: 'The Way I See You, Mama',
    PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
    PICBOOK_BIRTHDAY: 'Birthday Book for You',
    PICBOOK_SANTA: "Santa's Letter for You",
    PICBOOK_MELODY: 'Your Melody',
  };

  const bookDescriptions: Record<string, string> = {
    PICBOOK_GOODNIGHT3:
      'Introduce your little one to a world of peaceful dreams with Good Night to You. A personalized story that sparks imagination while creating the perfect, soothing atmosphere for sleep.',
    PICBOOK_GOODNIGHT:
      'Introduce your little one to a world of peaceful dreams. A personalized story that sparks imagination while creating the perfect, soothing atmosphere for sleep.',
    PICBOOK_MOM:
      "Celebrate the love between a child and their mama. A personalized keepsake woven with photos, your child's drawings, and words from the heart.",
    PICBOOK_BRAVEY:
      "Even the smallest acts of bravery make a big difference. A personalized story that celebrates courage and nurtures confidence in all its forms.",
    PICBOOK_BIRTHDAY:
      'Every birthday is magical when personalized just for your child. A keepsake that turns each birthday into a memory to cherish, year after year.',
    PICBOOK_SANTA:
      "Imagine the joy on your child's face when they receive their very own letter from Santa Claus. A festive keepsake that makes Christmas sparkle with wonder, warmth, and love.",
    PICBOOK_MELODY:
      "Your Melody celebrates your baby's name in the sweetest way. A precious keepsake to welcome little ones and treasure their earliest years.",
  };

  const title = bookTitles[id] || 'Personalized Children\'s Book';
  const description = bookDescriptions[id] || 'Discover a personalized children\'s book where your child becomes the hero of their own magical story.';

  return {
    ...sharedMetadata,
    title: `${title} | Personalized Children's Book | Dreamaze`,
    description,
    keywords: [
      title,
      'personalized children\'s book',
      'custom children\'s book',
      'personalized gift',
      'children\'s story',
      'illustrated book',
    ],
    openGraph: {
      ...sharedMetadata.openGraph,
      title,
      description,
      url: `https://dreamazebook.com/books/${id}`,
      type: 'website',
    },
    twitter: {
      ...sharedMetadata.twitter,
      title,
      description,
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `https://dreamazebook.com/books/${id}`,
    },
  };
}

export default function BookDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
