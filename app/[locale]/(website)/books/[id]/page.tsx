"use client";

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from "@/i18n/routing";
import api from "@/utils/api";
import { DetailedBook} from '@/types/book';
import ReviewsSection from '../../components/Reviews';
import BookDetailView from '../../components/BookDetailView';
import useUserStore from '@/stores/userStore';
import { useTranslations } from 'next-intl';

interface PagePic {
  id: number;
  pagenum: number;
  pagepic: string;
}

// 定义评论的类型
interface Review {
  reviewer_name: string;
  rating: number;
  comment: string; // 评论内容
  review_date: string; // 评论日期
  pagepic?: string; // 用户图片，可能是可选的
}

interface Keyword {
  keyword: string;
  count: number;
}

interface ApiResponse {
  success: boolean;
  code: number;
  message: string;
  data: DetailedBook;
}

interface Tag {
  tname: string;
}

const BookDetailPage = () => {
  const t = useTranslations('BookDetail');
  const params = useParams();
  const id = params.id;
  const { isLoggedIn, openLoginModal } = useUserStore();

  const [book, setBook] = useState<DetailedBook | null>(null);
  //const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBook[]>([]);
  const [pagePics, setPagePics] = useState<PagePic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [openFaq, setOpenFaq] = useState<number>(1);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await api.get<ApiResponse>(`/picbooks/${id}`);
        console.log('API Response:', response);
        setBook(response.data);
        //setRecommendedBooks(response.recommendedBooks);
        setPagePics(response.data.pages.map(page => ({
          id: page.id,
          pagenum: page.page_number,
          pagepic: page.image_url
        })));
        setTags(response.data.tags.map(tag => ({ tname: tag })));
        setReviews(response.data.reviews);
        setKeywords(response.data.keywords);
      } catch (error) {
        console.error('Failed to fetch book details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">{t('noBookFound')}</div>;

  const description = book.variant ? book.variant.description : "No description available.";

  const handlePersonalizeClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginModal();
      return;
    }
    // 如果已登录，正常跳转
  };

  return (
    <>
      <BookDetailView
        book={book}
        pagePics={pagePics}
        tags={tags}
        keywords={keywords}
        reviews={reviews}
        primaryButtonLabel={t('personalizeButton')}
        primaryButtonHref={`/personalize?bookid=${book.id}`}
        onPrimaryClick={handlePersonalizeClick}
      />
      <ReviewsSection book={book} keywords={keywords} reviews={reviews} />
    </>
  );
}

export default BookDetailPage;
