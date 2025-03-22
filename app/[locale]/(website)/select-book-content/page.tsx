/** @jsxImportSource react */
'use client';

import React, { useState, useRef, useEffect, JSX } from 'react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
      imageSrc: '/images/flying-high.png',
    },
    {
      id: 'quality4',
      title: 'Relaxed & Calm',
      subtitle: 'A soothing, peaceful setting.',
      imageSrc: '/images/flying-high.png',
    },
    {
      id: 'quality5',
      title: 'Inspirational',
      subtitle: 'Uplifting stories that motivate.',
      imageSrc: '/images/flying-high.png',
    },
    {
      id: 'quality6',
      title: 'Mysterious',
      subtitle: 'Secrets waiting to be uncovered.',
      imageSrc: '/images/flying-high.png',
    },
    {
      id: 'quality7',
      title: 'Humorous',
      subtitle: 'Lighthearted and fun experiences.',
      imageSrc: '/images/flying-high.png',
    },
    {
      id: 'quality8',
      title: 'Imaginative',
      subtitle: 'Boundless creativity and wonder.',
      imageSrc: '/images/flying-high.png',
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

  // 左侧导航容器 ref，用于上下按钮滚动
  const navContainerRef = useRef<HTMLDivElement>(null);

  // 控制上下箭头是否可点击
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  // 初始化 itemRefs 长度（确保 itemRefs 的数量与 qualities 相同）
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, qualities.length);
  }, [qualities]);

  // 使用 IntersectionObserver 监听主区域每个图片进入视口，设置 activeIndex
  useEffect(() => {
    const options = {
      root: mainContentRef.current,
      rootMargin: '0px',
      threshold: 0.6,
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

  // 监听左侧导航容器滚动，更新 canScrollUp 和 canScrollDown
  useEffect(() => {
    const handleScroll = () => {
      if (!navContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = navContainerRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
    };

    const navEl = navContainerRef.current;
    if (navEl) {
      navEl.addEventListener('scroll', handleScroll);
      handleScroll();
    }
    return () => {
      if (navEl) navEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 左侧导航上下滚动
  const scrollNavUp = () => {
    if (navContainerRef.current && canScrollUp) {
      navContainerRef.current.scrollBy({ top: -80, behavior: 'smooth' });
    }
  };
  const scrollNavDown = () => {
    if (navContainerRef.current && canScrollDown) {
      navContainerRef.current.scrollBy({ top: 80, behavior: 'smooth' });
    }
  };

  // 点击左侧缩略图，平滑滚动到主区域对应图片
  const handleNavClick = (index: number) => {
    const target = itemRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 切换选中状态
  const toggleSelect = (id: string) => {
    setSelectedQualities((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter((q) => q !== id);
      } else if (prev.length < maxSelections) {
        return [...prev, id];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] relative flex flex-col items-center">
      {/* 顶部标题 */}
      <h1 className="text-2xl font-bold mt-8 mb-4 text-center">
        Please select the 4 most suitable qualities from the 8 below
      </h1>

      {/* 母容器：包含居中组件和右侧侧边栏 */}
      <div className="relative w-full">
        {/* 居中组件：包含左侧导航和中间大图区域，宽800px，高652px，gap 16px */}
        <div className="flex w-[800px] h-[652px] gap-4 mx-auto">
          {/* 左侧导航 */}
          <div
            className="hidden md:flex flex-col items-center bg-white p-2 shadow-sm sticky top-8"
            style={{ width: '200px', height: '100%' }}
          >
            <div className="mb-2 text-center">
              <p className="font-semibold mt-2">8 / {selectedQualities.length}</p>
              <p className="font-semibold">Selected</p>
            </div>

            <button
              className={`p-2 ${canScrollUp ? 'text-black' : 'text-gray-300'}`}
              onClick={scrollNavUp}
              disabled={!canScrollUp}
            >
              <IoIosArrowUp size={20} />
            </button>

            <div
              ref={navContainerRef}
              className="flex flex-col items-center gap-3 overflow-auto"
              style={{ height: 'calc(100% - 120px)', width: '100%' }}
            >
              {qualities.map((item, index) => {
                const isActive = index === activeIndex;
                const isSelected = selectedQualities.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNavClick(index)}
                    className={`relative w-20 h-14 cursor-pointer border ${
                      isActive ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <Image src={item.imageSrc} alt={item.title} fill className="object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white text-xl font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className={`p-2 ${canScrollDown ? 'text-black' : 'text-gray-300'}`}
              onClick={scrollNavDown}
              disabled={!canScrollDown}
            >
              <IoIosArrowDown size={20} />
            </button>
          </div>

          {/* 中间大图区域 */}
          <div ref={mainContentRef} className="flex-1 overflow-y-auto space-y-8 bg-white shadow-sm p-4">
            {qualities.map((item, index) => {
              const isSelected = selectedQualities.includes(item.id);
              return (
                <div
                  key={item.id}
                  data-index={index}
                  ref={(el) => { itemRefs.current[index] = el as HTMLDivElement; }}
                  className="rounded p-4 flex flex-col items-center"
                >
                  <div className="relative w-full h-64 mb-4">
                    <Image src={item.imageSrc} alt={item.title} fill className="object-cover rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors mr-2 ${
                        isSelected
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

        {/* 右侧侧边栏：放在母容器内但不随居中组件一起居中 */}
<div
  className="hidden lg:flex flex-col bg-white shadow-sm absolute p-4"
  style={{ width: '178px', height: '256px', right: '150px', top: 0 }}
>
  {/* 步骤 1：Basic information */}
  <div className="flex">
    {/* 左列：打勾 + 竖线 */}
    <div className="flex flex-col items-center">
      {/* 顶部打勾 */}
      <div className="text-green-500">✔</div>
      {/* 竖线：如果你不想最后一个步骤有竖线，可以在相应步骤去掉 */}
      <div className="border-l border-gray-300 flex-1" />
    </div>
    {/* 右列：步骤文字 + 子步骤 */}
    <div className="ml-2">
      <p className="font-medium text-gray-800">Basic information</p>
      <ul className="pl-4 text-gray-400 text-sm">
        <li>Character 1</li>
        <li>Character 2</li>
      </ul>
    </div>
  </div>

  {/* 步骤 2：Select book content */}
  <div className="flex mt-4">
    {/* 左列：蓝色圆点 + 竖线 */}
    <div className="flex flex-col items-center">
      <div className="w-2 h-2 rounded-full bg-blue-600" />
      <div className="border-l border-gray-300 flex-1" />
    </div>
    {/* 右列：当前步骤文字（蓝色） */}
    <div className="ml-2 text-blue-600 font-semibold">
      Select book content
    </div>
  </div>

  {/* 步骤 3：Preview books */}
  <div className="flex mt-4">
    {/* 左列：灰色空圆点 + 竖线 */}
    <div className="flex flex-col items-center">
      <div className="w-2 h-2 rounded-full border border-gray-400" />
      <div className="border-l border-gray-300 flex-1" />
    </div>
    {/* 右列：灰色文字 */}
    <div className="ml-2 text-gray-400">
      Preview books
    </div>
  </div>
</div>


      </div>
    </div>
  );
}
