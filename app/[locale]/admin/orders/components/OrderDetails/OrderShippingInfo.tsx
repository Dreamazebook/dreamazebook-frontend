'use client';

import { OrderDetail, ShippingOption } from '@/app/[locale]/(website)/checkout/components/types';
import DisplayPrice from '@/app/[locale]/(website)/components/component/DisplayPrice';

interface OrderShippingInfoProps {
  order: OrderDetail;
}

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  let shippingOption:ShippingOption|undefined = undefined;
  if (order.shipping_options) {
    shippingOption = order?.shipping_options.find((option) => option.code === order.shipping_method);
  }
  return (
    <div className="border-t border-gray-200 py-4 mb-6">
      <h4 className="text-md font-medium text-gray-900 mb-3">配送信息</h4>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">配送方式 ({order.shipping_method})</dt>
          <dd className="mt-1 text-sm text-gray-900">{shippingOption?.name || '未设置'}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">配送费用</dt>
          <dd className="mt-1 text-sm text-gray-900">
            <DisplayPrice value={order.shipping_cost} />
          </dd>
        </div>
      </dl>
    </div>
  );
}