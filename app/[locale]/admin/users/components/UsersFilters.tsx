'use client';

import { FC } from 'react';

interface DateRange {
  start: string;
  end: string;
}

interface UsersFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  regionFilter: string;
  setRegionFilter: (region: string) => void;
  sourceFilter: string;
  setSourceFilter: (source: string) => void;
  satisfactionFilter: string;
  setSatisfactionFilter: (satisfaction: string) => void;
}

const UsersFilters: FC<UsersFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  regionFilter,
  setRegionFilter,
  sourceFilter,
  setSourceFilter,
  satisfactionFilter,
  setSatisfactionFilter,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">日期：</label>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="开始日期"
            />
            <span className="text-gray-500">至</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="结束日期"
            />
          </div>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">地区：</label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Lucy</option>
            <option value="中国·四川">中国·四川</option>
            <option value="美国·加州">美国·加州</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">注册来源：</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Lucy</option>
            <option value="ins">ins</option>
            <option value="Facebook">Facebook</option>
            <option value="Google">Google</option>
          </select>
        </div>

        {/* Satisfaction Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">满意度：</label>
          <select
            value={satisfactionFilter}
            onChange={(e) => setSatisfactionFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Lucy</option>
            <option value="满意">满意</option>
            <option value="不满意">不满意</option>
          </select>
        </div>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            查询
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
            搜索
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersFilters;