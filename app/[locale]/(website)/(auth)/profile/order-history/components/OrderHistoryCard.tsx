import { formatAddress } from "@/types/address";
import { OrderDetail } from "@/types/order";
import DisplayPrice from "../../../../components/component/DisplayPrice";
import { formatDate } from "@/app/[locale]/admin/orders/utils";
import { Link } from "@/i18n/routing";
import OrderStatusLabel from "../../../../components/component/OrderStatusLabel";
import { ORDER_CHECKOUT_URL, ORDER_SUMMARY_URL } from "@/constants/links";
import { useTranslations } from "next-intl";

const OrderHistoryCard = ({ orderDetail }: { orderDetail: OrderDetail }) => {
  const orderDetailLink =
    orderDetail.payment_status === "paid"
      ? ORDER_SUMMARY_URL(orderDetail.id)
      : ORDER_CHECKOUT_URL(orderDetail.id);
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
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link
              href={orderDetailLink}
              className="text-primary font-medium text-base"
            >
              #{orderDetail.order_number}
            </Link>
            <OrderStatusLabel status={orderDetail.status} />
          </div>
          <DisplayPrice
            value={orderDetail.total_amount}
            style="text-lg font-semibold text-gray-900"
          />
        </div>

        <div className="text-sm text-gray-600 mb-1">
          <span className="text-gray-900">{t("shipTo")}</span>{" "}
          {formatAddress(orderDetail.shipping_address)}
        </div>

        <div className="flex gap-8 text-sm text-gray-600 mb-1">
          <span>
            <span className="text-gray-900">{t("orderDate")}</span>{" "}
            {formatDate(orderDetail.created_at)}
          </span>
          {orderDetail.shipped_at && (
            <span>
              <span className="text-gray-900">{t("deliveryDate")}</span>{" "}
              {formatDate(orderDetail.shipped_at)}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <span className="text-gray-900">{t("qty")}</span>{" "}
          {orderDetail.items?.reduce((sum, item) => sum + item.quantity, 0)}
        </div>

        <div className="flex gap-6">
          {orderDetail.status !== "unpaid" && (
            <>
              <button className="text-blue-600 hover:underline text-sm">
                {t("downloadInvoice")}
              </button>
              <button className="text-blue-600 hover:underline text-sm">
                {t("buySame")}
              </button>
            </>
          )}
          <Link
            href={orderDetailLink}
            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
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
