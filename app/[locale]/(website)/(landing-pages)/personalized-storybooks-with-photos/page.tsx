import type { Metadata } from 'next';
import HeroSection from './components/HeroSection';
import MeaningfulGifts from './components/MeaningfulGifts';
import BookGrid from './components/BookGrid';
import OurStandard from './components/OurStandard';
import PersonalizedBookSection from './components/PersonalizedBookSection';
import ThatsMeSection from './components/ThatsMeSection';
import FAQ from '@/app/[locale]/(marketing)/components/FAQ';
import { personalizedStorybooksFaqs } from './data/faqs';

export const metadata: Metadata = {
  title: "Personalized Storybooks with Photos | Dreamaze Book",
  description:
    "Make your child the hero of their own story. Hand-drawn illustrations woven with their photo into a keepsake they'll treasure forever — created in minutes.",
  keywords: [
    "personalized storybooks",
    "children's books with photos",
    "custom kids book",
    "personalized children's book",
    "photo storybook",
  ],
  openGraph: {
    title: "Personalized Storybooks with Photos | Dreamaze Book",
    description:
      "Make your child the hero of their own story. Hand-drawn illustrations woven with their photo into a keepsake they'll treasure forever.",
    type: "website",
  },
};

export default async function PersonalizedStorybooks({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="min-h-screen bg-[#FFF7F9]">
      <HeroSection />
      <MeaningfulGifts />
      <BookGrid locale={locale} />
      <OurStandard />
      <PersonalizedBookSection />
      <ThatsMeSection />
      <FAQ FAQs={personalizedStorybooksFaqs} />
    </main>
  );
}
