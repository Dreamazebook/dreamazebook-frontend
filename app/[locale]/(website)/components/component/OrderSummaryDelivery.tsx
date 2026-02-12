import { formatAddress } from "@/types/address";
import { formatDate, OrderDetail, getBooksCountFromOrder } from "@/types/order";
import { useTranslations } from 'next-intl';
import OrderTitle from "../../(orders)/order-summary/components/OrderTitle";
import { getOurBookDisplayName } from "@/utils/bookNames";

const OrderHistoryTextStyle = ({ label, value }: any) => {
  return (
    <div className="flex gap-[4px]">
      <span className="text-[#999999]">{label}:</span>
      {value}
    </div>
  );
};
interface OrderSummaryDeliveryProps {
  orderDetail: OrderDetail;
  showShipTo?: boolean;
  showDate?: boolean;
  bgColor?: string;
  noPadding?: boolean;
  showStatusText?: boolean;
  handleClickEditShippingAddress?: () => void;
}

const OrderSummaryDelivery = ({ orderDetail, noPadding=false, showStatusText, handleClickEditShippingAddress, showDate = true, showShipTo = true, bgColor = 'bg-[#F8F8F8]' }: OrderSummaryDeliveryProps) => {
  const t = useTranslations('orderSummaryDelivery');

  return (
    <div className={`text-[#222] mb-4 ${noPadding?'':'p-3'} space-y-3 ${bgColor}`}>

      {orderDetail?.items?.length > 0 && 
        <div>
          {orderDetail.items.map((item)=>
            <OrderHistoryTextStyle key={item.id} label={getOurBookDisplayName(item?.spu?.spu_code)} value={`| ${item?.customization_data?.full_name || ''}`} />
          )}
        </div>
      }

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

      <OrderHistoryTextStyle label={t('books')} value={getBooksCountFromOrder(orderDetail)} />

      {showStatusText && (orderDetail.status != 'unpaid') && 
        <div className="text-[#999999] text-[16px]">
        <OrderTitle status={orderDetail.status} />
        </div>}
    </div>
  );
};

export default OrderSummaryDelivery;
