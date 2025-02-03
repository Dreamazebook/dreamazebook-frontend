import { FC } from 'react';
import {OrderStatus} from '../types/order';

interface OrderFiltersProps {
  search: string;
  status: OrderStatus | 'all';
  dateRange: { from: string; to: string };
  onSearchChange: (value: string) => void;
  onStatusChange: (status: OrderStatus | 'all') => void;
  onDateRangeChange: (range: { from: string; to: string }) => void;
}

const OrderFilters: FC<OrderFiltersProps> = ({
  search,
  status,
  dateRange,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus | 'all')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="refund">Refund</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderFilters; 