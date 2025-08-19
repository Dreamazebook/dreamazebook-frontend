interface OrderStatusLabelProps {
  status: string;
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'paid': return 'text-[#296849] bg-[#E7EDDE]';
    case 'preparing': return 'text-[#AC7B00] bg-[#FFEDC8]';
    case 'processing': return 'text-orange-500';
    case 'shipped' : return 'text-[#1963C3] bg-[#E2EEFF]';
    case 'delivered': return 'text-[#666666] bg-[#F0F0F0]';
    case 'cancelled': return 'text-[#CF0F02] bg-[#FCF2F2]';
    default: return 'text-gray-500';
  }
};

const OrderStatusLabel = ({status}:OrderStatusLabelProps) => {  
  return (
    <span className={`${getStatusColor(status)} px-1 py-0.5 rounded capitalize font-medium`}>{status}</span>
  );
};

export default OrderStatusLabel;