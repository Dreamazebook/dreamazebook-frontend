import { formatAddress } from "@/types/address";
import { formatDate, OrderDetail } from "../../checkout/components/types";

interface OrderSummaryDeliveryProps {
  orderDetail: OrderDetail;
}

const OrderSummaryDelivery = ({ orderDetail }: OrderSummaryDeliveryProps) => {
  const { shipping_address, updated_at } = orderDetail;

  return (
    <div className="text-lg text-[#222] mb-4 bg-[#F8F8F8] p-3 space-y-3">
      <div>
        <span className="font-medium text-[#999] mr-4">Ship to</span>{" "}
        {formatAddress(shipping_address)}
      </div>

      <div className="grid grid-cols-2">
        <div>
          <span className="font-medium text-[#999] mr-4">Order date</span>{" "}
          {formatDate(updated_at)}
        </div>

        <div>
          <span className="font-medium text-[#999] mr-4">Delivery date</span>{" "}
        </div>
      </div>
      <div>
        <span className="font-medium text-[#999] mr-4">Qty</span>{" "}
        {orderDetail.items.length}
      </div>
    </div>
  );
};

export default OrderSummaryDelivery;
