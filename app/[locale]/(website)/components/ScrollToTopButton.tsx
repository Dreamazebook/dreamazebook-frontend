'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToTopButtonProps {
  threshold?: number; // 滚动多少像素后显示按钮
  className?: string; // 自定义样式类
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'; // 按钮位置
  showProgress?: boolean; // 是否显示滚动进度
  variant?: 'default' | 'minimal' | 'gradient'; // 按钮样式变体
  size?: 'small' | 'medium' | 'large'; // 按钮大小
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  threshold = 300,
  className = '',
  position = 'bottom-right',
  showProgress = false,
  variant = 'default',
  size = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // 当页面滚动超过阈值时显示按钮
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // 计算滚动进度
      if (showProgress) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const progress = scrollHeight > 0 ? (currentScroll / scrollHeight) * 100 : 0;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 清理事件监听器
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, showProgress]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 平滑滚动
    });
  };

  // 根据位置设置样式
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-center':
        return 'bottom-8 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-8 right-8';
    }
  };

  // 根据大小设置样式
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10 p-2';
      case 'large':
        return 'w-14 h-14 p-4';
      case 'medium':
      default:
        return 'w-12 h-12 p-3';
    }
  };

  // 根据变体设置样式
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-0';
      case 'default':
      default:
        return 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200';
    }
  };

  // 动画变体
  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={scrollToTop}
          className={`
            fixed z-50 ${getSizeClasses()} ${getVariantClasses()} 
            rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${getPositionClasses()}
            ${className}
          `}
          aria-label="Scroll to top"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* 进度环 */}
          {showProgress && (
            <svg
              className="absolute inset-0 transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${scrollProgress}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          )}
          
          {/* 向上箭头图标 */}
          <svg 
            className="w-5 h-5 relative z-10" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;