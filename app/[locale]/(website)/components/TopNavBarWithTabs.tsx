import React from 'react';

interface TopNavBarProps {
  activeTab: 'Book preview' | 'Others';
  onTabChange: (tab: 'Book preview' | 'Others') => void;
  viewMode: 'single' | 'double';
  onViewModeChange: (mode: 'single' | 'double') => void;
}

export default function TopNavBarWithTabs({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
}: TopNavBarProps) {
  return (
    <div
      className="h-[48px] bg-white py-2 px-4 flex items-center justify-between rounded-full"
      style={{
        boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.08)', // 阴影效果
      }}
    >
      {/* 左侧占位 */}
      <div className="w-1/3" />

      {/* 中间 Tab 切换 */}
      <div className="flex items-center justify-center space-x-8 w-1/3">
        {/* Book preview 按钮 */}
        <button
          onClick={() => onTabChange('Book preview')}
          className={`text-l font-normal ${
            activeTab === 'Book preview'
              ? 'text-black underline decoration-blue-600 decoration-4 underline-offset-2'
              : 'text-gray-600'
          }`}
        >
          Book preview
        </button>
        {/* Others 按钮 */}
        <button
          onClick={() => onTabChange('Others')}
          className={`text-l font-normal ${
            activeTab === 'Others'
              ? 'text-black underline decoration-[#012CCE] decoration-[6px] underline-offset-2'
              : 'text-gray-600'
          }`}
        >
          Others
        </button>
      </div>

      {/* 右侧单页/双页切换 */}
      <div className="flex items-center space-x-4 w-1/3 justify-end">
        {/* 单页按钮 */}
        <button
          onClick={() => onViewModeChange('single')}
          className={`w-12 h-6 rounded-full flex items-center justify-center ${
            viewMode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
        >
          单页
        </button>
        {/* 双页按钮 */}
        <button
          onClick={() => onViewModeChange('double')}
          className={`w-12 h-6 rounded-full flex items-center justify-center ${
            viewMode === 'double' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
        >
          双页
        </button>
      </div>
    </div>
  );
}
