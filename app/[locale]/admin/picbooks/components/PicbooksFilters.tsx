'use client';

import { FC } from 'react';

interface DateRange {
  start: string;
  end: string;
}

interface PicbooksFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  languageFilter: string;
  setLanguageFilter: (language: string) => void;
  characterCountFilter: string;
  setCharacterCountFilter: (count: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const PicbooksFilters: FC<PicbooksFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  languageFilter,
  setLanguageFilter,
  characterCountFilter,
  setCharacterCountFilter,
  dateRange,
  setDateRange,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">搜索图书：</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="输入图书名称或描述..."
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Date Range */}
      <div className="w-full md:w-1/2 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">创建时间：</label>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="开始日期"
          />
          <span className="text-gray-500 text-sm">至</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="结束日期"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">状态：</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部</option>
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="draft">草稿</option>
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">语言：</label>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Character Count Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">角色数量：</label>
          <select
            value={characterCountFilter}
            onChange={(e) => setCharacterCountFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部</option>
            <option value="1">1个角色</option>
            <option value="2">2个角色</option>
            <option value="3">3个角色</option>
            <option value="4">4个角色</option>
          </select>
        </div>

        {/* Has Choices Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">互动选项：</label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部</option>
            <option value="true">有选项</option>
            <option value="false">无选项</option>
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
            重置
          </button>
        </div>
      </div>
    </div>
  );
};

export default PicbooksFilters;