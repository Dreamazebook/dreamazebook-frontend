'use client';

import React from 'react';

const BookDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* 左侧：书籍页面图片骨架 */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-0">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-full">
                <div className="relative w-full aspect-[3/4] bg-gray-200 animate-pulse">
                  {/* 骨架占位符 */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：详情信息骨架 */}
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="max-w-xl mx-auto p-12">
            {/* 标题骨架 */}
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
            
            {/* 评分和标签骨架 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* 描述骨架 */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>

            {/* 规格骨架 */}
            <div className="space-y-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              ))}
            </div>

            {/* 价格和按钮骨架 */}
            <div className="flex items-center justify-between gap-8 mb-12">
              <div className="flex items-baseline gap-3">
                <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-11 w-[243px] bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* FAQ 骨架 */}
            <div className="space-y-4 border-gray-200">
              {[...Array(3)].map((_, num) => (
                <div key={num} className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailSkeleton;

