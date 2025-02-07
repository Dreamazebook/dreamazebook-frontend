/** @jsxImportSource react */
'use client';

import React from 'react';
import { create } from 'zustand';
import TopNavBarWithTabs from '../components/TopNavBarWithTabs';
import { FaCheck } from 'react-icons/fa';


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
  activeTab: 'Others',
  viewMode: 'single',
  dedication:
    'As you both grow, and change, and head off in different directions, always remember that wherever life takes you, you’ll always have each other.',
  giver: 'John Doe',
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
  const [selectedBookWrap, setSelectedBookWrap] = React.useState<string>('');

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
    { id: 1, image: '../wrap1.png', price: '$19.99 USD' },
    { id: 2, image: '../wrap2.png', price: '$19.99 USD' },
    { id: 3, image: '../wrap3.png', price: '$19.99 USD' },
    { id: 4, image: '../wrap4.png', price: '$19.99 USD' },
  ];
  

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <div className="w-full pt-[12px] px-4 md:w-[80%] flex flex-col items-center">
        <div className="pb-[12px] w-[95%] mx-auto">
          <TopNavBarWithTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {activeTab === 'Book preview' ? (
          <main className="flex-1 flex flex-col items-center justify-start w-full">
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
              <div className="flex-1 flex flex-col items-center">
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
            <div className="w-full max-w-5xl mx-auto p-[12px_24px] mb-8 border bg-[#FCF2F2] border-[#222222] rounded-[4px] text-center text-[#222222]">
              The book preview is currently queued for generation, and you are number 7 out of 249 in line.
            </div>
          </main>
        ) : (
          // Others 标签页内容
          <main className="flex-1 flex flex-col items-center justify-center w-full">
            {/* Book Cover Section */}
            <section className="w-full mt-2 max-w-3xl mb-8 mx-auto">
              <h1 className="text-xl text-center mb-2">Book Cover</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred cover design.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookCoverOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBookCover(option.id)}
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
                      {/* 右侧显示价格 */}
                      <span className="text-center">{option.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Book Format Section */}
            <section className="w-full mt-2 max-w-3xl mb-8 mx-auto">
              <h1 className="text-xl text-center mb-2">Book Format</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred book format.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookFormatOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBookFormat(option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer ${
                      selectedBookFormat === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <img
                      src={option.image}
                      alt={option.title}
                      className="w-full h-auto mb-2"
                    />
                    <h2 className="text-lg font-bold">{option.title}</h2>
                    <p className="text-gray-600 mb-1">{option.price}</p>
                    <p className="text-sm text-gray-500 mb-2">{option.description}</p>
                    <div className="flex items-center space-x-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 border rounded-full ${
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
            <section className="w-full max-w-3xl mb-8">
              <h1 className="text-xl text-center mb-2">Book Wrap</h1>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedBookWrap('None')}
                  className={`py-2 px-4 rounded ${
                    selectedBookWrap === 'None'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBookWrap('Gift Wrap')}
                  className={`py-2 px-4 rounded ${
                    selectedBookWrap === 'Gift Wrap'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  Gift Wrap
                </button>
              </div>
            </section>
          </main>
        )}

        {editField && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">
                {editField === 'giver' ? 'Edit Giver' : 'Edit Dedication'}
              </h2>
              {editField === 'giver' ? (
                <input
                  type="text"
                  value={giver}
                  onChange={(e) => setGiver(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <textarea
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  className="w-full h-40 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                onClick={() => setEditField(null)}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
