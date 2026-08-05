import { getBooks } from '@/services/bookService';
import { Product } from '@/types/product';
import { getBookPath } from '@/constants/bookRoutes';
import { WEBSITE_CDN_URL } from '@/constants/cdn';
import BookGridClient from './BookGridClient';

// ── Config ─────────────────────────────────────────────────────────────

const BOOK_NAME_OVERRIDES: Record<string, string> = {
  PICBOOK_GOODNIGHT3: 'Good Night to You',
  PICBOOK_MOM: 'The Way I See You, Mama',
  PICBOOK_DAD: 'Dad & Me: A Little Book of Our Big Memories',
  PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
  PICBOOK_BIRTHDAY: 'Birthday Book for You',
  PICBOOK_MELODY: 'Your Melody',
  PICBOOK_SANTA: "Santa's Letter for You",
};

const BOOK_DISPLAY_ORDER_RANK: Record<string, number> = {
  PICBOOK_GOODNIGHT3: 0,
  PICBOOK_DAD: 1,
  PICBOOK_MOM: 2,
  PICBOOK_BIRTHDAY: 3,
  PICBOOK_MELODY: 4,
  PICBOOK_BRAVEY: 5,
};

const getBookCode = (book: Product): string =>
  String((book as any)?.spu_code ?? (book as any)?.id ?? (book as any)?.code ?? '').trim();

const BG_COLORS = [
  'bg-blue-50',
  'bg-purple-50',
  'bg-orange-50',
  'bg-green-50',
  'bg-pink-50',
  'bg-yellow-50',
];

// ── Server Component ───────────────────────────────────────────────────

export interface DisplayBook {
  code: string;
  name: string;
  description: string;
  coverUrl: string;
  price: string;
  href: string;
  bg: string;
}

export default async function BookGrid({ locale }: { locale: string }) {
  let books: Product[] = [];
  try {
    const { data } = await getBooks(locale);
    books = data || [];
  } catch (error) {
    console.error('Failed to fetch books:', error);
  }

  const orderedBooks = books
    .map((book, index) => {
      const code = getBookCode(book);
      const rank = BOOK_DISPLAY_ORDER_RANK[code] ?? Number.MAX_SAFE_INTEGER;
      return { book, index, rank };
    })
    .sort((a, b) => (a.rank - b.rank) || (a.index - b.index))
    .map((x) => x.book);

  const displayBooks: DisplayBook[] = orderedBooks.map((book, i) => {
    const code = getBookCode(book);
    const originalName = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
    const name = BOOK_NAME_OVERRIDES[code] || originalName;
    const description = (book as any)?.description ?? (book as any)?.desc ?? '';
    const coverUrl = `${WEBSITE_CDN_URL}catalog/${code === 'PICBOOK_GOODNIGHT3' ? 'PICBOOK_GOODNIGHT' : code}/cover-default.png`;
    const price =
      (book as any)?.current_price ?? (book as any)?.base_price ?? (book as any)?.price ?? '';
    const formattedPrice =
      price !== '' && price !== null && price !== undefined
        ? `$${Number(price).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        : '';
    const href = getBookPath(code);

    return {
      code,
      name,
      description,
      coverUrl,
      price: formattedPrice,
      href,
      bg: BG_COLORS[i % BG_COLORS.length],
    };
  });

  return <BookGridClient books={displayBooks} />;
}