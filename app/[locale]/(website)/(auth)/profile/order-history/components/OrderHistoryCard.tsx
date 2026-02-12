import { formatAddress } from "@/types/address";
import { OrderDetail } from "@/types/order";
import DisplayPrice from "../../../../components/component/DisplayPrice";
import { formatDate } from "@/app/[locale]/admin/orders/utils";
import { Link } from "@/i18n/routing";
import OrderStatusLabel from "../../../../components/component/OrderStatusLabel";
import { ORDER_CHECKOUT_URL, ORDER_SUMMARY_URL } from "@/constants/links";
import useOrderStatus from "../../../../hooks/useOrderStatus";
import { useTranslations } from "next-intl";
import OrderSummaryDelivery from "@/app/[locale]/(website)/components/component/OrderSummaryDelivery";
import StripeReceiptLink from "@/app/[locale]/(website)/components/component/StripeReceiptLink";

const OrderHistoryCard = ({ orderDetail,showStatus,openModal,openAddressModal }: { orderDetail: OrderDetail,showStatus:Boolean, openModal:(orderDetail:OrderDetail)=>void, openAddressModal:(orderDetail:OrderDetail)=>void }) => {
  const orderDetailLink =
    orderDetail.payment_status === "paid"
      ? ORDER_SUMMARY_URL(orderDetail.id)
      : ORDER_CHECKOUT_URL(orderDetail.id);

  const t = useTranslations("orderHistoryCard");
  return (
    <div className="flex gap-4 p-[12px] md:py-[16px] md:px-[24px] bg-white">

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
            {showStatus && <OrderStatusLabel status={orderDetail.status} />}
          </div>
          <DisplayPrice
            value={orderDetail.total_amount}
            style="text-[18px] font-medium"
          />
        </div>

        <OrderSummaryDelivery
          bgColor="bg-white"
          showShipTo={false}
          orderDetail={orderDetail}
          noPadding={true}
          showStatusText={true}
          handleClickEditShippingAddress={openAddressModal ? () => openAddressModal(orderDetail) : undefined}
        />

        <div className="flex gap-[32px] font-[16px]">
          <StripeReceiptLink
            stripeReceiptUrl={orderDetail.stripe_receipt_url}
            variant="link"
          />

          {/* Edit Shipping Address link - only show for orders that can be edited */}
          {orderDetail.permissions.can_update_address_except_country && (
            <button
              className="cursor-pointer text-primary hover:underline flex items-center gap-1"
              onClick={()=>openAddressModal(orderDetail)}
            >
              {t("editShippingAddress")}
            </button>
          )}

          {orderDetail.permissions.can_pay ?
          <button className="cursor-pointer text-primary hover:underline" onClick={()=>openModal(orderDetail)}>
            {t("continueToPay")}
          </button>
          :
          <Link
            href={orderDetailLink}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {t("moreDetails")}
          </Link>
          }
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryCard;
