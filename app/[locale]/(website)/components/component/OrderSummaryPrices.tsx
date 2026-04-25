import { OrderDetail, getBooksCountFromOrder } from "@/types/order";
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
  const numberItems = getBooksCountFromOrder(orderDetail) || 1;

  return (
    <div className="pt-4 space-y-2 text-[16px] text-[#666666]">
      <div className="flex justify-between">
        <p className="">Subtotal ({numberItems} {numberItems && numberItems > 1 ? 'books' : 'book'})</p>
        <DisplayPrice value={subtotal} />
      </div>
      <div className="flex justify-between">
        <p className="">Shipping</p>
        <DisplayPrice value={shippingCost} />
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-[#16A34A]">
          {order?.discount_details?.description && (
            <div className="">
              {numberItems>1?t('multiBookDiscount'):t('discount')}{` (${order.discount_details.percentage}%)`}
            </div>
          )}
          <DisplayPrice style="text-primary font-bold" value={-discount} />
        </div>

      )}
      <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
        <p>Total</p>
        <DisplayPrice value={total} />
      </div>
    </div>
  );
};

export default OrderSummaryPrices;