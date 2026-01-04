import { useTranslations } from "next-intl";
import { OrderDetail, statusLabelMap } from "@/types/order";

interface OrderTitleProps {
  status: string;
}

export default function OrderTitle({ status }: OrderTitleProps) {
  const t = useTranslations("orderSummary");

  const getStatusTitle = () => {
    const statusLower = status?.toLowerCase();

    // Status title mapping for user-friendly messages
    const statusTitleMapping: { [key: string]: string } = {
      // Digital production statuses
      'processing': 'digitalProductionTitle',
      'ai_processing': 'digitalProductionTitle',
      'ai_completed': 'digitalProductionTitle',
      'pdf_confirmed': 'digitalProductionTitle',
      
      // In transit statuses
      'shipping': 'inTransitTitle',
      'logistics_confirmed': 'inTransitTitle',
      'logistics_shipped': 'inTransitTitle',
      
      // Delivered statuses
      'delivered': 'deliveredTitle',
      'completed': 'deliveredTitle',
      'logistics_delivered': 'deliveredTitle',
      
      // Closed/refunded statuses
      'cancelled': 'refundedTitle',
      'refunded': 'refundedTitle',
      'closed': 'refundedTitle',
    };

    const titleKey = statusTitleMapping[statusLower] || `${statusLabelMap[statusLower]}Title`;
    return t(titleKey);
  };

  const getStatusEmoji = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pending_payment':
        return "⏳";
      case 'processing':
      case 'ai_processing':
      case 'ai_completed':
        return "🎉";
      case 'shipped':
      case 'shipping':
      case 'logistics_confirmed':
      case 'logistics_shipped':
        return "📦";
      case 'delivered':
      case 'completed':
      case 'logistics_delivered':
        return "✅";
      case 'cancelled':
      case 'refunded':
      case 'closed':
        return "❌";
      default:
        return "🎉";
    }
  };

  return (
    <span>
      {getStatusEmoji()} {getStatusTitle()}
    </span>
  );
}