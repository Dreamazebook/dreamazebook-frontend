'use client';

import React, { useState } from 'react';
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import BookDetailView from '../../components/BookDetailView';
import BookDetailSkeleton from '../../components/books/BookDetailSkeleton';
import BookDetailStickyBar from '../../components/books/BookDetailStickyBar';
import ReviewsSection from '../../components/reviews/Reviews';
import BookSections from '../../components/books/BookSections';

interface PagePic {
  id: number;
  pagenum: number;
  pagepic: string;
}

interface Keyword {
  keyword: string;
  count: number;
}

interface Review {
  reviewer_name: string;
  rating: number;
  comment: string;
  review_date: string;
  pagepic?: string;
}

interface Tag {
  tname: string;
}

interface BookDetailClientProps {
  book: any;
  productId: string;
  pagePics: PagePic[];
  tags: Tag[];
  availableLanguages: string[];
}

export default function BookDetailClient({
  book,
  productId,
  pagePics,
  tags,
  availableLanguages,
}: BookDetailClientProps) {
  const t = useTranslations('BookDetail');
  const router = useRouter();

  const [reviews] = useState<Review[]>([]);
  const [keywords] = useState<Keyword[]>([]);

  const isEmbedMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';

  if (!book) return <BookDetailSkeleton />;

  const handlePersonalizeClick = (e: React.MouseEvent, lang: string) => {
    void e;
    void lang;
    void router;
  };

  return (
    <>
      <div className="pb-0">
        <BookDetailView
          book={book}
          pagePics={pagePics}
          tags={tags}
          keywords={keywords}
          reviews={reviews}
          primaryButtonLabel={t('personalizeButton')}
          primaryButtonHref={`/personalize?bookid=${productId}`}
          onPrimaryClick={handlePersonalizeClick}
          availableLanguages={availableLanguages}
          bookId={productId}
          hidePriceAndButton={isEmbedMode}
        />
        {!isEmbedMode && (
          <>
            <ReviewsSection book={book} keywords={keywords} reviews={reviews} />
            <BookSections book={book} bookId={productId} />
          </>
        )}
      </div>
      {!isEmbedMode && (
        <BookDetailStickyBar
          book={book}
          primaryButtonLabel={t('personalizeButton')}
          primaryButtonHref={`/personalize?bookid=${productId}`}
          onPrimaryClick={handlePersonalizeClick}
          selectedLanguage={availableLanguages[0] || 'en'}
        />
      )}
    </>
  );
}
