/** @jsxImportSource react */

'use client';

import React from 'react';
import { create } from 'zustand';
import TopNavBarWithTabs from '../components/TopNavBarWithTabs';

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
  dedication: 'As you both grow, and change, and head off in different directions, always remember that wherever life takes you, you’ll always have each other.',
  giver: 'John Doe',
  editField: null,
  setActiveStep: (step: number) => set({ activeStep: step }),
  setActiveTab: (tab: 'Book preview' | 'Others') => set({ activeTab: tab }),
  setViewMode: (mode: 'single' | 'double') => set({ viewMode: mode }),
  setDedication: (dedication: string) => set({ dedication }),
  setGiver: (giver: string) => set({ giver }),
  setEditField: (field: 'giver' | 'dedication' | null) => set({ editField: field })
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

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <div className="w-full pt-[8px] px-4 md:w-[80%] flex flex-col items-center">
        <div className="pb-[12px] w-[95%] mx-auto">
          <TopNavBarWithTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {activeTab === 'Book preview' ? (
          <main className="flex-1 flex flex-col items-center justify-center w-full">
            <h1 className="text-2xl font-bold mb-4 text-center w-full">Your Book Preview</h1>
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
                  // double-page view：图片宽度自适应，高度由图片自身比例决定
                  <div className="w-full relative">
                    <img
                      src="../giver_page.png"
                      alt="Giver Page"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditField('giver')}
                      className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2
                                text-black rounded border border-black
                                py-2 px-4 text-sm 
                                sm:text-base
                                md:text-base"
                    >
                      Edit Giver
                    </button>
                  </div>
                ) : (
                  // single-page view：图片高度固定，按钮在图片下方
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
                  // double-page view：图片宽度自适应，高度由图片自身比例决定
                  <div className="w-full relative">
                    <img
                      src="../giver_page.png"
                      alt="Dedication Page"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditField('dedication')}
                      className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2
                                text-black rounded border border-black
                                py-2 px-4 text-sm 
                                sm:text-base
                                md:text-base"
                    >
                      Edit Dedication
                    </button>
                  </div>
                ) : (
                  // single-page view：图片高度固定，按钮在图片下方
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
          <main className="flex-1 flex items-center justify-center">
            <h1 className="text-xl font-medium">Other Content</h1>
          </main>
        )}

        {editField && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">{editField === 'giver' ? 'Edit Giver' : 'Edit Dedication'}</h2>
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
