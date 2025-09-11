'use client';

import { OrderDetail } from '@/app/[locale]/(website)/checkout/components/types';
import DisplayPrice from '@/app/[locale]/(website)/components/component/DisplayPrice';
import Image from 'next/image';

interface OrderItemsListProps {
  items: OrderDetail['items'];
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="border-t border-gray-200 py-4 mb-6">
      <h4 className="text-md font-medium text-gray-900 mb-3">订单商品</h4>
      <div className="space-y-3">
        {items?.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={item.picbook.default_cover}
                alt={item.picbook.default_name}
                width={64}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{item.picbook_name}</h5>
              <p className="text-sm text-gray-600">{item.name}</p>
              {item.format && <p className="text-sm text-gray-500">格式: {item.format}</p>}
              {item.box && <p className="text-sm text-gray-500">包装: {item.box}</p>}
              <p className="text-sm text-gray-500">数量: {item.quantity}</p>
              <p className="text-sm text-gray-500">状态: {item.status || '未设置'}</p>
              <p className="text-sm text-gray-500">处理进度: {item.processing_progress}</p>
              {item.message && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">留言:</span> {item.message}
                </p>
              )}
            </div>
            <div className="text-right">
              <DisplayPrice value={item.price} style="text-sm font-medium" />
              <p className="text-xs text-gray-500">单价</p>
              <DisplayPrice value={item.total_price} style="text-sm font-bold" />
              <p className="text-xs text-gray-500">小计</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}