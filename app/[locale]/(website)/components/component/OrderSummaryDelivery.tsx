import { formatAddress } from "@/types/address";
import { formatDate, OrderDetail } from "@/types/order";
import { useTranslations } from 'next-intl';

const OrderHistoryTextStyle = ({ label, value }: any) => {
  return (
    <div className="flex gap-[12px]">
      <span className="text-[#999999]">{label}</span>
      {value}
    </div>
  );
};
interface OrderSummaryDeliveryProps {
  orderDetail: OrderDetail;
  showShipTo?: boolean;
  showDate?: boolean;
  bgColor?: string;
  handleClickEditShippingAddress?: () => void;
}

const OrderSummaryDelivery = ({ orderDetail, handleClickEditShippingAddress, showDate = true, showShipTo = true, bgColor = 'bg-[#F8F8F8]' }: OrderSummaryDeliveryProps) => {
  const t = useTranslations('orderSummaryDelivery');

  return (
    <div className={`text-[#222] mb-4 p-3 space-y-3 ${bgColor}`}>

      {showShipTo && (
        <div className="flex items-center gap-[12px]">
        <OrderHistoryTextStyle
          label={t("shipTo")}
          value={formatAddress(orderDetail.shipping_address)}
        />
        {orderDetail.permissions.can_update_address_except_country && handleClickEditShippingAddress && 
          <button className="text-primary cursor-pointer" onClick={handleClickEditShippingAddress}>Edit</button>
        }
        </div>
      )}

      {showDate &&
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
      </div>}

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
