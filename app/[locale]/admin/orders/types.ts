export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'paid' | 'unpaid' | 'refunded';
  created_at: string;
  updated_at: string;
  items_count: number;
}