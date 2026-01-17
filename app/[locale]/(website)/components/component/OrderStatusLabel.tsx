import useOrderStatus from "../../hooks/useOrderStatus";
import { useTranslations } from "next-intl";
interface OrderStatusLabelProps {
  status: string;
}

const OrderStatusLabel = ({ status }: OrderStatusLabelProps) => {
  const t = useTranslations("orderHistory");
  const { colorClasses, statusLabel } = useOrderStatus(status);
  
  return (
    <span className={`${colorClasses} px-[8px] py-[4px] rounded capitalize text-[16px] font-medium`}>
      {t(statusLabel)}
    </span>
  );
};

export default OrderStatusLabel;
