import { formatAddress } from "@/types/address";
import { OrderDetail } from "../../../checkout/components/types";
import DisplayPrice from "../../../components/component/DisplayPrice";
import { formatDate } from "@/app/[locale]/admin/orders/utils";
import { Link } from "@/i18n/routing";
import OrderStatusLabel from "../../../components/component/OrderStatusLabel";

const OrderHistoryCard = ({orderDetail}:{orderDetail:OrderDetail}) => {
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
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-medium text-base">#{orderDetail.order_number}</span>
            <OrderStatusLabel status={orderDetail.status} />
          </div>
          <DisplayPrice value={orderDetail.total_amount} style='text-lg font-semibold text-gray-900' />
        </div>

        <div className="text-sm text-gray-600 mb-1">
          <span className="text-gray-900">Ship to:</span> {formatAddress(orderDetail.shipping_address)}
        </div>

        <div className="flex gap-8 text-sm text-gray-600 mb-1">
          <span><span className="text-gray-900">Order date:</span> {formatDate(orderDetail.created_at)}</span>
          {orderDetail.updated_at && (
            <span><span className="text-gray-900">Delivery date:</span> {formatDate(orderDetail.updated_at)}</span>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <span className="text-gray-900">Qty:</span> {orderDetail.items?.reduce((sum, item) => sum + item.quantity, 0)}
        </div>

        <div className="flex gap-6">
          <button className="text-blue-600 hover:underline text-sm">
            Download Invoice
          </button>
          <button className="text-blue-600 hover:underline text-sm">
            Buy the Same
          </button>
          <Link href={`/${orderDetail.payment_status === 'paid' ? 'order-summary' : 'checkout'}?orderId=${orderDetail.id}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            More Details
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryCard;