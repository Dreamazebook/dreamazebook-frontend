import { formatAddress } from "@/types/address";
import { formatDate, OrderDetail } from "@/types/order";
import { useTranslations } from 'next-intl';

interface OrderSummaryDeliveryProps {
  orderDetail: OrderDetail;
}

const OrderSummaryDelivery = ({ orderDetail }: OrderSummaryDeliveryProps) => {
  const { shipping_address, updated_at } = orderDetail;
  const t = useTranslations('orderSummaryDelivery');

  return (
    <div className="text-lg text-[#222] mb-4 bg-[#F8F8F8] p-3 space-y-3">
      <div>
        <span className="font-medium text-[#999] mr-4">{t("shipTo")}</span>{" "}
        {formatAddress(shipping_address)}
      </div>

      <div className="grid grid-cols-2">
        <div>
          <span className="font-medium text-[#999] mr-4">{t("orderDate")}</span>{" "}
          {formatDate(updated_at)}
        </div>

        <div>
          <span className="font-medium text-[#999] mr-4">{t("deliveryDate")}</span>{" "}
        </div>
      </div>
      <div>
        <span className="font-medium text-[#999] mr-4">{t("qty")}</span>{" "}
        {orderDetail.items.length}
      </div>
    </div>
  );
};

export default OrderSummaryDelivery;
