import { useTranslations } from "next-intl";
import { OrderDetail, statusLabelMap } from "@/types/order";

interface OrderTitleProps {
  status: string;
}

export default function OrderTitle({ status }: OrderTitleProps) {
  const t = useTranslations("orderSummary");

  const getStatusTitle = () => {
    const labelKey = statusLabelMap[status?.toLowerCase()] || "preparationTitle";
    
    // Special handling for digital production status
    if (status?.toLowerCase() === 'processing' || 
        status?.toLowerCase() === 'ai_processing' || 
        status?.toLowerCase() === 'ai_completed') {
      return t("digitalProductionTitle");
    }
    
    // Special handling for in-transit statuses as requested
    if (status?.toLowerCase() === 'shipping' || 
        status?.toLowerCase() === 'logistics_confirmed' || 
        status?.toLowerCase() === 'logistics_shipped') {
      return t("inTransitTitle");
    }
    
    // Special handling for delivered statuses as requested
    if (status?.toLowerCase() === 'delivered' || 
        status?.toLowerCase() === 'completed' || 
        status?.toLowerCase() === 'logistics_delivered') {
      return t("deliveredTitle");
    }
    
    // Special handling for closed/refunded statuses as requested
    if (status?.toLowerCase() === 'cancelled' || 
        status?.toLowerCase() === 'refunded' || 
        status?.toLowerCase() === 'closed') {
      return t("refundedTitle");
    }
    
    return t(`${labelKey}Title`);
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