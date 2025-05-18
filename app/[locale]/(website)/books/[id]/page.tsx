"use client";

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from "@/utils/api";
import { DetailedBook} from '@/types/book';
import ReviewsSection from '../../components/Reviews';

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
  const params = useParams();
  const id = params.id;

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
          pagepic: `/${page.image_url.replace('public/', '')}`
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">No book found</div>;

  const description = book.variant ? book.variant.description : "No description available.";

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* 左侧图片区域 - 使用 grid 确保每张图片占满一屏高度 */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-0">
            {pagePics.map((page) => (
              <div key={page.id} className="w-full">
                <div className="relative w-full">
                  <Image
                    src={page.pagepic}
                    alt={`Page ${page.pagenum}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto"
                    priority={page.pagenum === 1}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧信息区域 */}
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="max-w-xl mx-auto p-12">
            {/* 标题和评分 */}
            <h1 className="text-[36px] leading-tight font-normal mb-4">
              {book.default_name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#FFB800]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
               {/* 标签 */}
              {tags && tags.map((tag, index) => (
                <span key={index} className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  {tag.tname}
                </span>
              ))}
            </div>

            {/* 描述文本 */}
            <div className="text-sm text-gray-900 bg-gray-100 px-3 py-1 mb-6 rounded-lg">
              <p>{description}</p>
            </div>
            
            {/* 规格信息 */}
            <div className="text-sm space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-600">20cm x 20cm landscape</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-600">Between 54-110 pages (depending on date)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-600">Printed and dispatched in 2-4 working days</span>
              </div>
            </div>

            {/* 语言选择 */}
            <div className="mb-12">
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-lg text-gray-600 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-no-repeat bg-[center_right_1rem]"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>

            {/* 价格和按钮 */}
            <div className="flex items-center justify-between gap-8 mb-12">
              {/* 价格部分 */}
              <div className="flex items-baseline gap-3">
                <span className="text-[#012CCE] text-[36px] font-medium">${book.price}</span>
                <span className="text-gray-400 line-through">${(Number(book.price) * 1.25).toFixed(2)}</span>
              </div>
              
              {/* 按钮部分 */}
              <Link 
                href={`/personalize?bookid=${book.id}&language=${selectedLanguage}`}
                className="bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-base font-medium"
              >
                Personalize my book
              </Link>
            </div>

            {/* FAQ 部分 */}
            <div className="space-y-4 border-gray-200">
              {[1, 2, 3].map((num) => (
                <div key={num} className="border-b border-gray-200 pb-4">
                  <button
                    className="w-full flex justify-between items-center"
                    onClick={() => setOpenFaq(openFaq === num ? 0 : num)}
                  >
                    <h3 className="text-base font-medium">
                      {String(num).padStart(2, '0')} Where Are You? Save the Multiverse!
                    </h3>
                    <span className="text-2xl">{openFaq === num ? '-' : '+'}</span>
                  </button>
                  {openFaq === num && (
                    <p className="text-gray-600 mt-4 text-sm">
                      We pour hours of care into making every book - to help you show the people who matter just how much they mean to you.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 评论区域 */}
      <ReviewsSection book={book} keywords={keywords} reviews={reviews} />
    </div>
  );
}

export default BookDetailPage;
