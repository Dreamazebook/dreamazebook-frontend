export type OrderStatus = 'completed' | 'pending' | 'cancelled' | 'refund';

export interface Order {
  id: string;
  bookTitle: string;
  customerName: string;
  date: string;
  amount: number;
  status: OrderStatus;
  customerEmail: string;
  shippingAddress: string;
  orderItems: {
    bookId: string;
    title: string;
    quantity: number;
    price: number;
  }[];
} 