'use client';

import { FC } from 'react';

interface StatusFilterProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  statusCounts: Record<string, number>;
}

const StatusFilter: FC<StatusFilterProps> = ({
  statusFilter,
  onStatusFilterChange,
  statusCounts,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onStatusFilterChange('all')}
        className={`px-3 py-1 text-sm rounded-full ${
          statusFilter === 'all'
            ? 'bg-blue-100 text-blue-800 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部 ({statusCounts.all})
      </button>
      <button
        onClick={() => onStatusFilterChange('pending')}
        className={`px-3 py-1 text-sm rounded-full ${
          statusFilter === 'pending'
            ? 'bg-yellow-100 text-yellow-800 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        待处理 ({statusCounts.pending})
      </button>
      <button
        onClick={() => onStatusFilterChange('processing')}
        className={`px-3 py-1 text-sm rounded-full ${
          statusFilter === 'processing'
            ? 'bg-blue-100 text-blue-800 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        处理中 ({statusCounts.processing})
      </button>
      <button
        onClick={() => onStatusFilterChange('completed')}
        className={`px-3 py-1 text-sm rounded-full ${
          statusFilter === 'completed'
            ? 'bg-green-100 text-green-800 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        已完成 ({statusCounts.completed})
      </button>
      <button
        onClick={() => onStatusFilterChange('cancelled')}
        className={`px-3 py-1 text-sm rounded-full ${
          statusFilter === 'cancelled'
            ? 'bg-red-100 text-red-800 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        已取消 ({statusCounts.cancelled})
      </button>
      <button
        onClick={() => onStatusFilterChange('refunded')}
        className={`px-3 py-1 text-sm rounded-full ${
          statusFilter === 'refunded'
            ? 'bg-purple-100 text-purple-800 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        已退款 ({statusCounts.refunded})
      </button>
    </div>
  );
};

export default StatusFilter;