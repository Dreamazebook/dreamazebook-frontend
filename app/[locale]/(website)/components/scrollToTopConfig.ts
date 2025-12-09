// 滚动到顶部按钮配置
export interface ScrollToTopConfig {
  enabled: boolean;
  threshold?: number;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  showProgress?: boolean;
  variant?: 'default' | 'minimal' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// 不同页面的配置
export const SCROLL_TO_TOP_CONFIGS: Record<string, ScrollToTopConfig> = {
  // 默认配置
  default: {
    enabled: true,
    threshold: 300,
    position: 'bottom-right',
    showProgress: false,
    variant: 'default',
    size: 'medium'
  },
  
  // 首页配置
  home: {
    enabled: true,
    threshold: 500,
    position: 'bottom-right',
    showProgress: true,
    variant: 'gradient',
    size: 'large'
  },
  
  // 产品详情页配置
  product: {
    enabled: true,
    threshold: 400,
    position: 'bottom-right',
    showProgress: true,
    variant: 'default',
    size: 'medium'
  },
  
  // 购物车和结账页面配置
  checkout: {
    enabled: true,
    threshold: 300,
    position: 'bottom-left',
    showProgress: false,
    variant: 'minimal',
    size: 'small'
  },
  
  // 个人资料页面配置
  profile: {
    enabled: true,
    threshold: 200,
    position: 'bottom-right',
    showProgress: false,
    variant: 'default',
    size: 'medium'
  },
  
  // 自定义页面配置
  about: {
    enabled: true,
    threshold: 600,
    position: 'bottom-right',
    showProgress: true,
    variant: 'gradient',
    size: 'large',
    className: 'hidden md:block' // 只在桌面端显示
  }
};

// 根据路径获取配置的函数
export const getScrollToTopConfig = (path: string): ScrollToTopConfig => {
  // 根据路径确定页面类型
  if (path === '/' || path === '/en' || path === '/fr') {
    return SCROLL_TO_TOP_CONFIGS.home;
  }
  
  if (path.includes('/personalized-products/')) {
    return SCROLL_TO_TOP_CONFIGS.product;
  }
  
  if (path.includes('/checkout') || path.includes('/order-summary')) {
    return SCROLL_TO_TOP_CONFIGS.checkout;
  }
  
  if (path.includes('/profile')) {
    return SCROLL_TO_TOP_CONFIGS.profile;
  }
  
  if (path.includes('/about')) {
    return SCROLL_TO_TOP_CONFIGS.about;
  }
  
  // 默认配置
  return SCROLL_TO_TOP_CONFIGS.default;
};