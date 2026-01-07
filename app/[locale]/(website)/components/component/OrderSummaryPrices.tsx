import { OrderDetail } from "@/types/order";
import {useTranslations} from 'next-intl'
import DisplayPrice from "./DisplayPrice";

interface OrderSummaryPricesProps {
  orderDetail: OrderDetail;
}

const OrderSummaryPrices = ({ orderDetail }: OrderSummaryPricesProps) => {
  const t = useTranslations('ShoppingCart');
  const order = orderDetail;
  const total = order?.total_amount || 0;
  const shippingCost = order?.shipping_cost || 0;
  const subtotal = total - shippingCost;
  const discount = order?.discount_amount || 0;
  const numberItems = order?.items?.length || 0;

  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <p className="text-[#666666]">Subtotal ({numberItems} {numberItems > 1 ? 'items' : 'item'})</p>
        <DisplayPrice value={subtotal} />
      </div>
      <div className="flex justify-between text-sm">
        <p className="text-[#666666]">Shipping</p>
        <DisplayPrice value={shippingCost} />
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-[#abd29b]">
          {order?.discount_details?.description && (
            <div className="">
              {t('multiBookDiscount')}{` (${order.discount_details.percentage}%)`}
            </div>
          )}
          <DisplayPrice value={-discount} />
        </div>

      )}
      <div className="flex justify-between text-base pt-2 border-t border-gray-200">
        <p>Total</p>
        <DisplayPrice value={total} />
      </div>
    </div>
  );
};

export default OrderSummaryPrices;