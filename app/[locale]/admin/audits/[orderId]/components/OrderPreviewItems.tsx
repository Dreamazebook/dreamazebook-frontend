'use client';

import { OrderPreviewItem } from '@/types/api';
import { FC, useState } from 'react';
import Image from 'next/image';
import DreamzeImage from '@/app/components/DreamzeImage';

type OrderPreviewItemsProps = {
  items: OrderPreviewItem[];
  previewId?: string | null;
  onApprove: (itemId: number) => void;
  onReject: (itemId: number, reason: string) => void;
};

interface PagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: any[];
  bookTitle: string;
}

const PagesModal: FC<PagesModalProps> = ({ isOpen, onClose, pages, bookTitle }) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-gray-900">{bookTitle}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">共 {pages.length} 页</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Book Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">{bookTitle}</h3>
          </div>

          {/* Page Thumbnails */}
          <div className="grid gap-2 mb-6">
            {pages.map((page, index) => (
              <div key={index} className="relative w-full aspect-[960/487]">
              <DreamzeImage
                src={page.result_image_url || page.image_url}
                alt={`Page ${page.page_number}`}
                cssClass=""
              />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              导入人
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Dedication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderPreviewItems: FC<OrderPreviewItemsProps> = ({
  items,
  previewId,
  onApprove,
  onReject
}) => {
  const [rejectReason, setRejectReason] = useState<string>('');
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderPreviewItem | null>(null);
  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);

  const toggleExpand = (itemId: number) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const handleViewPages = (item: OrderPreviewItem) => {
    setSelectedItem(item);
    setIsPagesModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPagesModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">订单项 ({items.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.item_id} className="px-6 py-4 cursor-pointer hover:bg-gray-50" onClick={() => handleViewPages(item)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.pages[0]?.image_url && (
                        <img 
                          className="h-16 w-16 rounded-md object-cover" 
                          src={item.pages[0].image_url} 
                          alt={item.picbook.name} 
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.picbook.name}</h4>
                      <p className="text-sm text-gray-500">
                        角色: {item.character_info.full_name} ({item.character_info.language})
                      </p>
                      <p className="text-sm text-gray-500">
                        状态: {item.processing_info.status}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        点击查看 {item.pages.length} 页预览
                      </p>
                    </div>
                  </div>
                  
                  {/* <button 
                    onClick={() => toggleExpand(item.item_id)}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {expandedItem === item.item_id ? '收起详情' : '查看详情'}
                  </button> */}
                  
                  {/* {expandedItem === item.item_id && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">个性化设置</h5>
                        <p className="text-sm text-gray-500">
                          收件人: {item.personalization.recipient_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          留言: {item.personalization.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          封面类型: {item.personalization.cover_type}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">页面预览</h5>
                        <div className="grid gap-2 mt-2">
                          {item.pages.map((page) => (
                            <div key={page.page_id} className="border rounded-md p-2">
                              <img 
                                src={page.result_image_url || page.image_url} 
                                alt={`Page ${page.page_number}`}
                                className="w-full h-auto"
                              />
                              <p className="text-xs text-center mt-1">
                                第 {page.page_number} 页
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
                
                {previewId && (
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onApprove(item.item_id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      通过
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveItemId(item.item_id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
              
              {activeItemId === item.item_id && (
                <div className="mt-4 flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请输入拒绝原因"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onReject(item.item_id, rejectReason);
                      setRejectReason('');
                      setActiveItemId(null);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    确认拒绝
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pages Modal */}
      {selectedItem && (
        <PagesModal
          isOpen={isPagesModalOpen}
          onClose={handleCloseModal}
          pages={selectedItem.pages}
          bookTitle={selectedItem.picbook.name}
        />
      )}
    </>
  );
};

export default OrderPreviewItems;