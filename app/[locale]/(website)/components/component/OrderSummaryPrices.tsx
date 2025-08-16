import { OrderDetailResponse } from "../../checkout/components/types";
import DisplayPrice from "./DisplayPrice";

interface OrderSummaryPricesProps {
  orderDetail: OrderDetailResponse;
}

const OrderSummaryPrices = ({orderDetail}:OrderSummaryPricesProps) => {
  const order = orderDetail.order;
  const total = order?.total_amount || 0;
  const shippingCost = order?.shipping_cost || 0;
  const subtotal = total - shippingCost;
  const discount = 0; // No discount in the original code

  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <p>Subtotal</p>
        <DisplayPrice value={subtotal} />
      </div>
      <div className="flex justify-between text-sm">
        <p>Shipping</p>
        <DisplayPrice value={shippingCost} />
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <p>Discount</p>
          <DisplayPrice value={-discount} />
        </div>
      )}
      <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
        <p>Total</p>
        <DisplayPrice value={total} />
      </div>
    </div>
  );
};

export default OrderSummaryPrices;