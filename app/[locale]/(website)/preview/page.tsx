/** @jsxImportSource react */

'use client';

import React from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId'); // 从查询参数获取 bookId

  if (!bookId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl text-red-500">Error: Missing book ID</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <h1 className="text-lg font-semibold text-gray-800">Book preview</h1>
      </div>

      {/* 主内容 */}
      <div className="w-[95vw] sm:w-[60vw] md:w-[40%] mx-auto mt-8">
        {/* 书籍信息 */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Your book for {bookId}</h2>
          <Image
            src="/book-cover-placeholder.png" // 替换为实际的封面图片路径
            alt="Book cover"
            width={200}
            height={300}
            className="rounded shadow"
          />
        </div>

        {/* Dedication 卡片 */}
        <div className="flex justify-between mt-8">
          {/* 左侧卡片 */}
          <div className="bg-white rounded-lg p-4 shadow-sm w-[48%]">
            <p className="text-gray-700 font-medium">Dear xxx & xxx,</p>
            <p className="text-sm text-gray-600 mt-2">
              As you both grow, and change, and head off in different directions, always remember
              that wherever life takes you, you’ll always have each other.
            </p>
            <button className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded">
              赠与人
            </button>
          </div>

          {/* 右侧卡片 */}
          <div className="bg-white rounded-lg p-4 shadow-sm w-[48%]">
            <p className="text-gray-700 font-medium">Dear xxx & xxx,</p>
            <textarea
              defaultValue="As you both grow, and change, and head off in different directions, always remember that wherever life takes you, you’ll always have each other."
              maxLength={200}
              className="w-full mt-2 p-2 border rounded resize-none text-sm text-gray-600"
              rows={5}
            ></textarea>
            <div className="text-right text-sm text-gray-400 mt-1">40/200</div>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Edit Dedication
            </button>
          </div>
        </div>

        {/* 书籍生成进度 */}
        <div className="text-center text-sm text-gray-500 mt-6">
          图书预览正在排队生成中，您当前排在第 <span className="text-gray-700 font-medium">7/249</span> 位
        </div>

        {/* Continue 按钮 */}
        <div className="flex justify-center mt-8">
          <button className="w-1/3 bg-black text-white py-3 rounded hover:bg-gray-800">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
