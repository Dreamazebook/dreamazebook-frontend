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
import BookDetailStickyBar from '../../components/books/BookDetailStickyBar';
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

const BOOK_DETAIL_OVERRIDES: Record<
  string,
  {
    name?: string;
    description?: string;
    tags?: Tag[];
  }
> = {
  PICBOOK_GOODNIGHT3: {
    name: 'Good Night to You',
    description:
      'Introduce your little one to a world of peaceful dreams with Good Night to You. As they embark on a magical journey after falling asleep, each animal they encounter serves as a gentle reminder of the beauty and calmness of bedtime. This personalized story sparks imagination while creating the perfect, soothing atmosphere for sleep, making it a cherished part of any bedtime routine.',
    tags: [{ tname: 'Bedtime Story' }, { tname: 'Imaginative Journey' }],
  },
  PICBOOK_BRAVEY: {
    name: "Little One, You're Brave in Many Ways",
    description:
      "Even the smallest acts of bravery make a big difference.<br/>From trying new foods, to speaking up in class, to facing a fear of the dark — your child will see themselves reflected in a story that celebrates courage in all its forms.<br/>A keepsake that nurtures confidence and reminds little ones: they are braver than they think.",
    tags: [{ tname: 'Everyday Courage' }, { tname: 'Confidence Builder' }],
  },
  PICBOOK_BIRTHDAY: {
    name: 'Birthday Book for You',
    description:
      'Every birthday is magical when the forest gathers to celebrate your child.<br/>From playful animals bringing gifts, to special blessings that reflect their unique traits, this story makes their big day unforgettable.<br/>A personalized treasure that turns each birthday into a memory to cherish, year after year.',
    tags: [{ tname: 'Joyful Celebration' }, { tname: 'Birthday Keepsake' }],
  },
  PICBOOK_SANTA: {
    name: "Santa's Letter for You",
    description:
      "Imagine the joy on your child's face when they receive their very own letter from Santa Claus.<br/>In this personalized story, Santa shares what he's noticed about your child's good deeds, their wishes, and the magic of the season.<br/>A festive keepsake that makes Christmas sparkle with wonder, warmth, and love.",
    tags: [{ tname: 'Christmas Magic' }, { tname: 'Festive Keepsake' }],
  },
  PICBOOK_MELODY: {
    name: 'Your Melody',
    description:
      "Your Melody celebrates your baby's name in the sweetest way. Each letter turns into a gentle instrument carrying a blessing, and together they create a unique song just for them. A precious keepsake to welcome little ones and treasure their earliest years.",
    tags: [{ tname: 'Name-to-Melody' }, { tname: 'Keepsake Blessing' }],
  },
};

const applyBookOverride = (bookData: any, override?: { name?: string; description?: string }) => {
  if (!override) return bookData;
  const patched = { ...(bookData || {}) };
  if (override.name) {
    patched.name = override.name;
    patched.default_name = override.name;
  }
  if (override.description) {
    patched.description = override.description;
  }
  if (patched.data && typeof patched.data === 'object') {
    patched.data = { ...patched.data };
    if (override.name) patched.data.name = override.name;
    if (override.description) patched.data.description = override.description;
  }
  return patched;
};

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

  const normalizedId = Array.isArray(id) ? id[0] : String(id || '');

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setLoadingGallery(true);
      try {
        // 优先获取产品信息，让用户先看到页面内容
        // 使用缓存，书籍详情缓存 10 分钟
        const productResponse = await apiCache.request<any>(
          () => api.get<any>(`/products/${normalizedId}`, { params: { language: locale } }),
          `/products/${normalizedId}`,
          { language: locale },
          {
            ttl: 10 * 60 * 1000, // 10分钟缓存
            useCache: true,
            useDedupe: true,
          }
        );
        const data = productResponse?.data || productResponse;
        const override = BOOK_DETAIL_OVERRIDES[normalizedId];
        const patchedData = applyBookOverride(data, override);
        setBook(patchedData);
        setLoading(false); // 产品信息加载完成，可以先显示页面
        
        try {
          const langs = (data?.data?.customization_config?.languages
            || data?.customization_config?.languages
            || []) as string[];
          if (Array.isArray(langs) && langs.length > 0) {
            setAvailableLanguages(langs);
          }
        } catch {}
        
        setTags(override?.tags ?? []);
        setReviews([]);
        setKeywords([]);
      } catch (error) {
        console.error('Failed to fetch book details:', error);
        setLoading(false);
      }
      
      // 异步加载 gallery 资源（通过 API 中转 Cloudflare index.json），不阻塞页面显示
      try {
        // Good Night 系列的静态资源实际存放在 PICBOOK_GOODNIGHT 目录下，
        // 这里做一次规范化，其他书籍依旧使用原有 ID。
        const galleryId =
          String(normalizedId) === 'PICBOOK_GOODNIGHT3'
            ? 'PICBOOK_GOODNIGHT'
            : String(normalizedId);

        const galleryBase = `/products/picbooks/${encodeURIComponent(
          galleryId
        )}/gallery`;

        const resp = await fetch(`/api/local-gallery${galleryBase}`);
        if (!resp.ok) {
          throw new Error(`Failed to load gallery index: ${resp.status}`);
        }

        const json = await resp.json();
        const items = Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.files)
          ? json.files.map((src: string, idx: number) => ({
              id: `legacy-${idx}`,
              order: idx + 1,
              src,
            }))
          : [];

        const sortedItems = items
          .map((item: any, idx: number) => ({
            id: item.id ?? `item-${idx}`,
            order:
              typeof item.order === 'number'
                ? item.order
                : parseInt(String(item.order ?? idx + 1), 10) || idx + 1,
            src: item.src,
          }))
          .filter((item: any) => typeof item.src === 'string' && item.src.length > 0)
          .sort((a: any, b: any) => a.order - b.order);

        const pages = sortedItems.map((item: any, index: number) => ({
          id: item.id ?? index,
          pagenum: item.order ?? index + 1,
          pagepic: item.src,
        }));

        setPagePics(pages);
      } catch (error) {
        console.error('Failed to fetch gallery from API:', error);
        setPagePics([]);
      } finally {
        setLoadingGallery(false);
      }
    };

    if (normalizedId) {
      fetchBookDetails();
    }
  }, [normalizedId, locale]);

  if (loading) return <BookDetailSkeleton />;
  if (!book) return <div className="min-h-screen flex items-center justify-center">{t('noBookFound')}</div>;

  const description = book?.description || "No description available.";

  const handlePersonalizeClick = (e: React.MouseEvent, lang: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      const redirectTo = `/personalize?bookid=${normalizedId}&language=${encodeURIComponent(lang || 'en')}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }
    // 如果已登录，正常跳转
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
          primaryButtonHref={`/personalize?bookid=${normalizedId}`}
          onPrimaryClick={handlePersonalizeClick}
          availableLanguages={availableLanguages}
          bookId={normalizedId}
        />
        <ReviewsSection book={book} keywords={keywords} reviews={reviews} />
        {/* Book Sections - Dynamically rendered based on book config */}
        <BookSections book={book} bookId={normalizedId} />
      </div>
      {/* 手机端吸底栏 */}
      <BookDetailStickyBar
        book={book}
        primaryButtonLabel={t('personalizeButton')}
        primaryButtonHref={`/personalize?bookid=${normalizedId}`}
        onPrimaryClick={handlePersonalizeClick}
        selectedLanguage={availableLanguages[0] || 'en'}
      />
    </>
  );
}

export default BookDetailPage;
