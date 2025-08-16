import Image from "next/image";
import { CartItem } from "../../shopping-cart/components/types";
import DisplayPrice from "./DisplayPrice";

interface OrderItemProps {
  orderItem: CartItem
}

const OrderItem = ({orderItem}:OrderItemProps) => {  
  return (
    <div
      className="flex items-center bg-white rounded p-4"
    >
      <Image
        src={orderItem.picbook_cover}
        alt={orderItem.picbook_name}
        width={80}          // 对应 className w-20 (20 * 4 = 80 px)
        height={80}         // 对应 className h-20
        className="object-cover rounded mr-4"
      />
      <div className="flex-1">
        <p className="font-semibold">{orderItem.picbook_name}</p>
        <p className="text-gray-500 text-sm">{orderItem.message}</p>
      </div>
      <DisplayPrice value={orderItem.total_price} style='text-gray-800' />
    </div>
  );
};

export default OrderItem;