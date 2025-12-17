import { formatAddress } from "@/types/address";
import { OrderDetail } from "@/types/order";
import DisplayPrice from "../../../../components/component/DisplayPrice";
import { formatDate } from "@/app/[locale]/admin/orders/utils";
import { Link } from "@/i18n/routing";
import OrderStatusLabel from "../../../../components/component/OrderStatusLabel";
import { ORDER_CHECKOUT_URL, ORDER_SUMMARY_URL } from "@/constants/links";
import useOrderStatus from "../../../../hooks/useOrderStatus";
import { useTranslations } from "next-intl";

const OrderHistoryTextStyle = ({label, value}:any) => {
  return (
    <div className="mb-1 flex gap-[12px]">
      <span className="text-[#999999]">{label}</span>
      {value}
    </div>
  )
}

const OrderHistoryCard = ({ orderDetail }: { orderDetail: OrderDetail }) => {
  const orderDetailLink =
    orderDetail.payment_status === "paid"
      ? ORDER_SUMMARY_URL(orderDetail.id)
      : ORDER_CHECKOUT_URL(orderDetail.id);
  
  // Get order status to determine if editing is allowed
  const { orderStatus } = useOrderStatus(orderDetail.status || '');
  
  // Check if order status allows editing shipping address
  const canEditShippingAddress = orderStatus === 'processing' || orderStatus === 'pending';
  
  const t = useTranslations("orderHistoryCard");
  return (
    <div className="flex gap-4 py-4">
      {/* Product Images */}
      <div className="flex-shrink-0">
        {/* {orderDetail.images ? (
          <div className="relative">
            <img
              src={orderDetail.images[0]}
              alt="Product"
              className="w-20 h-20 object-cover"
            />
            <img
              src={orderDetail.images[1]}
              alt="Product"
              className="w-20 h-20 object-cover absolute -right-4 -bottom-4"
            />
            <div className="absolute -right-6 -bottom-2 text-sm text-gray-500">
              {orderDetail.extraCount}
            </div>
          </div>
        ) : (
          <img
            src={orderDetail.image}
            alt="Product"
            className="w-20 h-20 object-cover"
          />
        )} */}
      </div>

      {/* Order Details */}
      <div className="flex-1 text-[16px]">
        <div className="flex justify-between items-start mb-2 flex-wrap">
          <div className="flex items-center gap-[12px]">
            <Link
              href={orderDetailLink}
              className="text-[#222] font-medium text-[18px]"
            >
              #{orderDetail.order_number}
            </Link>
            <OrderStatusLabel status={orderDetail.status} />
          </div>
          <DisplayPrice
            value={orderDetail.total_amount}
            style="text-[18px] font-medium"
          />
        </div>

        <OrderHistoryTextStyle label={t('shipTo')} value={formatAddress(orderDetail.shipping_address)} />

        <div className="flex gap-[12px] mb-1">
          
          <OrderHistoryTextStyle label={t('orderDate')} value={formatDate(orderDetail.created_at)} />

          {orderDetail.shipped_at && (
            <OrderHistoryTextStyle label={t('deliveryDate')} value={formatDate(orderDetail.shipped_at)} />
          )}
        </div>

        <OrderHistoryTextStyle label={t('qty')} value={orderDetail.items?.reduce((sum, item) => sum + item.quantity, 0)} />

        <div className="flex gap-[32px] font-[16px]">
          {orderDetail.status === "delivered" && (
            <button className="text-blue-600 hover:underline text-sm">
              {t("downloadInvoice")}
            </button>
          )}
          
          {/* Edit Shipping Address link - only show for orders that can be edited */}
          {canEditShippingAddress && (
            <Link
              href={ORDER_CHECKOUT_URL(orderDetail.id)}
              className="text-primary hover:underline flex items-center gap-1"
            >
              {t("editShippingAddress")}
            </Link>
          )}
          
          <Link
            href={orderDetailLink}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {orderDetail.status === "unpaid"
              ? t("continueToPay")
              : t("moreDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryCard;
