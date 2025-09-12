'use client';

import { FC } from 'react';
import Image from 'next/image';
import { DetailedBook } from '@/types/book';
import { formatDate } from '../../orders/utils';

interface PicbookDetailModalProps {
  picbook: DetailedBook;
  onClose: () => void;
}

const PicbookDetailModal: FC<PicbookDetailModalProps> = ({ picbook, onClose }) => {
  const getStatusColor = (status: number) => {
    switch(status) {
      case 1: return 'bg-green-100 text-green-800';
      case 0: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: number) => {
    switch(status) {
      case 1: return '活跃';
      case 0: return '非活跃';
      default: return '未知';
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 bg-black/60">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">图书详情</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cover Image */}
              <div className="flex justify-center">
                <div className="w-48 h-64 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={picbook.default_cover}
                    alt={picbook.default_name}
                    width={192}
                    height={256}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              </div>

              {/* Book Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{picbook.default_name}</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(picbook.status)}`}>
                    {getStatusLabel(picbook.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">价格：</span>
                    <span className="text-gray-900 font-medium">
                      {picbook.pricesymbol}{picbook.price} {picbook.currencycode}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">评分：</span>
                    <span className="text-gray-900">{picbook.rating}/5</span>
                  </div>
                  <div>
                    <span className="text-gray-500">总页数：</span>
                    <span className="text-gray-900">{picbook.total_pages}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">预览页数：</span>
                    <span className="text-gray-900">{picbook.preview_pages_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">角色数量：</span>
                    <span className="text-gray-900">{picbook.character_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">创建时间：</span>
                    <span className="text-gray-900">{formatDate(picbook.created_at)}</span>
                  </div>
                </div>

                {/* Description */}
                {picbook.variant?.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">描述</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {picbook.variant.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supported Languages */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">支持语言</h4>
                <div className="flex flex-wrap gap-2">
                  {picbook.supported_languages?.map((lang) => (
                    <span key={lang} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Features */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">互动功能</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${picbook.has_choices ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-gray-600">选择功能：</span>
                    <span className="text-gray-900 ml-1">{picbook.has_choices ? '是' : '否'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${picbook.has_question ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-gray-600">问题功能：</span>
                    <span className="text-gray-900 ml-1">{picbook.has_question ? '是' : '否'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {picbook.tags && picbook.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {picbook.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Summary */}
            {picbook.reviews && picbook.reviews.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">评价概览</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">总评价数：</span>
                    <span className="text-sm font-medium text-gray-900">{picbook.reviews.length}</span>
                  </div>
                  <div className="space-y-2">
                    {picbook.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">{review.rating}</span>
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              关闭
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              编辑图书
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PicbookDetailModal;