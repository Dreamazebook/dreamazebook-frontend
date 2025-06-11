export type OrderStatus = 'cart' | 'paid' | 'unpaid' | 'cancelled';
export type ShippingStatus = 'pending' | 'processed' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  bookTitle: string;
  customerName: string;
  date: string;
  amount: number;
  status: OrderStatus;
  shippingStatus: ShippingStatus;
  customerEmail: string;
  shippingAddress: string;
  pdfGenerated: boolean;
  previewConfirmed: boolean;
  previewConfirmedAt?: string;
  sentToPrint: boolean;
  sentToPrintAt?: string;
  orderItems: {
    bookId: string;
    title: string;
    quantity: number;
    price: number;
  }[];
}