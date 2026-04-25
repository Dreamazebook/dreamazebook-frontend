"use client";

import { Link } from "@/i18n/routing";
import { OrderDetail } from "@/types/order";
import DisplayPrice from "../../../components/component/DisplayPrice";
import OrderStatusLabel from "../../../components/component/OrderStatusLabel";
import OrderSummaryDelivery from "../../../components/component/OrderSummaryDelivery";
import CartItemCard from "../../../(orders)/shopping-cart/components/CartItemCard";
import { getOrderLink, ORDER_CHECKOUT_URL, ORDER_SUMMARY_URL } from "@/constants/links";
import { useTranslations } from 'next-intl';
import StripeReceiptLink from "../../../components/component/StripeReceiptLink";

export default function LatestOrderHistory({ orderDetail }:{orderDetail:OrderDetail}) {
  const {order_number,status,total_amount,items, id} = orderDetail;
  const t = useTranslations('orderHistoryCard');

  return (
    <div key={order_number} className="">
      <div className="flex items-center mb-5 gap-2">
        <Link href={`/${orderDetail.payment_status === 'paid' ? ORDER_SUMMARY_URL(id) : ORDER_CHECKOUT_URL(id)}`} className="text-base md:text-lg font-medium text-primary">#{order_number}</Link>
        <OrderStatusLabel status={status} />
      </div>
      
      <OrderSummaryDelivery orderDetail={orderDetail} />

      <div className="space-y-3">
        
        {items.map((item)=>(
        <CartItemCard item={item} key={item.id} />
        ))}
        
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#999999]">{t("total")}</span> <DisplayPrice value={total_amount} style="text-2xl font-bold text-[#222222]"/>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {orderDetail.delivered_at &&
          <StripeReceiptLink stripeReceiptUrl={orderDetail.stripe_receipt_url} variant="button" />
          }
          <Link href={getOrderLink(orderDetail)} className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800">
            {t("moreDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}