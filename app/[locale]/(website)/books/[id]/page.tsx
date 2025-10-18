"use client";

import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link, useRouter } from "@/i18n/routing";
import api from "@/utils/api";
// Using new product detail schema
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [openFaq, setOpenFaq] = useState<number>(1);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        // 1) 仍获取基本产品信息（用于名称、价格、描述）
        const body = await api.get<any>(`/products/${id}`, { params: { language: locale } });
        const data = body?.data || body;
        setBook(data);

        // 2) 从 public 目录读取本地 gallery 图片
        const galleryBase = `/products/picbooks/${encodeURIComponent(String(id))}/gallery`;
        const resp = await fetch(`/api/local-gallery${galleryBase}`);
        const json = await resp.json();
        const files: string[] = Array.isArray(json?.files) ? json.files : [];
        // 映射为页面结构（简单按文件名排序后顺序当作页码）
        setPagePics(files.map((src, idx) => ({ id: idx, pagenum: idx + 1, pagepic: src })));
        setTags([]);
        setReviews([]);
        setKeywords([]);
      } catch (error) {
        console.error('Failed to fetch book details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id, locale]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">{t('noBookFound')}</div>;

  const description = book?.description || "No description available.";

  const handlePersonalizeClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      const redirectTo = `/personalize?bookid=${id}`;
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
      />
      <ReviewsSection book={book} keywords={keywords} reviews={reviews} />
    </>
  );
}

export default BookDetailPage;
