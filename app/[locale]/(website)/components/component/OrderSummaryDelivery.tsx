import { formatAddress } from "@/types/address";
import { formatDate, OrderDetail } from "@/types/order";
import { useTranslations } from 'next-intl';

const OrderHistoryTextStyle = ({ label, value }: any) => {
  return (
    <div className="mb-1 flex gap-[12px]">
      <span className="text-[#999999]">{label}</span>
      {value}
    </div>
  );
};
interface OrderSummaryDeliveryProps {
  orderDetail: OrderDetail;
  showShipTo?: boolean;
  bgColor?: string
}

const OrderSummaryDelivery = ({ orderDetail, showShipTo = true, bgColor = 'bg-[#F8F8F8]' }: OrderSummaryDeliveryProps) => {
  const t = useTranslations('orderSummaryDelivery');

  return (
    <div className={`text-[#222] mb-4 p-3 space-y-3 ${bgColor}`}>

      {showShipTo && (
        <OrderHistoryTextStyle
          label={t("shipTo")}
          value={formatAddress(orderDetail.shipping_address)}
        />
      )}

      <div className="flex gap-[12px] mb-1">
        <OrderHistoryTextStyle
          label={t("orderDate")}
          value={formatDate(orderDetail.created_at)}
        />

        {orderDetail.shipped_at && (
          <OrderHistoryTextStyle
            label={t("deliveryDate")}
            value={formatDate(orderDetail.shipped_at)}
          />
        )}
      </div>

      <OrderHistoryTextStyle
          label={t("qty")}
          value={orderDetail.items?.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}
        />
    </div>
  );
};

export default OrderSummaryDelivery;
