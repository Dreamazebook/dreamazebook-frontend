import React from 'react';
import { FaBookOpen } from 'react-icons/fa';

interface TopNavBarProps {
  activeTab: 'Book preview' | 'Others';
  onTabChange: (tab: 'Book preview' | 'Others') => void;
  viewMode: 'double' | 'single';
  onViewModeChange: (mode: 'double' | 'single') => void;
}

const UnderlineIcon = () => (
  <svg 
    className="absolute bottom-[3px] left-0 w-full" 
    height="4" 
    viewBox="0 0 100 4" 
    preserveAspectRatio="none"
  >
    <line 
      x1="0" 
      y1="2" 
      x2="100" 
      y2="2" 
      stroke="#012CCE" 
      strokeWidth="4"
    />
  </svg>
);

// ViewModeToggle 子组件
function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'double' | 'single';
  onViewModeChange: (mode: 'double' | 'single') => void;
}) {
  return (
    <div
      className="relative w-[64px] h-[32px] bg-[#F0F0F0] rounded-[30px] flex justify-between items-center p-[4px]"
    >
      {/* 激活按钮 */}
      <div
        className={`absolute w-[24px] h-[24px] bg-white rounded-[14px] ${
          viewMode === 'double' ? 'left-[4px]' : 'right-[4px]'
        }`}
        style={{
          boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.08)', // 阴影效果
        }}
      ></div>

      {/* 双页按钮容器 + Tooltip */}
      <div className="relative flex items-center justify-center w-[24px] h-[24px] rounded-[14px] group">
        <button
          onClick={() => onViewModeChange('double')}
          className="relative z-10 flex items-center justify-center"
        >
          <svg
            width="12"
            height="10"
            viewBox="0 0 12 10"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: 'scale(0.95)', // 缩小图标
              margin: '0 auto',        // 确保水平居中
              fill: viewMode === 'double' ? '#012CCE' : '#CCCCCC',
            }}
          >
            <path d="M2.85714 0C0.571423 0 0 0.205871 0 0.58823V8.82353C0 9.14706 0.257137 9.41177 0.571423 9.41177H2.57144C3.71428 9.41177 4.85714 10 5.14286 10C5.57143 10 5.71428 9.88235 5.71428 9.41177V1.17647C5.71428 0.764705 4.82857 0 2.85714 0ZM9.14286 0C7.22858 0 6.28572 0.764705 6.28572 1.17646V9.41177C6.28572 9.88235 6.42857 10 6.85714 10C7.14286 10 8.22858 9.41177 9.42858 9.41177H11.4286C11.8857 9.41177 12 9.26472 12 8.82353V0.588243C12 0.205896 11.4286 0 9.14286 0Z" />
          </svg>
        </button>
        {/* Tooltip */}
        <div
          className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-black rounded-md shadow-md whitespace-nowrap z-20"
        >
          Two-Page View
        </div>
      </div>

      {/* 单页按钮容器 + Tooltip */}
      <div className="relative flex items-center justify-center w-[24px] h-[24px] rounded-[14px] group">
        <button
          onClick={() => onViewModeChange('single')}
          className="relative flex items-center justify-center"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: 'scale(0.95)', // 缩小图标
              margin: '0 auto',        // 确保水平居中
              fill: viewMode === 'single' ? '#012CCE' : '#999999',
            }}
          >
            <rect x="0.25" y="1.5" width="1.5" height="10" rx="0.75" />
            <path d="M7.25 0.5C4.235 0.5 2.75 1.34118 2.75 1.79411V10.8529C2.75 11.3706 2.97499 11.5 3.64999 11.5C4.1 11.5 5.81001 10.8529 7.70001 10.8529H10.85C11.57 10.8529 11.75 10.6912 11.75 10.2059V1.14707C11.75 0.726486 10.85 0.5 7.25 0.5Z" />
          </svg>
        </button>
        {/* Tooltip */}
        <div
          className="absolute hidden group-hover:block top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs text-black bg-white rounded-md shadow-md whitespace-nowrap z-20"
        >
          Single-Page View
        </div>
      </div>
    </div>
  );
}

// 顶部导航栏主组件
export default function TopNavBarWithTabs({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
}: TopNavBarProps) {
  return (
    <div
      className="h-[48px] bg-white px-2 flex items-center justify-between rounded-full"
      style={{
        boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.08)', // 阴影效果
      }}
    >
      {/* 左侧占位 */}
      <div className="w-1/3" />

      {/* 中间 Tab 切换 */}
      <div className="flex items-center justify-center space-x-8 w-1/3">
        {/* Book preview 按钮 */}
        <div className="relative">
          <button
            onClick={() => onTabChange('Book preview')}
            className="relative z-10 text-sm font-medium text-black bg-transparent"
          >
            Book preview
          </button>
          {activeTab === 'Book preview' && <UnderlineIcon />}
        </div>

        {/* Others 按钮 */}
        <div className="relative">
          <button
            onClick={() => onTabChange('Others')}
            className="relative z-10 text-sm font-medium text-black bg-transparent"
          >
            Others
          </button>
          {activeTab === 'Others' && <UnderlineIcon />}
        </div>
      </div>

      {/* 右侧单页/双页切换 */}
      <div className="w-1/3 flex justify-end">
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>
    </div>
  );
}
