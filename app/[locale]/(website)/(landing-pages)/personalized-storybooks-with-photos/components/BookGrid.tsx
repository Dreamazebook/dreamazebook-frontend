import { getBooks } from '@/services/bookService';
import { Product } from '@/types/product';
import { Link } from '@/i18n/routing';
import { getBookPath } from '@/constants/bookRoutes';
import { WEBSITE_CDN_URL } from '@/constants/cdn';

// 书籍名字覆盖配置（与 BooksGrid 保持一致）
const BOOK_NAME_OVERRIDES: Record<string, string> = {
  PICBOOK_GOODNIGHT3: 'Good Night to You',
  PICBOOK_MOM: 'The Way I See You, Mama',
  PICBOOK_DAD: 'Dad & Me: A Little Book of Our Big Memories',
  PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
  PICBOOK_BIRTHDAY: 'Birthday Book for You',
  PICBOOK_MELODY: 'Your Melody',
  PICBOOK_SANTA: "Santa's Letter for You",
};

// 展示顺序与主页保持一致
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

function BookCard({
  book,
  bg,
  index,
}: {
  book: Product;
  bg: string;
  index: number;
}) {
  const idOrCode = getBookCode(book);
  const originalName = (book as any)?.name ?? (book as any)?.default_name ?? 'Product';
  const name = BOOK_NAME_OVERRIDES[idOrCode] || originalName;
  const description = (book as any)?.description ?? (book as any)?.desc ?? '';
  const coverUrl = `${WEBSITE_CDN_URL}catalog/${idOrCode === 'PICBOOK_GOODNIGHT3' ? 'PICBOOK_GOODNIGHT' : idOrCode}/cover-default.png`;

  return (
    <Link
      href={getBookPath(idOrCode)}
      prefetch={true}
      className={`rounded-2xl ${bg} overflow-hidden flex flex-col transition-transform hover:scale-[1.02]`}
    >
      <div className="p-4 pb-2 flex items-center justify-center">
        <img
          src={coverUrl}
          alt={name}
          className="w-full max-w-[200px] h-auto object-contain rounded-lg drop-shadow-md"
          loading={index < 4 ? 'eager' : 'lazy'}
        />
      </div>
      <div className="px-4 pb-5 pt-3 flex flex-col flex-1 items-center text-center">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-1">
          {name}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 flex-1">
          {description}
        </p>
        <button className="w-full bg-gray-900 hover:bg-gray-700 active:scale-95 transition-all duration-150 text-white text-sm font-medium py-2.5 px-4 rounded-lg">
          Create my preview
        </button>
      </div>
    </Link>
  );
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

  return (
    <section className="px-4 py-10 max-w-5xl mx-auto">
      {/* Desktop heading */}
      <h2 className="block text-4xl font-bold text-gray-900 text-center mb-10 leading-tight">
        Choose a story they&apos;ll love
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {orderedBooks.map((book, i) => (
          <BookCard
            key={getBookCode(book)}
            book={book}
            bg={BG_COLORS[i % BG_COLORS.length]}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
