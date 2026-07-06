import { getBooks } from '@/services/bookService';
import { Product } from '@/types/product';
import BooksPageClient from './BooksPageClient';

export default async function BooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let books: Product[] = [];
  try {
    const { data } = await getBooks(locale);
    books = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch books:', error);
  }

  return <BooksPageClient books={books} />;
}
