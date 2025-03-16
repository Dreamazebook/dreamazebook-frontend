'use client';

import { FC, useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types/order';
import OrderFilters from '../components/OrderFilters';
import OrderDetailsModal from '../components/OrderDetailsModal';

const OrdersPage: FC = () => {
  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  // Sample data - replace with API call
  const orders: Order[] = [
    {
      id: 'ORD-001',
      bookTitle: 'The Great Gatsby',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      date: '2024-03-15',
      amount: 29.99,
      status: 'completed',
      shippingAddress: '123 Main St, City, Country',
      orderItems: [
        { bookId: '1', title: 'The Great Gatsby', quantity: 1, price: 29.99 }
      ]
    },
    {
      id: 'ORD-002',
      bookTitle: '1984',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      date: '2024-03-14',
      amount: 24.99,
      status: 'pending',
      shippingAddress: '456 Oak St, City, Country',
      orderItems: [
        { bookId: '2', title: '1984', quantity: 1, price: 24.99 }
      ]
    },
    {
      id: 'ORD-003',
      bookTitle: 'To Kill a Mockingbird',
      customerName: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      date: '2024-03-13',
      amount: 19.99,
      status: 'cancelled',
      shippingAddress: '789 Pine St, City, Country',
      orderItems: [
        { bookId: '3', title: 'To Kill a Mockingbird', quantity: 1, price: 19.99 }
      ]
    },
    {
      id: 'ORD-004',
      bookTitle: 'Pride and Prejudice',
      customerName: 'Robert Wilson',
      customerEmail: 'robert@example.com',
      date: '2024-03-12',
      amount: 49.98,
      status: 'completed',
      shippingAddress: '321 Elm St, City, Country',
      orderItems: [
        { bookId: '4', title: 'Pride and Prejudice', quantity: 2, price: 24.99 }
      ]
    },
    {
      id: 'ORD-005',
      bookTitle: 'The Catcher in the Rye',
      customerName: 'Emily Brown',
      customerEmail: 'emily@example.com',
      date: '2024-03-10',
      amount: 27.99,
      status: 'pending',
      shippingAddress: '654 Maple St, City, Country',
      orderItems: [
        { bookId: '5', title: 'The Catcher in the Rye', quantity: 1, price: 27.99 }
      ]
    },
    {
      id: 'ORD-006',
      bookTitle: 'Lord of the Rings Collection',
      customerName: 'Michael Davis',
      customerEmail: 'michael@example.com',
      date: '2024-03-08',
      amount: 89.97,
      status: 'completed',
      shippingAddress: '987 Cedar St, City, Country',
      orderItems: [
        { bookId: '6', title: 'The Fellowship of the Ring', quantity: 1, price: 29.99 },
        { bookId: '7', title: 'The Two Towers', quantity: 1, price: 29.99 },
        { bookId: '8', title: 'The Return of the King', quantity: 1, price: 29.99 }
      ]
    },
    {
      id: 'ORD-007',
      bookTitle: 'The Hobbit',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      date: '2024-03-07',
      amount: 34.99,
      status: 'refund',
      shippingAddress: '123 Birch St, City, Country',
      orderItems: [
        { bookId: '9', title: 'The Hobbit', quantity: 1, price: 34.99 }
      ]
    },
    {
      id: 'ORD-008',
      bookTitle: 'Harry Potter Collection',
      customerName: 'David Thompson',
      customerEmail: 'david@example.com',
      date: '2024-03-05',
      amount: 159.95,
      status: 'refund',
      shippingAddress: '456 Willow St, City, Country',
      orderItems: [
        { bookId: '10', title: 'Harry Potter Complete Set', quantity: 1, price: 159.95 }
      ]
    }
  ];

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const matchesSearch = 
          order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.bookTitle.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        const matchesDate = (!dateRange.from || order.date >= dateRange.from) &&
                           (!dateRange.to || order.date <= dateRange.to);

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [orders, search, statusFilter, dateRange, sortConfig]);

  const handleSort = (key: keyof Order) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refund':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Book Orders</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Export Orders
        </button>
      </div>

      <OrderFilters
        search={search}
        status={statusFilter}
        dateRange={dateRange}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onDateRangeChange={setDateRange}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}>
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('bookTitle')}>
                  Book Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customerName')}>
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}>
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}>
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.bookTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersPage; 