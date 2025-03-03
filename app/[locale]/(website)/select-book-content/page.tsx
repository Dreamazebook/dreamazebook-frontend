/** @jsxImportSource react */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IoIosArrowUp, IoIosArrowDown, IoIosArrowBack } from 'react-icons/io';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BaseBook } from '@/types/book';
import api from '@/utils/api';

interface Quality {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
}

export default function SelectBookContent() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookid') || '';
  const [book, setBook] = useState<BaseBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      if (bookId) {
        try {
          const response = await api.get<{ book: BaseBook }>(`/books/${bookId}`);
          setBook(response.book);
        } catch (error) {
          console.error('Failed to fetch book:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBook();
  }, [bookId]);

  // 示例数据：共8张图片
  const qualities: Quality[] = [
    {
      id: 'quality1',
      title: 'Flying High',
      subtitle: 'A place where imagination soars.',
      imageSrc: '/images/flying-high.png',
    },
    {
      id: 'quality2',
      title: 'Little Adventurer',
      subtitle: 'Exploring the great unknown.',
      imageSrc: '/images/little-adventurer.png',
    },
    {
      id: 'quality3',
      title: 'Lively',
      subtitle: 'Full of energy and vibrant spirit.',
      imageSrc: '/images/lively.png',
    },
    {
      id: 'quality4',
      title: 'Relaxed & Calm',
      subtitle: 'A soothing, peaceful setting.',
      imageSrc: '/images/relaxed-calm.png',
    },
    {
      id: 'quality5',
      title: 'Inspirational',
      subtitle: 'Uplifting stories that motivate.',
      imageSrc: '/images/inspirational.png',
    },
    {
      id: 'quality6',
      title: 'Mysterious',
      subtitle: 'Secrets waiting to be uncovered.',
      imageSrc: '/images/mysterious.png',
    },
    {
      id: 'quality7',
      title: 'Humorous',
      subtitle: 'Lighthearted and fun experiences.',
      imageSrc: '/images/humorous.png',
    },
    {
      id: 'quality8',
      title: 'Imaginative',
      subtitle: 'Boundless creativity and wonder.',
      imageSrc: '/images/imaginative.png',
    },
  ];

  // 当前主区域滚动到的图片索引
  const [activeIndex, setActiveIndex] = useState(0);
  // 存储选中图片的 id
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const maxSelections = 4;

  // 主区域容器和每个 item 的 ref 用于监听 Intersection
  const mainContentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  // 左侧导航容器 ref，用于上下按钮滚动（如果内容超出时）
  const navContainerRef = useRef<HTMLDivElement>(null);

  // 初始化 itemRefs 长度（确保 itemRefs 的数量与 qualities 相同）
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, qualities.length);
  }, [qualities]);

  // 使用 IntersectionObserver 监听主区域每个图片进入视口，设置 activeIndex
  useEffect(() => {
    const options = {
      root: mainContentRef.current,
      rootMargin: '0px',
      threshold: 0.6, // 当图片超过60%可视时认为其为当前 active
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          setActiveIndex(index);
        }
      });
    }, options);

    itemRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, []);

  // 左侧导航上下滚动
  const scrollNavUp = () => {
    if (navContainerRef.current) {
      navContainerRef.current.scrollBy({ top: -80, behavior: 'smooth' });
    }
  };
  const scrollNavDown = () => {
    if (navContainerRef.current) {
      navContainerRef.current.scrollBy({ top: 80, behavior: 'smooth' });
    }
  };

  // 点击左侧缩略图，平滑滚动到主区域对应图片
  const handleNavClick = (index: number) => {
    const target = itemRefs.current[index];
    if (target && mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  // 切换选中状态（用于 check 按钮）
  const toggleSelect = (id: string) => {
    setSelectedQualities((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter((q) => q !== id);
      } else {
        if (prev.length < maxSelections) {
          return [...prev, id];
        }
        return prev;
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex">
      {/* 左侧固定导航：固定高度为8张小图的总高度 */}
      <div className="hidden md:flex flex-col items-center w-32 bg-white p-2 shadow-sm sticky top-8"
           style={{ height: '532px' }}>
        <div className="mb-2 text-center">
          <p className="font-semibold">8 / 4 Selected</p>
          <p className="text-sm text-gray-500">
            {selectedQualities.length}/{maxSelections} Selected
          </p>
        </div>

        {/* 上按钮 */}
        <button className="p-2 text-gray-600 hover:text-blue-600" onClick={scrollNavUp}>
          <IoIosArrowUp size={20} />
        </button>

        {/* 缩略图列表：固定高度，无需滚动（因为总共就8张） */}
        <div
          ref={navContainerRef}
          className="w-full flex flex-col items-center gap-3 overflow-hidden"
          style={{ height: '400px' }}
        >
          {qualities.map((item, index) => {
            const isActive = index === activeIndex;
            const isSelected = selectedQualities.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleNavClick(index)}
                className={`relative w-20 h-14 cursor-pointer border
                  ${isActive ? 'border-blue-500' : 'border-transparent'}`}
              >
                <Image src={item.imageSrc} alt={item.title} fill className="object-cover" />
                {/* 如果选中则显示蒙版和对勾 */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white text-xl font-bold">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 下按钮 */}
        <button className="p-2 text-gray-600 hover:text-blue-600" onClick={scrollNavDown}>
          <IoIosArrowDown size={20} />
        </button>
      </div>

      {/* 主区域：大图列表，可垂直滚动 */}
      <div ref={mainContentRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Please select the 4 most suitable qualities from the 8 below
        </h1>
        {qualities.map((item, index) => {
          const isSelected = selectedQualities.includes(item.id);
          return (
            <div
              key={item.id}
              data-index={index}
              ref={(el) => {
                itemRefs.current[index] = el as HTMLDivElement;
              }}
              className="bg-white rounded shadow-sm p-4 flex flex-col items-center"
            >
              <div className="relative w-full h-64 mb-4">
                <Image src={item.imageSrc} alt={item.title} fill className="object-cover rounded" />
              </div>
              {/* 底部：圆形Check按钮 + 图片名称 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSelect(item.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors mr-2
                    ${isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    }`}
                >
                  {isSelected && '✓'}
                </button>
                <div>
                  <h2 className="text-base font-semibold">{item.title}</h2>
                  <p className="text-sm text-gray-500">{item.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Continue 按钮 */}
        <div className="flex justify-center mt-8">
          <button
            type="button"
            disabled={selectedQualities.length < maxSelections}
            className={`px-6 py-3 rounded text-white font-semibold transition-colors ${
              selectedQualities.length < maxSelections
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
