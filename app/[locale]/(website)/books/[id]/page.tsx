"use client";

import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link, useRouter } from "@/i18n/routing";
import api from "@/utils/api";
import { apiCache } from "@/utils/apiCache";
// Using new product detail schema
import ReviewsSection from '../../components/reviews/Reviews';
import BookDetailView from '../../components/BookDetailView';
import BookSections from '../../components/books/BookSections';
import BookDetailSkeleton from '../../components/books/BookDetailSkeleton';
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

// legacy type no longer used

interface Tag {
  tname: string;
}

const BookDetailPage = () => {
  const t = useTranslations('BookDetail');
  const params = useParams();
  const id = params.id;
  const locale = useLocale();
  const router = useRouter();
  const { isLoggedIn } = useUserStore();

  const [book, setBook] = useState<any | null>(null);
  //const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBook[]>([]);
  const [pagePics, setPagePics] = useState<PagePic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en', 'zh']);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setLoadingGallery(true);
      try {
        // 优先获取产品信息，让用户先看到页面内容
        // 使用缓存，书籍详情缓存 10 分钟
        const productResponse = await apiCache.request<any>(
          () => api.get<any>(`/products/${id}`, { params: { language: locale } }),
          `/products/${id}`,
          { language: locale },
          {
            ttl: 10 * 60 * 1000, // 10分钟缓存
            useCache: true,
            useDedupe: true,
          }
        );
        const data = productResponse?.data || productResponse;
        setBook(data);
        setLoading(false); // 产品信息加载完成，可以先显示页面
        
        try {
          const langs = (data?.data?.customization_config?.languages
            || data?.customization_config?.languages
            || []) as string[];
          if (Array.isArray(langs) && langs.length > 0) {
            setAvailableLanguages(langs);
          }
        } catch {}
        
        setTags([]);
        setReviews([]);
        setKeywords([]);
      } catch (error) {
        console.error('Failed to fetch book details:', error);
        setLoading(false);
      }
      
      // 异步加载 gallery 图片，不阻塞页面显示
      try {
        const galleryBase = `/products/picbooks/${encodeURIComponent(String(id))}/gallery`;
        const resp = await fetch(`/api/local-gallery${galleryBase}`);
        const json = await resp.json();
        const files: string[] = Array.isArray(json?.files) ? json.files : [];
        // 映射为页面结构（简单按文件名排序后顺序当作页码）
        setPagePics(files.map((src, idx) => ({ id: idx, pagenum: idx + 1, pagepic: src })));
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoadingGallery(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id, locale]);

  if (loading) return <BookDetailSkeleton />;
  if (!book) return <div className="min-h-screen flex items-center justify-center">{t('noBookFound')}</div>;

  const description = book?.description || "No description available.";

  const handlePersonalizeClick = (e: React.MouseEvent, lang: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      const redirectTo = `/personalize?bookid=${id}&language=${encodeURIComponent(lang || 'en')}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
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
        primaryButtonHref={`/personalize?bookid=${id}`}
        onPrimaryClick={handlePersonalizeClick}
        availableLanguages={availableLanguages}
        bookId={Array.isArray(id) ? id[0] : id || ''}
      />
      <ReviewsSection book={book} keywords={keywords} reviews={reviews} />
      {/* Book Sections - Dynamically rendered based on book config */}
      <BookSections book={book} bookId={Array.isArray(id) ? id[0] : id || ''} />
    </>
  );
}

export default BookDetailPage;
