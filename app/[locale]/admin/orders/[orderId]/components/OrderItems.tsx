'use client';

import { FC } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { OrderDetail } from '../../../../(website)/checkout/components/types';
import { formatCurrency } from '../../utils';
import ResultImagesModal from './ResultImagesModal';
import DisplayPrice from '@/app/[locale]/(website)/components/component/DisplayPrice';

interface OrderItemsProps {
  order: OrderDetail;
}

const OrderItems: FC<OrderItemsProps> = ({ order }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewImages = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">订单商品</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {order.items?.map((item) => (
          <div key={item.id} className="p-6 cursor-pointer hover:bg-gray-50" onClick={() => handleViewImages(item)}>
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.picbook.default_cover}
                    alt={item.picbook.default_name}
                    width={80}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900 mb-1">
                      {item.picbook_name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{item.name}</p>
                    
                    {item.format && (
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <span className="font-medium mr-2">格式:</span>
                        <span>{item.format}</span>
                      </div>
                    )}
                    
                    {item.box && (
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <span className="font-medium mr-2">包装:</span>
                        <span>{item.box}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <span className="font-medium mr-2">数量:</span>
                      <span>{item.quantity}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <span className="font-medium mr-2">状态:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {item.status || '未设置'}
                      </span>
                    </div>

                    {item.processing_progress !== undefined && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="font-medium mr-2">处理进度:</span>
                        <div className="flex-1 max-w-xs">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.processing_progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 mt-1">{item.processing_progress}%</span>
                        </div>
                      </div>
                    )}

                    {item.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">客户留言:</span>
                        <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                      </div>
                    )}

                    {item.result_images && item.result_images.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-blue-600">
                          点击查看 {item.result_images.length} 张结果图片
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-500 mb-1">单价</div>
                    <DisplayPrice value={item.price} style='text-sm font-medium text-gray-900 mb-2' />
                    <div className="text-sm text-gray-500 mb-1">小计</div>
                    <DisplayPrice value={item.total_price} style='text-sm font-medium text-gray-900 mb-2' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Total */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-900">
            商品总计 ({order.items?.length || 0} 件)
          </span>
          <DisplayPrice value={order.total_amount - order.shipping_cost - order.tax_amount + order.discount_amount} style='text-lg font-semibold text-gray-900' />
        </div>
      </div>
      </div>

      {/* Result Images Modal */}
      <ResultImagesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={selectedItem?.result_images || []}
        itemName={selectedItem?.picbook_name || ''}
      />
    </>
  );
};

export default OrderItems;