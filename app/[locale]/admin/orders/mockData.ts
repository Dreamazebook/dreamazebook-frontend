import { Order } from './types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-2023-8742',
    customer_name: '张三',
    customer_email: 'zhangsan@example.com',
    total_amount: 1250.00,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-28T14:32:10Z',
    updated_at: '2023-11-28T14:45:22Z',
    items_count: 3
  },
  {
    id: 'ORD-2023-8741',
    customer_name: '李四',
    customer_email: 'lisi@example.com',
    total_amount: 890.50,
    status: 'pending',
    payment_status: 'paid',
    created_at: '2023-11-28T12:15:33Z',
    updated_at: '2023-11-28T12:15:33Z',
    items_count: 2
  },
  {
    id: 'ORD-2023-8740',
    customer_name: '王五',
    customer_email: 'wangwu@example.com',
    total_amount: 2340.75,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-27T09:45:12Z',
    updated_at: '2023-11-27T10:30:45Z',
    items_count: 5
  },
  {
    id: 'ORD-2023-8739',
    customer_name: '赵六',
    customer_email: 'zhaoliu@example.com',
    total_amount: 460.25,
    status: 'processing',
    payment_status: 'paid',
    created_at: '2023-11-27T08:22:18Z',
    updated_at: '2023-11-27T08:35:42Z',
    items_count: 1
  },
  {
    id: 'ORD-2023-8738',
    customer_name: '钱七',
    customer_email: 'qianqi@example.com',
    total_amount: 1120.00,
    status: 'cancelled',
    payment_status: 'refunded',
    created_at: '2023-11-26T16:10:05Z',
    updated_at: '2023-11-26T18:45:30Z',
    items_count: 3
  },
  {
    id: 'ORD-2023-8737',
    customer_name: '孙八',
    customer_email: 'sunba@example.com',
    total_amount: 750.50,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-26T11:05:22Z',
    updated_at: '2023-11-26T11:45:18Z',
    items_count: 2
  },
  {
    id: 'ORD-2023-8736',
    customer_name: '周九',
    customer_email: 'zhoujiu@example.com',
    total_amount: 1890.25,
    status: 'completed',
    payment_status: 'paid',
    created_at: '2023-11-25T14:30:45Z',
    updated_at: '2023-11-25T15:20:12Z',
    items_count: 4
  },
  {
    id: 'ORD-2023-8735',
    customer_name: '吴十',
    customer_email: 'wushi@example.com',
    total_amount: 320.75,
    status: 'refunded',
    payment_status: 'refunded',
    created_at: '2023-11-25T09:15:33Z',
    updated_at: '2023-11-25T14:40:22Z',
    items_count: 1
  }
];