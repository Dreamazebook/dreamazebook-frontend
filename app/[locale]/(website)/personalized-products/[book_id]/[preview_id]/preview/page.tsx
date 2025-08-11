'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function PreviewPersonalizedProductPage() {
  const params = useParams();
  const bookId = params.book_id as string;
  const previewId = params.preview_id as string;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Preview Your Personalized Book</h1>
      {/* 这里将迁移原有的 preview 页面内容 */}
      <div>Book ID: {bookId}</div>
      <div>Preview ID: {previewId}</div>
    </div>
  );
}