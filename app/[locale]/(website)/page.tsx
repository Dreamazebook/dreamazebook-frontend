import Slideshow from './components/home/SlideShow';
import LazyOnView from './components/common/LazyOnView';
import { Product } from '@/types/product';
import { getBooks } from '@/services/bookService';
import { DEFAULT_GIFT_PACKAGES_CONFIG } from './components/books/giftPackagesData';
import { WELCOME_SUCCESS_URL } from '@/constants/links';
import ReserveSection from '../(marketing)/components/ReserveSection';

// 固定 Our Books 展示顺序：good night, santa, bravery, birthday, melody
const BOOK_DISPLAY_ORDER_RANK: Record<string, number> = {
  PICBOOK_GOODNIGHT3: 0,
  // PICBOOK_GOODNIGHT: 0,
  // PICBOOK_SANTA: 1,
  PICBOOK_DAD: 1,
  PICBOOK_MOM: 2,
  PICBOOK_BIRTHDAY: 3,
  PICBOOK_MELODY: 4,
  PICBOOK_BRAVEY: 5,
};

const getBookCode = (book: any): string =>
  String((book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? '').trim();

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let books: Product[] = [];
  try {
    const { data } = await getBooks(locale);
    books = data || [];
  } catch (error) {
    console.error('Failed to fetch books:', error);
  }

  const orderedBooks = (books || []).map((book, index) => {
    const code = getBookCode(book);
    const rank = BOOK_DISPLAY_ORDER_RANK[code] ?? Number.MAX_SAFE_INTEGER;
    return { book, index, rank };
  })
  .sort((a, b) => (a.rank - b.rank) || (a.index - b.index))
  .map(x => x.book);

  return (
    <main className="min-h-screen">
      {/* Slideshow doesn't need animation as it's already animated */}
      <Slideshow />

      <LazyOnView name='TheHeartBehindDreamaze' />

      <LazyOnView name='WhatMakesDreamazeDifferent' />

      <section>
        {/* <OurBook /> */}
        <h2 className='text-[#222] text-[24px] md:text-[40px] font-medium text-center mb-3 mt-[64px] md:mt-[88px]'>Our Favorite<br className="md:hidden"/> Personalized Stories</h2>
        <p className='text-[#222] text-[14px] md:text-[16px] text-center mb-[24px] md:mb-[48px] leading-relaxed'>
          <span className='md:hidden'>Create the story that brings out their biggest smile.</span>
          <span className='hidden md:block'>Find the story where they become the hero.</span>
        </p>
        <LazyOnView name='BooksGrid' componentProps={{ books: orderedBooks }} />
      </section>

      <LazyOnView name='GiftPackagesSection' componentProps={{ section: DEFAULT_GIFT_PACKAGES_CONFIG }} />

      <LazyOnView name='TopPickThisMonth' />

      <LazyOnView name='StoriesFromRealFamilies' />

      <LazyOnView name='InfiniteScrollLogo' />

      <LazyOnView name='LastingMemorial' />

      {/* FAQ */}
      {/* <section>
        <FAQ FAQs={faqs} />
      </section> */}

      {/* Newsletter */}
      <ReserveSection cssClass='bg-white text-[#222222]' btnId="email_submit_mid" redirectUrl={WELCOME_SUCCESS_URL} title={"Every child deserves<br class='md:hidden' /> to be the hero."} desc={'Join the Dreamaze circle to get free printables, story samples, and early access gifts.'} btnText="Join Now" />

    </main>
  );
}