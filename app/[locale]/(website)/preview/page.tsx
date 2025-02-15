/** @jsxImportSource react */
'use client';

import React, { useRef } from 'react';
import { create } from 'zustand';
import TopNavBarWithTabs from '../components/TopNavBarWithTabs';
import {
  FaCheck,
  FaUser,
  FaClipboard,
  FaImage,
  FaBookOpen,
  FaGift,
} from 'react-icons/fa';


const useStore = create<{
  activeStep: number;
  activeTab: 'Book preview' | 'Others';
  viewMode: 'single' | 'double';
  dedication: string;
  giver: string;
  editField: 'giver' | 'dedication' | null;
  setActiveStep: (step: number) => void;
  setActiveTab: (tab: 'Book preview' | 'Others') => void;
  setViewMode: (mode: 'single' | 'double') => void;
  setDedication: (dedication: string) => void;
  setGiver: (giver: string) => void;
  setEditField: (field: 'giver' | 'dedication' | null) => void;
}>((set) => ({
  activeStep: 2,
  activeTab: 'Book preview',
  viewMode: 'single',
  dedication:
    ' ',
  giver: ' ',
  editField: null,
  setActiveStep: (step: number) => set({ activeStep: step }),
  setActiveTab: (tab: 'Book preview' | 'Others') => set({ activeTab: tab }),
  setViewMode: (mode: 'single' | 'double') => set({ viewMode: mode }),
  setDedication: (dedication: string) => set({ dedication }),
  setGiver: (giver: string) => set({ giver }),
  setEditField: (field: 'giver' | 'dedication' | null) => set({ editField: field }),
}));

export default function PreviewPageWithTopNav() {
  const {
    activeTab,
    viewMode,
    dedication,
    giver,
    editField,
    setActiveTab,
    setViewMode,
    setDedication,
    setGiver,
    setEditField,
  } = useStore();

  // 为 Others 标签页添加局部状态，用于记录选中的选项
  const [selectedBookCover, setSelectedBookCover] = React.useState<number | null>(null);
  const [selectedBookFormat, setSelectedBookFormat] = React.useState<number | null>(null);
  const [selectedBookWrap, setSelectedBookWrap] = React.useState<number | null>(null);
  const [detailModal, setDetailModal] = React.useState<typeof bookWrapOptions[0] | null>(null);
  // 当前展示图片的索引，用于翻页
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [confirmationDone, setConfirmationDone] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("");


  // 定义 Book Cover 的 4 个选项
  const bookCoverOptions = [
    { id: 1, image: '../book.png', price: 'Free' },
    { id: 2, image: '../book.png', price: '$3.99 USD' },
    { id: 3, image: '../book.png', price: '$3.99 USD' },
    { id: 4, image: '../book.png', price: '$3.99 USD' },
  ];

  const bookFormatOptions = [
    {
      id: 1,
      image: '../format.png',
      title: 'Premium Hardcover',
      price: '$14.99',
      description: 'High-quality hardcover with premium finish.',
    },
    {
      id: 2,
      image: '../format.png',
      title: 'Standard Paperback',
      price: '$9.99',
      description: 'Cost-effective and lightweight paperback.',
    },
    {
      id: 3,
      image: '../format.png',
      title: 'Deluxe Leather Bound',
      price: '$19.99',
      description: 'Luxurious leather-bound edition.',
    },
    {
      id: 4,
      image: '../format.png',
      title: 'Digital Edition',
      price: 'Free',
      description: 'Instant access to your book on digital devices.',
    },
  ];
  
  const bookWrapOptions = [
    {
      id: 1,
      image: '../wrap.png',
      images: ['/wrap-1.png', '/wrap-2.png'],
      title: 'Classic Wrap',
      price: '$4.99',
      description: 'A timeless design with a simple finish.',
      fullDescription: 'Classic Wrap provides a subtle yet elegant cover wrap that suits any book style. It is designed for those who appreciate classic aesthetics with modern functionality.',
    },
    {
      id: 2,
      image: '../wrap.png',
      images: ['/wrap-1.png', '/wrap2-2.png'],
      title: 'Modern Wrap',
      price: '$5.99',
      description: 'A sleek design with modern aesthetics.',
      fullDescription: 'Modern Wrap offers a contemporary look with bold lines and vibrant colors, perfect for those who want their book to stand out with a modern flair.',
    },
  ];
  
  // 处理点击 "View Details" 链接
  const handleViewDetails = (option: typeof bookWrapOptions[0], e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发整个选项的 onClick
    e.stopPropagation();
    setDetailModal(option);
    setCurrentIndex(0);
  };

  // 定义侧边栏各项，并为每个项配置默认图标和完成后的图标
  const sidebarItems = [
    { id: "giverDedication", label: "Giver & Dedication", icon: <FaUser className="mr-2" />, completedIcon: <FaCheck className="mr-2 text-blue-500" /> },
    { id: "confirmation", label: "Confirmation", icon: <FaClipboard className="mr-2" />, completedIcon: <FaCheck className="mr-2 text-blue-500" /> },
    { id: "coverDesign", label: "Cover Design", icon: <FaImage className="mr-2" />, completedIcon: <FaCheck className="mr-2 text-blue-500" /> },
    { id: "bookFormat", label: "Format", icon: <FaBookOpen className="mr-2" />, completedIcon: <FaCheck className="mr-2 text-blue-500" /> },
    { id: "otherGifts", label: "Other Gifts", icon: <FaGift className="mr-2" />, completedIcon: <FaCheck className="mr-2 text-blue-500" /> },
  ];

  // 为每个部分创建 ref（用于滚动定位）
  const giverDedicationRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const coverDesignRef = useRef<HTMLDivElement>(null);
  const bookFormatRef = useRef<HTMLDivElement>(null);
  const otherGiftsRef = useRef<HTMLDivElement>(null);

  // 点击侧边栏项，滚动到对应部分
  const scrollToSection = (sectionId: string) => {
    let ref: React.RefObject<HTMLDivElement | null> | null = null;
    switch(sectionId) {
      case "giverDedication": ref = giverDedicationRef; break;
      case "confirmation": ref = confirmationRef; break;
      case "coverDesign": ref = coverDesignRef; break;
      case "bookFormat": ref = bookFormatRef; break;
      case "otherGifts": ref = otherGiftsRef; break;
      default: break;
    }
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // 各部分的完成状态判断
  const completedSections = {
    giverDedication: giver.trim() !== "" && dedication.trim() !== "",
    confirmation: confirmationDone,
    coverDesign: selectedBookCover !== null,
    bookFormat: selectedBookFormat !== null,
    otherGifts: selectedBookWrap !== null,
  };

  // 点击 Continue 按钮处理：未完成则跳到第一个未完成的部分，否则跳转下一页
  const handleContinue = () => {
    const allComplete = Object.values(completedSections).every(Boolean);
    if (!allComplete) {
      const order = ["giverDedication", "confirmation", "coverDesign", "bookFormat", "otherGifts"];
      const firstIncomplete = order.find(id => !completedSections[id as keyof typeof completedSections]);
      if (firstIncomplete) {
        switch (firstIncomplete) {
          case "giverDedication":
          case "confirmation":
            setActiveTab("Book preview");
            setTimeout(() => {
              scrollToSection(firstIncomplete);
            }, 100);
            break;
          case "coverDesign":
          case "bookFormat":
          case "otherGifts":
            setActiveTab("Others");
            setTimeout(() => {
              scrollToSection(firstIncomplete);
            }, 100);
            break;
          default:
            break;
        }
      }      
    } else {
      alert("All sections complete! Navigating to next page...");
    }
  };

  //寄语
  const MAX_LINES = 10;
  const MAX_CHARS = 300;
  const defaultName = "User"; // 定义 defaultName

  const defaultMessage = `Dear ${defaultName},
  The world is full of wonderful, surprising places to explore. May your days be full of discoveries, adventure and joy!`;

  const [message, setMessage] = React.useState(defaultMessage);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    // 限制行数：按换行符拆分后行数不能超过 MAX_LINES
    const lines = value.split('\n');
    if (lines.length > MAX_LINES) {
      return;
    }

    // 限制字数
    if (value.length > MAX_CHARS) {
      return;
    }

    setMessage(value);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <div className="w-full pt-[12px] px-4 md:mr-[280px] flex flex-col items-center">
        {/* 固定的导航栏 */}
        <div className="fixed top-0 left-0 pt-[12px] px-4 z-50 w-full md:w-[calc(100%-280px)] flex flex-col items-center">
          <div className="w-[95%] mx-auto">
            <TopNavBarWithTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {activeTab === 'Book preview' ? (
          <main className="flex-1 flex flex-col items-center justify-start w-full pt-14">
            <h1 className="text-xl mt-2 mb-4 text-center w-full">Your Book Preview</h1>
            <div className="flex flex-col items-center w-full max-w-3xl">
              <div className="w-full flex justify-center mb-8">
                <img
                  src="../book.png"
                  alt="Book Cover"
                  className="max-w-sm rounded-lg shadow-md"
                  style={{ height: '392px', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div
              className={`w-full max-w-5xl ${
                viewMode === 'double'
                  ? 'flex flex-row justify-center items-stretch mb-8'
                  : 'flex flex-col items-center gap-8 mb-8'
              }`}
            >
              {/* Giver Page */}
              <div ref={giverDedicationRef} className="flex-1 flex flex-col items-center">
                {viewMode === 'double' ? (
                  <div className="w-full relative">
                    <img
                      src="../giver_page.png"
                      alt="Giver Page"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditField('giver')}
                      className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base"
                    >
                      Edit Giver
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-full relative">
                      <img
                        src="../giver_page.png"
                        alt="Giver Page"
                        className="w-full h-auto rounded-lg object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditField('giver')}
                      className="mt-4 text-black py-2 px-4 rounded border border-black"
                    >
                      Edit Giver
                    </button>
                  </>
                )}
              </div>

              {/* Dedication Page */}
              <div className="flex-1 flex flex-col items-center">
                {viewMode === 'double' ? (
                  <div className="w-full relative">
                    <img
                      src="../giver_page.png"
                      alt="Dedication Page"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditField('dedication')}
                      className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base"
                    >
                      Edit Dedication
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-full relative">
                      <img
                        src="../giver_page.png"
                        alt="Dedication Page"
                        className="w-full h-auto rounded-lg object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditField('dedication')}
                      className="mt-4 text-black py-2 px-4 rounded border border-black"
                    >
                      Edit Dedication
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="w-full max-w-5xl mx-auto py-[12px] px-[24px] mb-8 border bg-[#FCF2F2] border-[#222222] rounded-[4px] text-center text-[#222222]">
              The book preview is currently queued for generation, and you are number 7 out of 249 in line.
            </div>

            <div ref={confirmationRef} className="w-full max-w-5xl mx-auto py-[12px] px-[24px] mb-8 border bg-[#FCF2F2] border-[#222222] rounded-[4px] text-center text-[#222222] flex flex-col gap-4">
              <div>
                <p>We will only provide a preview of 7 pages of book content.</p>
                <p>
                  After you pay, we will send the entire book content to you via email for confirmation within 48 hours.
                  Please confirm within 48 hours of receiving the information, otherwise the system will automatically determine.
                </p>
              </div>
              <label className="justify-center inline-flex items-center cursor-pointer h-10">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={confirmationDone}
                  onChange={(e) => setConfirmationDone(e.target.checked)}
                />
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#222222]">
                  {confirmationDone && <FaCheck className="w-3 h-3" />}
                </div>
                <span className="ml-2 text-gray-800 leading-10">I understand and accept</span>
              </label>
            </div>

          </main>
        ) : (
          // Others 标签页内容
          <main className="flex-1 flex flex-col items-center justify-center w-full gap-[64px] pt-14">
            {/* Book Cover Section */}
            <section ref={coverDesignRef} className="w-full mt-2 max-w-3xl mx-auto">
              <h1 className="text-xl text-center mb-2">Book Cover</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred cover design.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookCoverOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBookCover(selectedBookCover === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col items-center cursor-pointer ${
                      selectedBookCover === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <img
                      src={option.image}
                      alt={`Cover ${option.id}`}
                      className="w-full h-auto mb-2"
                    />
                    <div className="flex items-center justify-center space-x-2 w-full py-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                          selectedBookCover === option.id
                            ? 'bg-[#012CCE] border-[#012CCE]'
                            : 'border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {selectedBookCover === option.id && (
                            <svg
                              className="mx-auto"
                              width="12"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 3.5L5 7L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>


                      </span>
                      {/* 右侧价格 */}
                      <span className="text-center">
                        {option.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Book Format Section */}
            <section  ref={bookFormatRef} className="w-full mt-2 max-w-3xl mx-auto">
              <h1 className="text-xl text-center mb-2">Choose a format for your book</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred book format.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookFormatOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBookFormat(selectedBookFormat === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer ${
                      selectedBookFormat === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <img
                      src={option.image}
                      alt={option.title}
                      className="w-full h-auto mb-4"
                    />
                    <h2 className="text-lg font-medium text-center">{option.title}</h2>
                    <p className="text-lg font-medium text-center mb-2">{option.price}</p>
                    <p className="text-sm text-gray-500 text-center mb-4">{option.description}</p>
                    <div className="flex items-center justify-center mt-auto space-x-2 mb-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                          selectedBookFormat === option.id
                            ? 'bg-[#012CCE] border-[#012CCE]'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedBookFormat === option.id && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 3.5L5 7L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* 便签名称，根据选中状态改变 */}
                      <span className="text-center">
                        {selectedBookFormat === option.id
                          ? `${option.title} Selected`
                          : `Select ${option.title}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Book Wrap Section */}
            <section ref={otherGiftsRef} className="w-full mt-2 max-w-3xl mb-8 mx-auto">
              <h1 className="text-xl text-center mb-2">Wrap it up in magic</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred book wrap option.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookWrapOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBookWrap(selectedBookWrap === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer ${
                      selectedBookWrap === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <img
                      src={option.image}
                      alt={option.title}
                      className="w-full h-auto mb-4"
                    />
                    <h2 className="text-lg font-medium text-center">{option.title}</h2>
                    <p className="text-lg font-medium text-center mb-2">{option.price}</p>
                    
                    <a
                      onClick={(e) => handleViewDetails(option, e)}
                      className="text-[#012CCE] inline-flex items-center justify-center gap-x-2 cursor-pointer mb-2"
                    >
                      More Details
                      <svg
                        className="inline-block align-middle"
                        width="18"
                        height="10"
                        viewBox="0 0 18 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 5H17M17 5L12.5 1M17 5L12.5 9"
                          stroke="#012CCE"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                    <p className="text-sm text-gray-500 text-center mb-4">{option.description}</p>
                    <div className="flex items-center justify-center mt-auto space-x-2 mb-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                          selectedBookWrap === option.id
                            ? 'bg-[#012CCE] border-[#012CCE]'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedBookWrap === option.id && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 3.5L5 7L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* 便签名称，根据选中状态改变 */}
                      <span className="text-center">
                        {selectedBookWrap === option.id
                          ? `${option.title} Selected`
                          : `Select ${option.title}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 弹出窗口 */}
            {detailModal && (
              <div className="fixed inset-0 z-50 flex">
                {/* 左侧空白区域，点击关闭弹窗 */}
                <div className="flex-1" onClick={() => setDetailModal(null)}></div>
                {/* 右侧窗口 */}
                <div className="relative w-[400px] bg-white p-[24px] shadow-lg flex flex-col h-full">
                  <div className="relative flex flex-col gap-3">
                    {/* Back 按钮 */}
                    <button
                      onClick={() => setDetailModal(null)}
                      className="absolute inline-flex items-center gap-x-2"
                    >
                      <svg
                        width="17"
                        height="10"
                        viewBox="0 0 17 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17 5H1M1 5L5.5 1M1 5L5.5 9"
                          stroke="#222222"
                        />
                      </svg>
                      <span>Back</span>
                    </button>

                    {/* 图片和控制区域 */}
                    <div className='mt-8 flex flex-col gap-4'>
                      <div>
                        <img
                          src={detailModal.images[currentIndex]}
                          alt={detailModal.title}
                          className="w-full h-auto"
                        />
                        {/* 控制区域 */}
                        <div className="flex items-center justify-center mt-2 gap-[10px]">
                          {/* 左侧翻页按钮 */}
                          <button
                            onClick={() => setCurrentIndex((prev) => prev - 1)}
                            disabled={currentIndex === 0}
                            className="p-2"
                          >
                            <svg
                              width="18"
                              height="10"
                              viewBox="0 0 18 10"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M5 1L1 5M1 5L5 9M1 5H17" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {/* 页码显示 */}
                          <span className="text-sm text-gray-700">
                            {currentIndex + 1} / {detailModal.images.length}
                          </span>
                          {/* 右侧翻页按钮 */}
                          <button
                            onClick={() => setCurrentIndex((prev) => prev + 1)}
                            disabled={currentIndex === detailModal.images.length - 1}
                            className="p-2"
                          >
                            <svg
                              width="18"
                              height="10"
                              viewBox="0 0 18 10"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M13 1L17 5M17 5L13 9M17 5H1" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {/* 详情文本 */}
                      <div>
                        <h2 className="text-xl">{detailModal.title}</h2>
                        <p className="text-gray-600 mt-2">{detailModal.fullDescription}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex gap-6 h-[44px] justify-between">
                    {/* 价格区域 */}
                    <div className="flex items-end gap-3">
                      <span className="text-[#012CCE] items-center text-3xl font-semibold">$320</span>
                      <span className="text-gray-400 line-through">$540</span>
                    </div>
                    <button className="bg-black text-[#F5E3E3] py-2 px-8 rounded">
                      Add to order
                    </button>
                  </div>
                </div>
              </div>
            )} 
          </main>
        )}

        {editField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {editField === 'giver' ? (
              // Giver's name 弹窗
              <div className="bg-white w-[400px] h-[196px] rounded-sm pt-6 pr-6 pb-3 pl-6 flex flex-col gap-9">
                {/* 标题和关闭按钮 */}
                <div className="w-[352px] h-[80px] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Giver's name</h2>
                    <button
                      className="text-xl text-gray-500 hover:text-gray-700"
                      onClick={() => setEditField(null)}
                    >
                      &#x2715;
                    </button>
                  </div>
                  {/* 输入区域 */}
                  <div className="w-full">
                    <textarea
                      value={giver}
                      onChange={(e) => setGiver(e.target.value)}
                      placeholder="Please enter..."
                      className="w-full h-[40px] p-2 border border-[#E5E5E5] rounded placeholder-[#999999] focus:outline-none ring-0"
                    />
                  </div>
                </div>
                {/* 保存按钮 */}
                <div className="flex justify-end">
                  <button
                    className="bg-[#222222] text-[#F5E3E3] py-2 px-4 rounded-sm"
                    onClick={() => setEditField(null)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              // 寄语弹窗
              <div className="bg-white w-[600px] h-[464px] rounded-sm pt-6 pr-6 pb-3 pl-6 flex flex-col gap-7">
                {/* 标题、关闭按钮和填写区域 */}
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Dedication</h2>
                    <button
                      className="text-xl text-gray-500 hover:text-gray-700"
                      onClick={() => setEditField(null)}
                    >
                      &#x2715;
                    </button>
                  </div>
                  <div className="flex text-gray-500 text-sm">
                    <span>
                    There's  10 line limit (inciuding blank lines)
                    </span>
                  </div>
                  <div className="w-full">
                    <textarea
                      rows={10}
                      value={message}
                      onChange={handleMessageChange}
                      placeholder="Please enter your message..."
                      className="w-full p-2 border border-[#E5E5E5] placeholder-[#999999] rounded focus:outline-none ring-0 resize-none"
                    />
                    <div className="flex justify-end space-x-4 text-[#999999] text-sm">
                      <span>
                        {message.length}/{MAX_CHARS} left
                      </span>
                      <span>
                        {message.split('\n').length}/{MAX_LINES} line
                      </span>
                    </div>
                  </div>
                </div>
                {/* 保存按钮 */}
                <div className="flex justify-end">
                  <button
                    className="bg-[#222222] text-[#F5E3E3] py-2 px-4 rounded-sm"
                    onClick={() => setEditField(null)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 右侧侧边栏 */}
      <aside className="hidden md:flex fixed right-0 top-0 h-full w-[280px] bg-white p-[73px]">
        <div className="flex flex-col justify-between h-full">
          {/* 顶部区域：侧边栏条目 */}
          <div className="mx-auto w-[134px] flex flex-col gap-[4px] pt-[24px] pb-[24px]">
            {sidebarItems.map((item, index) => {
              const isActive = activeSection === item.id;
              const isCompleted = completedSections[item.id as keyof typeof completedSections];
              const iconClass = isCompleted
              ? "w-full h-full text-[#012CCE]"
              : isActive
              ? "w-full h-full text-[#012CCE]"
              : "w-full h-full text-[#CCCCCC]";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.id === "giverDedication" || item.id === "confirmation") {
                      setActiveTab("Book preview");
                    } else {
                      setActiveTab("Others");
                    }
                    setTimeout(() => {
                      scrollToSection(item.id);
                    }, 100);
                  }}
                  className={`w-full flex flex-col cursor-pointer ${isActive ? 'font-medium' : 'font-normal'}`}
                >
                  {/* 图标和文本在同一行，左对齐 */}
                  <div className="flex">
                    {/* 图标及竖线容器 */}
                    <div className="flex flex-col items-center">
                      {/* 固定为 24x24 的图标 */}
                      <div className="w-[24px] h-[24px]">
                        {completedSections[item.id as keyof typeof completedSections]
                          ? React.cloneElement(item.completedIcon, { className: iconClass })
                          : React.cloneElement(item.icon, { className: iconClass })}
                      </div>
                      {/* 除最后一项外，图标下方添加灰色竖线 */}
                      {index !== sidebarItems.length - 1 && (
                        <div className="w-px h-[60px] bg-[#CCCCCC] mt-1"></div>
                      )}
                    </div>
                    {/* 文本标签，位于图标右侧并顶端对齐 */}
                    <span className="ml-2 self-start">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto">
            <button
              onClick={handleContinue}
              className="w-full px-6 py-2 bg-[#222222] text-[#F5E3E3] rounded"
            >
              Add to cart
            </button>
          </div>
        </div>
      </aside>

    </div>
  );
}
