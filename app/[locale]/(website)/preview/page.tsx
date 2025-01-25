/** @jsxImportSource react */

'use client';

import React, { useState } from 'react';
import TopNavBarWithTabs from '../components/TopNavBarWithTabs';
import { FaLeaf, FaCheck, FaBook, FaGift } from 'react-icons/fa';

const steps = [
  { label: '赠与人 & 寄语', icon: <FaLeaf />, active: false },
  { label: '确认事项', icon: <FaCheck />, active: false },
  { label: 'Cover design', icon: <FaBook />, active: true },
  { label: '装帧', icon: <FaBook />, active: false },
  { label: '其他礼物', icon: <FaGift />, active: false },
];

export default function PreviewPageWithTopNav() {
  const [activeStep, setActiveStep] = useState(2); // 当前激活步骤的索引
  const [activeTab, setActiveTab] = useState<'Book preview' | 'Others'>('Book preview'); // 顶部Tab
  const [viewMode, setViewMode] = useState<'single' | 'double'>('single'); // 单页/双页切换

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  const handleTabChange = (tab: 'Book preview' | 'Others') => {
    setActiveTab(tab);
  };

  const handleViewModeChange = (mode: 'single' | 'double') => {
    setViewMode(mode);
  };

  return (
    <div className="flex gap-[24px] min-h-screen bg-[#F8F8F8]">
  {/* 主内容区域 */}
  <div className="w-[80%] flex flex-col">
    {/* 顶部导航栏 */}
    <div className="p-[12px] ml-6">
      <TopNavBarWithTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </div>

    {/* 主内容 */}
    <main className="flex-1 flex flex-col">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="h-screen flex items-center justify-center border-b"
        >
          <h1 className="text-2xl font-semibold">
            Section {index + 1} - {activeTab} - {viewMode === 'double' ? '双页' : '单页'}
          </h1>
        </div>
      ))}
    </main>
  </div>

  {/* 右侧侧边栏 */}
  <aside className="w-[20%] min-h-screen bg-white flex flex-col py-8 px-4 border-l">
    <nav className="space-y-6 flex-1">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-start">
          <button
            onClick={() => handleStepClick(index)}
            className="flex items-center space-x-4 w-full text-left px-4 py-2"
          >
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full ${
                activeStep === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step.icon}
            </span>
            <span
              className={`text-sm ${
                activeStep === index ? 'text-black font-medium' : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
          </button>
          {index < steps.length - 1 && (
            <div className="w-px h-6 bg-gray-300 ml-6"></div>
          )}
        </div>
      ))}
    </nav>
    <div className="mt-8">
      <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
        Continue
      </button>
    </div>
  </aside>
</div>

  );
}
