'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Drawer } from "antd";
import { create } from 'zustand';
import TopNavBarWithTabs from '../components/TopNavBarWithTabs';
import Image from 'next/image';
import GiverDedicationCanvas from './components/GiverDedicationCanvas';
import api from '@/utils/api';
import echo from '@/app/config/echo';
import useUserStore from '@/stores/userStore';
import toast from 'react-hot-toast';
import { PreviewResponse, PreviewCharacter, PreviewPage, FaceSwapBatch, ApiResponse, CartAddRequest, CartAddResponse } from '@/types/api';
import { BaseBook } from '@/types/book';
import { API_CART_CREATE } from '@/constants/api';
import { mirage } from 'ldrs';

// 自定义图片组件，支持Next.js Image和原生img的回退
const OptimizedImage = ({ src, alt, width, height, className, style, onError, onLoad, ...props }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  [key: string]: any;
}) => {
  const [useNativeImg, setUseNativeImg] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleNextImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Next.js Image failed, falling back to native img:', src);
    setUseNativeImg(true);
    if (onError) onError(e);
  };

  const handleNativeImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Native img also failed:', src);
    setImgError(true);
    if (onError) onError(e);
  };

  if (imgError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`} style={style}>
        <p className="text-gray-500 text-sm">图片加载失败</p>
      </div>
    );
  }

  if (useNativeImg) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        onError={handleNativeImgError}
        onLoad={onLoad}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      unoptimized={src.includes('s3-pro-dre001')}
      onError={handleNextImageError}
      onLoad={onLoad}
      {...props}
    />
  );
};

// 注册 mirage loader
mirage.register();

// 使用 React.createElement 创建 l-mirage 组件
const MirageLoader = ({ size = "60", speed = "2.5", color = "blue", style = {} }: {
  size?: string;
  speed?: string;
  color?: string;
  style?: React.CSSProperties;
}) => {
  return React.createElement('l-mirage', { size, speed, color, style });
};

const useStore = create<{
  activeStep: number;
  activeTab: 'Book preview' | 'Others';
  viewMode: 'single' | 'double';
  dedication: string;
  giver: string;
  editField: 'giver' | 'dedication' | null;
  setActiveStep: (step: number) => void;
  setActiveTab: (tab: 'Book preview' | 'Others') => void;
  setViewMode: (mode: 'single' | 'double') => void;
  setDedication: (dedication: string) => void;
  setGiver: (giver: string) => void;
  setEditField: (field: 'giver' | 'dedication' | null) => void;
}>((set) => ({
  activeStep: 2,
  activeTab: 'Book preview',
  viewMode: 'single',
  dedication:
    ' ',
  giver: ' ',
  editField: null,
  setActiveStep: (step: number) => set({ activeStep: step }),
  setActiveTab: (tab: 'Book preview' | 'Others') => set({ activeTab: tab }),
  setViewMode: (mode: 'single' | 'double') => set({ viewMode: mode }),
  setDedication: (dedication: string) => set({ dedication }),
  setGiver: (giver: string) => set({ giver }),
  setEditField: (field: 'giver' | 'dedication' | null) => set({ editField: field }),
}));

interface BookOptions {
  cover_options: Array<{
    id: number;
    option_type: string;
    option_key: string;
    name: string;
    description: string | null;
    price: number;
    currency_code: string;
    image_url: string;
    is_default: boolean;
    gender: number;
    skincolor: number;
    has_face: boolean;
    has_text: boolean;
    text_config: {
      color: string;
      title: string;
      position: string;
      font_size: number;
    };
    face_config: {
      positions: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
      }>;
    };
  }>;
  binding_options: any[];
  gift_box_options: any[];
}

export default function PreviewPageWithTopNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  
  const {
    activeTab,
    viewMode,
    dedication,
    giver,
    editField,
    setActiveTab,
    setViewMode,
    setDedication,
    setGiver,
    setEditField,
  } = useStore();

  // 处理AI生成状态
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 预览数据状态
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // 为 Others 标签页添加局部状态，用于记录选中的选项
  const [selectedBookCover, setSelectedBookCover] = React.useState<number | null>(null);
  const [selectedBookFormat, setSelectedBookFormat] = React.useState<number | null>(null);
  const [selectedBookWrap, setSelectedBookWrap] = React.useState<number | null>(null);
  const [detailModal, setDetailModal] = React.useState<typeof bookWrapOptions[0] | null>(null);
  // 当前展示图片的索引，用于翻页
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [confirmationDone, setConfirmationDone] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("");

  // 添加 options 状态
  const [bookOptions, setBookOptions] = useState<BookOptions | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // 添加到购物车的状态
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 在其他状态定义之后添加
  const [bookInfo, setBookInfo] = useState<BaseBook | null>(null);
  const [isLoadingBookInfo, setIsLoadingBookInfo] = useState(false);

  // 获取 book options 的函数
  const fetchBookOptions = useCallback(async () => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) {
        console.warn('缺少书籍ID');
        return;
      }

      setIsLoadingOptions(true);
      setOptionsError(null);

      const response = await api.get(`/preview/options/1`) as ApiResponse<BookOptions>;

      if (response.success) {
        setBookOptions(response.data!);
        console.log('Book options 获取成功:', response.data);
        console.log('Cover options:', response.data?.cover_options);
      } else {
        console.error('获取 book options 失败:', response);
        setOptionsError(response.message || '获取选项失败');
      }
    } catch (error: any) {
      console.error('获取 book options 失败:', error);
      setOptionsError(error.response?.data?.message || '获取选项失败');
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  // 获取书籍基本信息的函数
  const fetchBookInfo = useCallback(async () => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) {
        console.warn('缺少书籍ID');
        return;
      }

      setIsLoadingBookInfo(true);
      
      const response = await api.get<ApiResponse<BaseBook>>(`/picbooks/${bookId}`);
      
      if (response.success) {
        setBookInfo(response.data!);
        console.log('书籍信息获取成功:', response.data);
      } else {
        console.error('获取书籍信息失败:', response);
      }
    } catch (error: any) {
      console.error('获取书籍信息失败:', error);
    } finally {
      setIsLoadingBookInfo(false);
    }
  }, [searchParams]);

  // 在组件加载时获取 options
  useEffect(() => {
    const bookId = searchParams.get('bookid');
    if (bookId) {
      fetchBookInfo();
      fetchBookOptions();
    }
  }, [searchParams.get('bookid'), fetchBookInfo]);



  const bookFormatOptions = [
    {
      id: 1,
      image: '/format.png',
      title: 'Premium Hardcover',
      price: '$14.99',
      description: 'High-quality hardcover with premium finish.',
    },
    {
      id: 2,
      image: '/format.png',
      title: 'Standard Paperback',
      price: '$9.99',
      description: 'Cost-effective and lightweight paperback.',
    },
    {
      id: 3,
      image: '/format.png',
      title: 'Deluxe Leather Bound',
      price: '$19.99',
      description: 'Luxurious leather-bound edition.',
    },
    {
      id: 4,
      image: '/format.png',
      title: 'Digital Edition',
      price: 'Free',
      description: 'Instant access to your book on digital devices.',
    },
  ];
  
  const bookWrapOptions = [
    {
      id: 1,
      image: '/wrap.png',
      images: ['/wrap-1.png', '/wrap-2.png'],
      title: 'Classic Wrap',
      price: '$4.99',
      description: 'A timeless design with a simple finish.',
      fullDescription: 'Classic Wrap provides a subtle yet elegant cover wrap that suits any book style. It is designed for those who appreciate classic aesthetics with modern functionality.',
    },
    {
      id: 2,
      image: '/wrap.png',
      images: ['/wrap-1.png', '/wrap2-2.png'],
      title: 'Modern Wrap',
      price: '$5.99',
      description: 'A sleek design with modern aesthetics.',
      fullDescription: 'Modern Wrap offers a contemporary look with bold lines and vibrant colors, perfect for those who want their book to stand out with a modern flair.',
    },
  ];

  // 定义侧边栏各项，并为每个项配置默认图标和完成后的图标
  const sidebarItems = [
    { id: "giverDedication", label: "Giver & Dedication", 
      icon: 
        <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.8188 13.2969C18.0788 14.3398 18.0788 15.2523 17.6888 16.2952C17.4289 17.3381 16.909 18.2506 16.1291 18.9025C15.7392 19.2935 15.3492 19.5543 14.8293 19.815C14.3094 20.0757 13.7895 20.3364 13.1396 20.4668C12.6197 20.5972 11.9698 20.7275 11.3199 20.7275H8.20039V12.3844C7.29054 12.254 6.51066 12.1236 5.86077 11.7326C5.34085 11.4718 4.82094 11.0808 4.30102 10.6897C3.78111 10.2986 3.39117 9.77713 3.13121 9.25569C2.74128 8.73424 2.48132 8.08243 2.35134 7.43062C2.22136 6.77881 2.09138 6.127 2.09138 5.47519C2.09138 4.56266 2.22136 3.65013 2.6113 2.7376C3.26119 2.86796 3.91109 3.12868 4.56098 3.51977C5.21088 3.91085 5.73079 4.30194 6.12073 4.82339C6.25071 3.78049 6.64064 2.86796 7.16056 2.08579C7.68047 1.30362 8.33037 0.521447 9.11024 0C9.89011 0.521447 10.67 1.30362 11.1899 2.08579C11.7098 2.99832 11.9698 3.91085 12.0998 4.95375C12.6197 4.4323 13.1396 4.04121 13.6595 3.65013C14.3094 3.25904 14.9593 2.99832 15.6092 2.86796C15.9991 3.65013 16.1291 4.56266 16.1291 5.47519C16.1291 6.127 15.9991 6.77881 15.8691 7.43062C15.7392 8.08243 15.4792 8.60388 15.0893 9.25569C14.6993 9.77713 14.3094 10.2986 13.9195 10.6897C13.3995 11.0808 12.8796 11.4718 12.3597 11.7326C11.9698 11.9933 11.5798 12.1236 11.0599 12.254C10.67 12.3844 10.1501 12.5147 9.76014 12.5147V18.5114C9.89011 17.8596 10.1501 17.3381 10.54 16.8167C10.9299 16.2952 11.3199 15.7738 11.8398 15.2523C12.2297 14.8612 12.6197 14.4702 13.1396 14.2094C13.6595 13.9487 14.1794 13.688 14.6993 13.5576L16.2591 13.1665C16.779 13.1665 17.2989 13.2969 17.8188 13.2969ZM0.141699 13.2969C1.18153 13.0362 2.22136 13.1665 3.13121 13.4273C4.17104 13.688 5.0809 14.2094 5.86077 14.9916C6.25071 15.3827 6.51066 15.7738 6.77062 16.2952C7.03058 16.8167 7.29054 17.2078 7.42052 17.7292C7.55049 18.2506 7.68047 18.7721 7.68047 19.2935C7.68047 19.815 7.68047 20.3364 7.55049 20.8579C6.51066 21.1186 5.60081 20.9882 4.56098 20.7275C3.52115 20.3364 2.6113 19.815 1.83142 19.0328C1.05155 18.2506 0.531636 17.3381 0.271678 16.4256C0.0117201 15.3827 -0.118259 14.3398 0.141699 13.2969Z" fill="currentColor"/>
        </svg>
    },
    { id: "confirmation", label: "Confirmation", 
      icon: 
        <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.9846 23.0767H3.0154C2.43418 23.0699 1.8794 22.8328 1.47274 22.4175C1.06608 22.0022 0.840747 21.4425 0.846165 20.8613V4.98439C0.840747 4.40316 1.06608 3.84351 1.47274 3.4282C1.8794 3.01289 2.43418 2.77582 3.0154 2.76901H3.75386C3.80352 2.7643 3.8536 2.77061 3.90054 2.78751C3.94748 2.8044 3.9901 2.83144 4.02538 2.86672C4.06065 2.90199 4.0877 2.94462 4.10459 2.99155C4.12148 3.03849 4.1278 3.08858 4.12309 3.13824V4.61516C4.11792 5.39216 4.42114 6.1395 4.96623 6.69324C5.51133 7.24699 6.25379 7.56193 7.03078 7.56901H14.9692C15.7462 7.56193 16.4887 7.24699 17.0338 6.69324C17.5789 6.1395 17.8821 5.39216 17.8769 4.61516V3.13824C17.8722 3.08858 17.8785 3.03849 17.8954 2.99155C17.9123 2.94462 17.9394 2.90199 17.9746 2.86672C18.0099 2.83144 18.0525 2.8044 18.0995 2.78751C18.1464 2.77061 18.1965 2.7643 18.2462 2.76901H18.9846C19.5658 2.77582 20.1206 3.01289 20.5273 3.4282C20.9339 3.84351 21.1593 4.40316 21.1539 4.98439V20.8613C21.1593 21.4425 20.9339 22.0022 20.5273 22.4175C20.1206 22.8328 19.5658 23.0699 18.9846 23.0767ZM7.37232 13.7195C7.22562 13.7235 7.08651 13.7856 6.98555 13.8921L6.24709 14.6305C6.1968 14.6697 6.15541 14.719 6.12565 14.7754C6.09589 14.8317 6.07845 14.8937 6.07447 14.9573C6.07259 15.0342 6.08699 15.1107 6.11674 15.1816C6.14649 15.2526 6.19091 15.3164 6.24709 15.369L8.92401 18.0459C9.01814 18.1478 9.13234 18.2292 9.25943 18.2848C9.38652 18.3404 9.52374 18.3691 9.66247 18.3691C9.8012 18.3691 9.93843 18.3404 10.0655 18.2848C10.1926 18.2292 10.3068 18.1478 10.4009 18.0459L15.9394 12.5075C15.9894 12.4542 16.027 12.3904 16.0493 12.3208C16.0717 12.2512 16.0783 12.1775 16.0686 12.105C16.0635 12.0464 16.0449 11.9898 16.0143 11.9395C15.9837 11.8892 15.942 11.8467 15.8923 11.8152L15.1539 11.0767C15.1124 11.0229 15.0591 10.9793 14.9981 10.9494C14.9371 10.9195 14.8701 10.904 14.8022 10.9041C14.6555 10.9081 14.5164 10.9702 14.4154 11.0767L9.66155 15.8305L7.72309 13.8921C7.68172 13.8384 7.62858 13.7949 7.56777 13.765C7.50696 13.7351 7.44009 13.7195 7.37232 13.7195ZM15.0154 5.35362H7.03078C6.93092 5.35492 6.8319 5.33521 6.74014 5.29577C6.64839 5.25633 6.56595 5.19805 6.49817 5.1247C6.43677 5.05605 6.39076 4.97508 6.36322 4.8872C6.33568 4.79932 6.32724 4.70657 6.33847 4.61516V3.13824C6.33306 2.55701 6.55839 1.99736 6.96505 1.58205C7.37171 1.16674 7.92649 0.92967 8.5077 0.922852H13.5846C14.1658 0.92967 14.7206 1.16674 15.1273 1.58205C15.5339 1.99736 15.7593 2.55701 15.7539 3.13824V4.61516C15.755 4.71244 15.7366 4.80897 15.6999 4.89907C15.6632 4.98917 15.6088 5.07102 15.54 5.13981C15.4713 5.20861 15.3894 5.26296 15.2993 5.29968C15.2092 5.33639 15.1127 5.35473 15.0154 5.35362Z" fill="currentColor"/>
        </svg>
    },
    {
      id: "coverDesign",
      label: "Cover Design",
      icon: 
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.1727 3.36602C18.1727 2.94414 18.5149 2.60195 18.9368 2.60195C19.3586 2.60195 19.7008 2.94414 19.7008 3.36602V19.498C19.7008 20.5973 18.8102 21.4879 17.711 21.4879H2.2938C1.19458 21.4879 0.303955 20.5973 0.303955 19.498V1.72539C0.303955 1.05039 0.852393 0.501953 1.52739 0.501953H15.7211C16.3961 0.501953 16.9446 1.04805 16.9446 1.72539V14.6113C16.9446 15.2863 16.3985 15.8348 15.7211 15.8348H3.05786C2.38286 15.8348 1.83442 16.3809 1.83442 17.0582V18.7316C1.83442 19.4066 2.38286 19.9551 3.05786 19.9551H16.9493C17.6243 19.9551 18.1727 19.4066 18.1727 18.7316V3.36602ZM2.91956 17.7621C2.91956 17.3402 3.26174 16.998 3.68362 16.998H16.0539C16.4758 16.998 16.818 17.3402 16.818 17.7621C16.818 18.184 16.4758 18.5262 16.0539 18.5262H3.68362C3.26174 18.5262 2.91956 18.184 2.91956 17.7621Z" fill="currentColor"/>
        </svg>
    },
    { id: "bookFormat", label: "Format", 
      icon: 
        <svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M1.65002 0.5H16.95C17.85 0.5 18.6 1.1 18.3 1.85V13.65C18.3 14.55 17.7 15.15 16.8 15.15H14.25C13.5 15.15 12.75 15.9 12.75 16.65V19.8C12.75 20.7 12.15 21.3 11.25 21.3H1.65002C0.900024 21.3 0.150024 20.55 0.150024 19.8V2C0.150024 1.1 0.750024 0.5 1.65002 0.5ZM11.25 13.55C11.7 13.55 12 13.25 12 12.8C12 12.2 11.7 11.9 11.25 11.9H4.50002C4.05002 11.9 3.75002 12.2 3.75002 12.65V12.8C3.75002 13.25 4.05002 13.55 4.50002 13.55H11.25ZM14.55 9.5C15 9.5 15.3 9.2 15.3 8.75C15.3 8.15 15 7.85 14.4 7.85H4.35002C3.90002 7.85 3.60002 8.15 3.60002 8.6V8.75C3.60002 9.05 4.05002 9.35 4.50002 9.5H14.55ZM14.55 5.45C15 5.45 15.3 5.15 15.3 4.7C15.3 4.1 15 3.8 14.55 3.8H4.50002C4.05002 3.8 3.75002 4.1 3.75002 4.55V4.7C3.75002 5.15 4.05002 5.45 4.50002 5.45H14.55ZM13.8 19.7998V17.6998C13.8 16.7998 14.55 16.0498 15.45 16.0498H17.55C18.3 16.0498 18.6 16.9498 18.15 17.3998L15.15 20.3998C14.7 20.8498 13.8 20.5498 13.8 19.7998Z" fill="currentColor"/>
        </svg>
    },
    { id: "otherGifts", label: "Other Gifts", 
      icon: 
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.2313 3.77614C12.8615 4.14596 12.5157 4.36523 12.207 4.52123H11.2677C11.3037 4.18196 11.5622 3.51214 12.2648 2.80851C13.2008 1.87469 14.0757 1.71978 14.1968 1.84305C14.3168 1.96305 14.1662 2.84014 13.2313 3.77614ZM7.82477 4.52123C7.44529 4.33087 7.0996 4.07953 6.8015 3.77723C5.8655 2.84014 5.71604 1.96523 5.83604 1.84414C5.85895 1.82232 5.90804 1.80923 5.97786 1.80923C6.28768 1.80923 7.00768 2.05032 7.76804 2.81069C8.4695 3.51214 8.72804 4.17978 8.76404 4.52123H7.82477ZM9.3335 9.98451V19.5452H3.18732C2.84901 19.5459 2.52254 19.4207 2.27134 19.1941C2.02014 18.9675 1.86215 18.6556 1.82804 18.3191L1.8215 18.1794V9.98451H9.3335ZM18.2102 9.98451V18.1794C18.2105 18.3589 18.1754 18.5366 18.1068 18.7024C18.0383 18.8683 17.9377 19.019 17.8108 19.1458C17.6839 19.2727 17.5333 19.3733 17.3674 19.4419C17.2016 19.5104 17.0238 19.5455 16.8444 19.5452H10.6993V9.98451H18.2102ZM15.1633 0.877598C15.9106 1.62705 15.628 3.05942 14.5459 4.34669L14.3931 4.52123H18.2113C18.9182 4.52123 19.4997 5.05796 19.5706 5.74742L19.5771 5.88705V7.25287C19.5771 7.96196 19.0393 8.54233 18.351 8.61214L18.2113 8.61869H10.6993V4.52123H9.33459V8.61869H1.82041C1.48224 8.61884 1.15604 8.49353 0.904944 8.26702C0.653847 8.04051 0.495708 7.7289 0.461135 7.39251L0.45459 7.25287V5.88705C0.45459 5.17905 0.992408 4.59869 1.68077 4.52887L1.82041 4.52123H5.63859C4.42986 3.19032 4.08732 1.66196 4.8695 0.879779C5.69314 0.0506884 7.35677 0.468507 8.7335 1.84523C9.39568 2.50851 9.82986 3.23723 10.0153 3.90705C10.2008 3.23723 10.6339 2.50851 11.2982 1.84523C12.675 0.466325 14.3397 0.0539614 15.1622 0.878689L15.1633 0.877598Z" fill="currentColor"/>
        </svg>
    },
  ];

  // 为每个部分创建 ref（用于滚动定位）
  const giverDedicationRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const coverDesignRef = useRef<HTMLDivElement>(null);
  const bookFormatRef = useRef<HTMLDivElement>(null);
  const otherGiftsRef = useRef<HTMLDivElement>(null);
  
  // 构建图片URL的辅助函数
  const buildImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // 简化逻辑：直接使用固定的域名
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const finalUrl = `https://dreamazebook.com/${cleanPath}`;
    
    return finalUrl;
  };

  // 获取预览数据
  const fetchPreviewData = useCallback(async () => {
    try {
      const bookId = searchParams.get('bookid');
      if (!bookId) {
        console.warn('缺少书籍ID');
        return;
      }

      setIsLoadingPreview(true);
      setPreviewError(null);
      
      // 尝试从localStorage获取用户数据，用于后端验证或缓存查找
      let requestData = {};
      try {
        const userData = localStorage.getItem('previewUserData');
        if (userData) {
          requestData = JSON.parse(userData);
        }
      } catch (e) {
        console.warn('无法解析用户数据:', e);
      }
      
      // 构造API要求的请求数据格式
      const character = (requestData as any).characters?.[0];
      const apiRequestData = {
        picbook_id: bookId,
        face_image: character?.photo || character?.face_image,
        full_name: character?.full_name,
        language: character?.language || 'en', // 默认英语
        gender: character?.gender || 1, // 默认值
        skincolor: character?.skincolor || 1 // 默认值
      };
      
      // 添加详细的调试日志
      console.log('调用换脸接口（无用户数据）:', {
        url: '/simple-face-swap/create-by-picbook',
        originalData: requestData,
        apiRequestData: apiRequestData,
        bookId: bookId
      });
      
      // 修改为POST请求，传递必要的数据
      const response = await api.post(`/simple-face-swap/create-by-picbook`, apiRequestData) as ApiResponse<PreviewResponse>;
      
      if (response.success) {
        setPreviewData(response.data!);
        
        // 由于新的API结构中characters是数字数组，我们从localStorage获取角色名称
        try {
          const userData = localStorage.getItem('previewUserData');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            const character = parsedUserData.characters?.[0];
            const newGiver = character?.full_name || '';
            // 只有当 giver 值不同时才更新，避免无限循环
            if (giver !== newGiver) {
              setGiver(newGiver);
            }
          }
        } catch (e) {
          console.warn('无法获取角色名称:', e);
        }
        
        console.log('预览数据获取成功:', response.data);
      } else {
        setPreviewError(response.message || '获取预览数据失败');
      }
      
    } catch (error: any) {
      console.error('获取预览数据失败:', {
        error: error,
        response: error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      // 更详细的错误信息
      let errorMessage = '获取预览数据失败';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.statusText) {
        errorMessage = `服务器错误: ${error.response.status} ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPreviewError(errorMessage);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // 处理用户数据和WebSocket连接
  useEffect(() => {
    const handleUserDataProcessing = async () => {
      try {
        // 从localStorage获取用户数据
        const userData = localStorage.getItem('previewUserData');
        const bookId = localStorage.getItem('previewBookId') || searchParams.get('bookid');
        
        if (!userData || !bookId) {
          console.warn('缺少用户数据或书籍ID');
          // 仍然尝试获取预览数据
          await fetchPreviewData();
          return;
        }

        const parsedUserData = JSON.parse(userData);
        console.log('开始处理用户数据:', parsedUserData);

        setIsProcessing(true);
        console.log('开始处理用户数据...');

        // 调用API处理用户数据
        try {
          // 构造API要求的请求数据格式
          const character = parsedUserData.characters?.[0];
          const apiRequestData = {
            picbook_id: bookId,
            face_image: character?.photo,
            full_name: character?.full_name,
            language: character?.language,
            gender: character?.gender,
            skincolor: character?.skincolor
          };
          
          // 添加详细的调试日志
          console.log('调用换脸接口（有用户数据）:', {
            url: '/simple-face-swap/create-by-picbook',
            originalData: parsedUserData,
            apiRequestData: apiRequestData,
            bookId: bookId
          });
          
          const response = await api.post(`/simple-face-swap/create-by-picbook`, apiRequestData, {
            timeout: 60000 // 60秒超时
          }) as ApiResponse<PreviewResponse>;
          
          console.log('换脸接口调用成功:', response);
          
          // 保存预览数据
          if (response.success) {
            setPreviewData(response.data!);
            
            // 由于新的API结构中characters是数字数组，我们从localStorage获取角色名称
            try {
              const userData = localStorage.getItem('previewUserData');
              if (userData) {
                const parsedUserData = JSON.parse(userData);
                const character = parsedUserData.characters?.[0];
                const newGiver = character?.full_name || '';
                // 只有当 giver 值不同时才更新，避免无限循环
                if (giver !== newGiver) {
                  setGiver(newGiver);
                }
              }
            } catch (e) {
              console.warn('无法获取角色名称:', e);
            }
            
            toast.success('处理已开始，请等待WebSocket通知');
          }
          
          setIsProcessing(false);
          
          // 清理localStorage（成功后立即清理）
          localStorage.removeItem('previewUserData');
          localStorage.removeItem('previewBookId');
          
        } catch (error: any) {
          console.error('换脸接口调用失败:', {
            error: error,
            response: error.response,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url
          });
          setIsProcessing(false);
          
          // 更详细的错误信息
          let errorMessage = '换脸处理失败';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response?.statusText) {
            errorMessage = `服务器错误: ${error.response.status} ${error.response.statusText}`;
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = '请求超时，请检查网络连接';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast.error(errorMessage);
        }

        // 设置WebSocket监听
        if (echo && user) {
          const channel = echo.channel(`face-swap.${user.id}`);
          
          // 监听生成完成事件
          channel.listen('face-swap.complete', (e: { success: boolean; message: string }) => {
            console.log('生成完成:', e);
            setIsProcessing(false);
            if (e.success) {
              toast.success('图片生成完成！');
                        // 重新获取预览数据
          // 使用 setTimeout 避免在事件处理中直接调用
          setTimeout(() => {
            fetchPreviewData();
          }, 100);
            } else {
              toast.error('生成失败: ' + e.message);
            }
          });

          // 监听错误事件
          channel.listen('face-swap.error', (e: { message: string }) => {
            console.error('生成错误:', e.message);
            setIsProcessing(false);
            toast.error('生成失败: ' + e.message);
          });

          // 清理函数
          return () => {
            channel.stopListening('face-swap.complete');
            channel.stopListening('face-swap.error');
          };
        } else {
          console.warn('WebSocket连接未初始化或用户未登录');
        }

      } catch (error) {
        console.error('处理用户数据时出错:', error);
        setIsProcessing(false);
        toast.error('处理失败，请重试');
      }
    };

    handleUserDataProcessing();
  }, []);

  // 点击侧边栏项，滚动到对应部分
  const scrollToSection = (sectionId: string) => {
    let ref: React.RefObject<HTMLDivElement | null> | null = null;
    switch(sectionId) {
      case "giverDedication": ref = giverDedicationRef; break;
      case "confirmation": ref = confirmationRef; break;
      case "coverDesign": ref = coverDesignRef; break;
      case "bookFormat": ref = bookFormatRef; break;
      case "otherGifts": ref = otherGiftsRef; break;
      default: break;
    }
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // 各部分的完成状态判断
  const completedSections = {
    giverDedication: giver.trim() !== "" && dedication.trim() !== "",
    confirmation: confirmationDone,
    coverDesign: selectedBookCover !== null,
    bookFormat: selectedBookFormat !== null,
    otherGifts: selectedBookWrap !== null,
  };

  // 点击 Continue 按钮处理：添加到购物车
  const handleContinue = async () => {
    try {
      // 检查是否所有必要的部分都已完成
      const incompleteSections = Object.entries(completedSections)
        .filter(([_, completed]) => !completed)
        .map(([section, _]) => section);

      if (incompleteSections.length > 0) {
        // 如果有未完成的部分，跳转到第一个未完成的部分
        const firstIncomplete = incompleteSections[0];
        if (firstIncomplete === "giverDedication" || firstIncomplete === "confirmation") {
          setActiveTab("Book preview");
        } else {
          setActiveTab("Others");
        }
        setTimeout(() => {
          scrollToSection(firstIncomplete);
        }, 100);
        return;
      }

      // 检查是否有预览数据
      if (!previewData?.preview_id) {
        toast.error('缺少预览数据');
        return;
      }

      setIsAddingToCart(true);

      // 构建添加到购物车的数据
      const cartData: CartAddRequest = {
        preview_id: previewData.preview_id,
        quantity: 1
      };

      // 调用添加到购物车的API
      const fullUrl = 'https://api.dreamazebook.com/api/cart/add';
      console.log('调用购物车API:', {
        url: fullUrl,
        method: 'POST',
        data: cartData
      });
      
      // 确保使用正确的HTTP方法
      const response = await api.post('/cart/add', cartData) as ApiResponse<CartAddResponse>;

      if (response.success) {
        toast.success('商品已成功添加到购物车！');
        // 跳转到购物车页面
        router.push('/shopping-cart');
      } else {
        toast.error(response.message || '添加到购物车失败');
      }
    } catch (error: any) {
      console.error('添加到购物车失败:', error);
      toast.error(error.response?.data?.message || '添加到购物车失败，请重试');
    } finally {
      setIsAddingToCart(false);
    }
  };

  //寄语
  const MAX_LINES = 10;
  const MAX_CHARS = 300;
  const defaultName = "User"; // 定义 defaultName

  const defaultMessage = `Dear ${defaultName},
  The world is full of wonderful, surprising places to explore. May your days be full of discoveries, adventure and joy!`;

  const [message, setMessage] = React.useState(defaultMessage);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    // 限制行数：按换行符拆分后行数不能超过 MAX_LINES
    const lines = value.split('\n');
    if (lines.length > MAX_LINES) {
      return;
    }

    // 限制字数
    if (value.length > MAX_CHARS) {
      return;
    }

    setMessage(value);
  };

  //定义状态控制抽屉显示
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 用来获取 Drawer 内部 DOM 节点
  const drawerRef = useRef<HTMLDivElement>(null);

  // 处理点击 "View Details" 链接
  const handleViewDetails = (
    option: typeof bookWrapOptions[0],
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.stopPropagation(); // 阻止冒泡
    setDetailModal(option);
    setCurrentIndex(0);
    if (!drawerOpen) {
      setDrawerOpen(true);
    }
  };

  // 当抽屉打开时添加 document 级别点击监听
  useEffect(() => {
    if (!drawerOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      // 如果点击的是"more details"链接
      if ((event.target as HTMLElement).closest('.more-details')) {
        // 不关闭抽屉，直接更新内容（more details 点击处理函数会在点击时调用 event.stopPropagation()）
        return;
      }
      // 如果点击在 Drawer 内部，不关闭
      if (drawerRef.current && drawerRef.current.contains(event.target as Node)) {
        return;
      }
      // 否则关闭抽屉
      setDrawerOpen(false);
      // 延迟清除 detailModal，等动画结束后再清除
      setTimeout(() => setDetailModal(null), 300);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <div className="w-full pt-[12px] px-4 md:mr-[280px] flex flex-col items-center">
        {/* 固定的导航栏 */}
        <div className="fixed top-0 left-0 pt-[12px] px-4 z-50 w-full md:w-[calc(100%-280px)] flex flex-col items-center">
          <div className="w-[95%] mx-auto">
            <TopNavBarWithTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {activeTab === 'Book preview' ? (
          <main className="flex-1 flex flex-col items-center justify-start w-full pt-14">
            <h1 className="text-[28px] mt-2 mb-4 text-center w-full">Your Book Preview</h1>
            
            {/* 书籍封面 */}
            <div className="flex flex-col items-center w-full max-w-3xl">
              <div className="w-full flex justify-center mb-8">
                {bookInfo?.default_cover ? (
                  <OptimizedImage
                    src={buildImageUrl(bookInfo.default_cover)}
                    alt="Book Cover"
                    width={400}
                    height={392}
                    className="max-w-sm rounded-lg shadow-md"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      console.error(`封面图片加载失败: ${bookInfo.default_cover}`);
                    }}
                    onLoad={() => {
                      console.log(`封面图片加载成功: ${bookInfo.default_cover}`);
                    }}
                  />
                ) : (
                  <Image
                    src="/book.png"
                    alt="Book Cover"
                    width={400}
                    height={392}
                    className="max-w-sm rounded-lg shadow-md"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
            </div>


            {/* Giver & Dedication 编辑区域 - Canvas 300dpi 渲染 */}
            <div className="w-full max-w-5xl mb-8">
              {viewMode === 'single' ? (
                <div className="flex flex-col items-center gap-6">
                  <GiverDedicationCanvas
                    className="w-full max-w-[500px]"
                    imageUrl={`/picbooks/${searchParams.get('bookid') || '1'}/giver.webp`}
                    mode="single"
                    giverText={giver}
                    dedicationText={dedication}
                  />
                  {/* 单页模式：按钮置于画布下方 */}
                  <div className="w-full flex flex-col items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setEditField('giver')}
                      className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                    >
                      Edit Giver
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditField('dedication')}
                      className="text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                    >
                      Edit Dedication
                    </button>
                  </div>
                </div>
              ) : (
                <div ref={giverDedicationRef} className="w-full flex justify-center">
                  <div className="relative w-full">
                    <GiverDedicationCanvas
                      className="w-full"
                      imageUrl={`/picbooks/${searchParams.get('bookid') || '1'}/giver.webp`}
                      mode="double"
                      giverText={giver}
                      dedicationText={dedication}
                    />
                    {/* 双页模式：按钮覆盖在左右半区 */}
                    <div className="pointer-events-none">
                      <div className="absolute bottom-[20%] left-0 w-1/2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setEditField('giver')}
                          className="pointer-events-auto text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                        >
                          Edit Giver
                        </button>
                      </div>
                      <div className="absolute bottom-[20%] right-0 w-1/2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setEditField('dedication')}
                          className="pointer-events-auto text-black rounded border border-black py-2 px-4 text-sm sm:text-base md:text-base bg-white/80 backdrop-blur-sm"
                        >
                          Edit Dedication
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* 换脸状态信息 */}
            {previewData?.face_swap_info && (
              <div className="w-full max-w-5xl mx-auto py-[12px] px-[24px] mb-8 border bg-[#FCF2F2] border-[#222222] rounded-[4px] text-center text-[#222222]">
                {previewData.face_swap_info.status === 'processing' && (
                  <p>Your book preview is currently being generated, please wait... ({previewData.face_swap_info.total_tasks} pages need face swapping)</p>
                )}
                {previewData.face_swap_info.status === 'completed' && (
                  <p>Book preview has been generated successfully!</p>
                )}
                {previewData.face_swap_info.status === 'failed' && (
                  <p>Generation failed, please try again.</p>
                )}
              </div>
            )}
            
            {/* 页面预览 */}
            {previewData?.preview_data && previewData.preview_data.length > 0 && (
              <div className="w-full max-w-5xl mb-8">
                <div className="w-full flex flex-col items-center gap-8">
                  {previewData.preview_data.map((page, index) => {
                    // 判断是否为换脸中的页面，根据face_swap_info的状态
                    const isSwapping = page.has_face_swap && previewData.face_swap_info?.status === 'processing';
                    
                    return (
                      <div key={page.page_id} className="w-full flex justify-center">
                        <div className="w-full max-w-5xl">
                          {viewMode === 'single' ? (
                            // Single page mode: 左右分割显示
                            <div className="w-full flex flex-col items-center gap-4">
                              {/* 左半部分 */}
                              <div className="w-full flex justify-center">
                                <div className="relative max-w-[500px] w-full" style={{ aspectRatio: '512/519' }}>
                                  {isSwapping ? (
                                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="flex justify-center mb-4">
                                          <div className="flex space-x-2">
                                            <MirageLoader size="60" speed="2.5" color="blue" />
                                          </div>
                                        </div>
                                        <p className="text-gray-600">正在生成换脸图片...</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
                                      <img
                                        src={buildImageUrl(page.image_url)}
                                        alt={`Page ${page.page_number} - Left Half`}
                                        className="object-cover rounded-lg"
                                        style={{ 
                                          objectPosition: 'left center',
                                          width: '100%',
                                          height: '100%'
                                        }}
                                        onError={(e) => {
                                          console.error(`图片加载失败: ${page.image_url}`);
                                        }}
                                        onLoad={() => {
                                          console.log(`图片加载成功: ${page.image_url}`);
                                        }}
                                      />
                                    </div>
                                  )}
                                  {/* 如果是换脸页面，显示标识 */}
                                  {page.has_face_swap && !isSwapping && (
                                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs z-10">
                                      换脸完成
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* 右半部分 */}
                              <div className="w-full flex justify-center">
                                <div className="relative max-w-[500px] w-full" style={{ aspectRatio: '512/519' }}>
                                  {isSwapping ? (
                                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="flex justify-center mb-4">
                                          <div className="flex space-x-2">
                                            <MirageLoader size="60" speed="2.5" color="blue" />
                                          </div>
                                        </div>
                                        <p className="text-gray-600">正在生成换脸图片...</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
                                      <img
                                        src={buildImageUrl(page.image_url)}
                                        alt={`Page ${page.page_number} - Right Half`}
                                        className="object-cover rounded-lg"
                                        style={{ 
                                          objectPosition: 'right center',
                                          width: '100%',
                                          height: '100%'
                                        }}
                                        onError={(e) => {
                                          console.error(`图片加载失败: ${page.image_url}`);
                                        }}
                                        onLoad={() => {
                                          console.log(`图片加载成功: ${page.image_url}`);
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {page.content && (
                                <div className="mt-2 p-2 bg-gray-100 rounded w-full max-w-2xl">
                                  <p className="text-sm">{page.content}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Double page mode: 保持原有显示方式
                            <div className="w-full relative">
                              {isSwapping ? (
                                // 换脸处理中状态
                                <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="flex justify-center mb-4">
                                      <div className="flex space-x-2">
                                        <MirageLoader size="60" speed="2.5" color="blue" />
                                      </div>
                                    </div>
                                    <p className="text-gray-600">正在生成换脸图片...</p>
                                  </div>
                                </div>
                              ) : (
                                // 正常显示图片
                                <div className="w-full relative">
                                  <OptimizedImage
                                    src={buildImageUrl(page.image_url)}
                                    alt={`Page ${page.page_number}`}
                                    width={1600}
                                    height={600}
                                    className="w-full h-auto rounded-lg object-cover"
                                    onError={(e) => {
                                      console.error(`图片加载失败: ${page.image_url}`);
                                    }}
                                    onLoad={() => {
                                      console.log(`图片加载成功: ${page.image_url}`);
                                    }}
                                  />
                                  {/* 如果是换脸页面，显示标识 */}
                                  {page.has_face_swap && (
                                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                      换脸完成
                                    </div>
                                  )}
                                </div>
                              )}
                              {page.content && (
                                <div className="mt-2 p-2 bg-gray-100 rounded w-full">
                                  <p className="text-sm">{page.content}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            
            
            {/* 处理状态 */}
            {isProcessing && (
              <div className="w-full max-w-5xl mx-auto py-[12px] px-[24px] mb-8 border bg-[#E8F4FD] border-[#012CCE] rounded-[4px] text-center text-[#012CCE]">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>正在处理您的数据...</span>
                </div>
              </div>
            )}

            <div ref={confirmationRef} className="w-full max-w-5xl mx-auto py-[12px] px-[24px] mb-8 border bg-[#FCF2F2] border-[#222222] rounded-[4px] text-center text-[#222222] flex flex-col gap-4">
              <div>
                <p>We will only provide a preview of 7 pages of book content.</p>
                <p>
                  After you pay, we will send the entire book content to you via email for confirmation within 48 hours.
                  Please confirm within 48 hours of receiving the information, otherwise the system will automatically determine.
                </p>
              </div>
              <label className="justify-center inline-flex items-center cursor-pointer h-10">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={confirmationDone}
                  onChange={(e) => setConfirmationDone(e.target.checked)}
                />
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#222222]">
                  {confirmationDone && <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 3.5L5 7L11 1" stroke="#012CCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>}
                </div>
                <span className="ml-2 text-gray-800 leading-10">I understand and accept</span>
              </label>
            </div>

            

          </main>
        ) : (
          // Others 标签页内容
          <main className="flex-1 flex flex-col items-center justify-center w-full gap-[64px] pt-14">
            {/* Book Cover Section */}
            <section ref={coverDesignRef} className="w-full mt-2 max-w-3xl mx-auto">
              <h1 className="text-[28px] text-center mb-2">Book Cover</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred cover design.
              </p>

              {/* 加载状态 */}
              {isLoadingOptions && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>正在加载封面选项...</p>
                  </div>
                </div>
              )}

              {/* 错误状态 */}
              {optionsError && (
                <div className="w-full max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">错误: {optionsError}</p>
                  <button 
                    onClick={fetchBookOptions}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    重试
                  </button>
                </div>
              )}

              {/* 封面选项 */}
              {!isLoadingOptions && !optionsError && bookOptions && bookOptions.cover_options && bookOptions.cover_options.length > 0 && (
                <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                  {bookOptions.cover_options.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedBookCover(selectedBookCover === option.id ? null : option.id)}
                      className={`bg-white p-4 rounded flex flex-col items-center cursor-pointer ${
                        selectedBookCover === option.id
                          ? 'border-2 border-[#012CCE]'
                          : 'border-2 border-transparent'
                      }`}
                    >
                      <Image
                        src={(() => {
                          // 检查图片URL是否有效
                          if (!option.image_url) {
                            console.log(`Cover ${option.id}: No image_url, using fallback`);
                            return '/imgs/picbook/goodnight/封面1.jpg';
                          }
                          if (option.image_url.includes('example.com')) {
                            console.log(`Cover ${option.id}: Invalid example.com URL, using fallback`);
                            return '/imgs/picbook/goodnight/封面1.jpg';
                          }
                          if (option.image_url.includes('http') && !option.image_url.includes('dreamazebook.com')) {
                            console.log(`Cover ${option.id}: External URL not from dreamazebook.com, using fallback`);
                            return '/imgs/picbook/goodnight/封面1.jpg';
                          }
                          console.log(`Cover ${option.id}: Using valid URL:`, option.image_url);
                          return option.image_url;
                        })()}
                        alt={`Cover ${option.id} - ${option.name}`}
                        width={200}
                        height={200}
                        className="w-full h-auto mb-2"
                        onError={(e) => {
                          console.error(`Failed to load image for cover ${option.id}:`, option.image_url);
                          // 图片加载失败时使用回退图片
                          const target = e.target as HTMLImageElement;
                          target.src = '/imgs/picbook/goodnight/封面1.jpg';
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded image for cover ${option.id}:`, option.image_url);
                        }}
                      />
                      <div className="flex items-center justify-center space-x-2 w-full py-2">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                            selectedBookCover === option.id
                              ? 'bg-[#012CCE] border-[#012CCE]'
                              : 'border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {selectedBookCover === option.id && (
                              <svg
                                className="mx-auto"
                                width="12"
                                height="8"
                                viewBox="0 0 12 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.5 3.5L5 7L11 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </span>
                        <span className="text-center">
                          ${option.price} {option.currency_code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 当没有封面选项时的提示 */}
              {!isLoadingOptions && !optionsError && bookOptions && (!bookOptions.cover_options || bookOptions.cover_options.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无封面选项可用</p>
                </div>
              )}
              
              {/* 临时封面选项 - 当API数据有问题时使用 */}
              {!isLoadingOptions && (optionsError || !bookOptions || !bookOptions.cover_options || bookOptions.cover_options.length === 0) && (
                <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                  {[
                    { id: 1, name: 'Classic Cover', price: 14.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面1.jpg' },
                    { id: 2, name: 'Modern Cover', price: 14.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面2.jpg' },
                    { id: 3, name: 'Premium Cover', price: 19.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面3.jpg' },
                    { id: 4, name: 'Deluxe Cover', price: 24.99, currency_code: 'USD', image_url: '/imgs/picbook/goodnight/封面4.jpg' }
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedBookCover(selectedBookCover === option.id ? null : option.id)}
                      className={`bg-white p-4 rounded flex flex-col items-center cursor-pointer ${
                        selectedBookCover === option.id
                          ? 'border-2 border-[#012CCE]'
                          : 'border-2 border-transparent'
                      }`}
                    >
                      <Image
                        src={option.image_url}
                        alt={`Cover ${option.id} - ${option.name}`}
                        width={200}
                        height={200}
                        className="w-full h-auto mb-2"
                      />
                      <div className="flex items-center justify-center space-x-2 w-full py-2">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                            selectedBookCover === option.id
                              ? 'bg-[#012CCE] border-[#012CCE]'
                              : 'border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {selectedBookCover === option.id && (
                              <svg
                                className="mx-auto"
                                width="12"
                                height="8"
                                viewBox="0 0 12 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.5 3.5L5 7L11 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </span>
                        <span className="text-center">
                          ${option.price} {option.currency_code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            {/* Book Format Section */}
            <section  ref={bookFormatRef} className="w-full mt-2 max-w-3xl mx-auto">
              <h1 className="text-[28px] text-center mb-2">Choose a format for your book</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred book format.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookFormatOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBookFormat(selectedBookFormat === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer ${
                      selectedBookFormat === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <Image
                      src={option.image}
                      alt={option.title}
                      width={300}
                      height={200}
                      className="w-full h-auto mb-2"
                    />
                    <h2 className="text-lg font-medium text-center">{option.title}</h2>
                    <p className="text-lg font-medium text-center mb-2">{option.price}</p>
                    <p className="text-sm text-gray-500 text-center mb-4">{option.description}</p>
                    <div className="flex items-center justify-center mt-auto space-x-2 mb-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                          selectedBookFormat === option.id
                            ? 'bg-[#012CCE] border-[#012CCE]'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedBookFormat === option.id && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 3.5L5 7L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* 便签名称，根据选中状态改变 */}
                      <span className="text-center">
                        {selectedBookFormat === option.id
                          ? `${option.title} Selected`
                          : `Select ${option.title}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Book Wrap Section */}
            <section ref={otherGiftsRef} className="w-full mt-2 max-w-3xl mb-8 mx-auto">
              <h1 className="text-[28px] text-center mb-2">Wrap it up in magic</h1>
              <p className="text-center text-gray-600 mb-4">
                Please select your preferred book wrap option.
              </p>
              <div className="grid grid-cols-2 gap-4 w-[80%] mx-auto">
                {bookWrapOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedBookWrap(selectedBookWrap === option.id ? null : option.id)}
                    className={`bg-white p-4 rounded flex flex-col cursor-pointer ${
                      selectedBookWrap === option.id
                        ? 'border-2 border-[#012CCE]'
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <Image
                      src={option.image}
                      alt={option.title}
                      width={300}
                      height={200}
                      className="w-full h-auto mb-2"
                    />
                    <h2 className="text-lg font-medium text-center">{option.title}</h2>
                    <p className="text-lg font-medium text-center mb-2">{option.price}</p>
                    
                    <a
                      onClick={(e) => handleViewDetails(option, e)}
                      className="more-details text-[#012CCE] inline-flex items-center justify-center gap-x-2 cursor-pointer mb-2"
                    >
                      More Details
                      <svg
                        className="inline-block align-middle"
                        width="18"
                        height="10"
                        viewBox="0 0 18 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 5H17M17 5L12.5 1M17 5L12.5 9"
                          stroke="#012CCE"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                    <p className="text-sm text-gray-500 text-center mb-4">{option.description}</p>
                    <div className="flex items-center justify-center mt-auto space-x-2 mb-2">
                      {/* 左侧圆形选中框 */}
                      <span
                        className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 border rounded-full ${
                          selectedBookWrap === option.id
                            ? 'bg-[#012CCE] border-[#012CCE]'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedBookWrap === option.id && (
                          <svg
                            width="9"
                            height="6"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 3.5L5 7L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* 便签名称，根据选中状态改变 */}
                      <span className="text-center">
                        {selectedBookWrap === option.id
                          ? `${option.title} Selected`
                          : `Select ${option.title}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Drawer
              placement="right"
              onClose={() => {
                setDrawerOpen(false);
                setTimeout(() => setDetailModal(null), 300);
              }}
              open={drawerOpen}
              closable={false}
              mask={false}
              width={400}
            >
              {/* 弹出窗口 */}
              {detailModal && (
                <div 
                  ref={drawerRef} 
                  className="
                    w-full flex flex-col h-full"
                >
                  <div className="relative flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        setTimeout(() => setDetailModal(null), 300);
                      }}
                      className="absolute inline-flex items-center gap-x-2"
                    >
                      <svg
                        width="17"
                        height="10"
                        viewBox="0 0 17 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17 5H1M1 5L5.5 1M1 5L5.5 9" stroke="#222222" />
                      </svg>
                      <span>Back</span>
                    </button>

                    {/* 抽屉内容 */}
                    <div className="mt-8 flex flex-col gap-4">
                      <div>
                        <Image
                          src={detailModal.images[currentIndex]}
                          alt={detailModal.title}
                          width={800}
                          height={600}
                          className="w-full h-auto"
                        />
                        <div className="flex items-center justify-center mt-2 gap-[10px]">
                          <button
                            onClick={() => setCurrentIndex((prev) => prev - 1)}
                            disabled={currentIndex === 0}
                            className="p-2"
                          >
                            <svg
                              width="18"
                              height="10"
                              viewBox="0 0 18 10"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 1L1 5M1 5L5 9M1 5H17"
                                stroke="#222222"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <span className="text-sm text-gray-700">
                            {currentIndex + 1} / {detailModal.images.length}
                          </span>
                          <button
                            onClick={() => setCurrentIndex((prev) => prev + 1)}
                            disabled={currentIndex === detailModal.images.length - 1}
                            className="p-2"
                          >
                            <svg
                              width="18"
                              height="10"
                              viewBox="0 0 18 10"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13 1L17 5M17 5L13 9M17 5H1"
                                stroke="#222222"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl">{detailModal.title}</h2>
                        <p className="text-gray-600 mt-2">
                          {detailModal.fullDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-6 h-[44px] justify-between">
                    <div className="flex items-end gap-3">
                      <span className="text-[#012CCE] text-3xl font-semibold">$320</span>
                      <span className="text-gray-400 line-through">$540</span>
                    </div>
                    <button 
                      onClick={handleContinue}
                      disabled={isAddingToCart}
                      className={`bg-black text-[#F5E3E3] py-2 px-8 rounded flex items-center justify-center ${
                        isAddingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          正在添加...
                        </>
                      ) : (
                        'Add to order'
                      )}
                    </button>
                  </div>
                </div>         
              )}
            </Drawer>
          </main>
        )}

        {editField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {editField === 'giver' ? (
              // Giver's name 弹窗
              <div className="bg-white w-[400px] h-[196px] rounded-sm pt-6 pr-6 pb-3 pl-6 flex flex-col gap-9">
                {/* 标题和关闭按钮 */}
                <div className="w-[352px] h-[80px] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Giver&apos;s name</h2>
                    <button
                      className="text-xl text-gray-500 hover:text-gray-700"
                      onClick={() => setEditField(null)}
                    >
                      &#x2715;
                    </button>
                  </div>
                  {/* 输入区域 */}
                  <div className="w-full">
                    <textarea
                      value={giver}
                      onChange={(e) => setGiver(e.target.value)}
                      placeholder="Please enter..."
                      className="w-full h-[40px] p-2 border border-[#E5E5E5] rounded placeholder-[#999999] focus:outline-none ring-0"
                    />
                  </div>
                </div>
                {/* 保存按钮 */}
                <div className="flex justify-end">
                  <button
                    className="bg-[#222222] text-[#F5E3E3] py-2 px-4 rounded-sm"
                    onClick={() => {
                      setEditField(null);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              // 寄语弹窗
              <div className="bg-white w-[600px] h-[464px] rounded-sm pt-6 pr-6 pb-3 pl-6 flex flex-col gap-7">
                {/* 标题、关闭按钮和填写区域 */}
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Dedication</h2>
                    <button
                      className="text-xl text-gray-500 hover:text-gray-700"
                      onClick={() => setEditField(null)}
                    >
                      &#x2715;
                    </button>
                  </div>
                  <div className="flex text-gray-500 text-sm">
                    <span>
                      There&apos;s 10 line limit (including blank lines)
                    </span>
                  </div>
                  <div className="w-full">
                    <textarea
                      rows={10}
                      value={message}
                      onChange={handleMessageChange}
                      placeholder="Please enter your message..."
                      className="w-full p-2 border border-[#E5E5E5] placeholder-[#999999] rounded focus:outline-none ring-0 resize-none"
                    />
                    <div className="flex justify-end space-x-4 text-[#999999] text-sm">
                      <span>
                        {message.length}/{MAX_CHARS} left
                      </span>
                      <span>
                        {message.split('\n').length}/{MAX_LINES} line
                      </span>
                    </div>
                  </div>
                </div>
                {/* 保存按钮 */}
                <div className="flex justify-end">
                  <button
                    className="bg-[#222222] text-[#F5E3E3] py-2 px-4 rounded-sm"
                    onClick={() => {
                      setDedication(message);
                      setEditField(null);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 右侧侧边栏 */}
      <aside className="hidden md:flex fixed right-0 top-0 h-full w-[280px] bg-white py-[64px]">
        <div className="mx-auto flex flex-col justify-between h-full">
          {/* 顶部区域：侧边栏条目 */}
          <div className="flex flex-col gap-[4px] py-[24px]">
            {sidebarItems.map((item, index) => {
              const isActive = activeSection === item.id;
              const isCompleted = completedSections[item.id as keyof typeof completedSections];
              const iconClass = isCompleted
              ? "w-full h-full text-[#012CCE]"
              : isActive
              ? "w-full h-full text-[#012CCE]"
              : "w-full h-full text-[#CCCCCC]";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.id === "giverDedication" || item.id === "confirmation") {
                      setActiveTab("Book preview");
                    } else {
                      setActiveTab("Others");
                    }
                    setTimeout(() => {
                      scrollToSection(item.id);
                    }, 100);
                  }}
                  className={`w-full flex flex-col cursor-pointer ${isActive ? 'font-medium' : 'font-normal'}`}
                >
                  {/* 图标和文本在同一行，左对齐 */}
                  <div className="flex">
                    {/* 图标及竖线容器 */}
                    <div className="flex flex-col items-center">
                      {/* 固定为 24x24 的图标 */}
                      <div className="w-[24px] h-[24px] flex items-center justify-center">
                        {completedSections[item.id as keyof typeof completedSections] ? (
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 3.5L5 7L11 1" stroke="#012CCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : React.cloneElement(item.icon, {
                          className: `${item.icon.props.className ?? ""} ${iconClass}`,
                        })}
                        
                      </div>
                      {/* 除最后一项外，图标下方添加灰色竖线 */}
                      {index !== sidebarItems.length - 1 && (
                        <div className="w-px h-[60px] bg-[#CCCCCC] mt-1"></div>
                      )}
                    </div>
                    {/* 文本标签，位于图标右侧并顶端对齐 */}
                    <span className="ml-2 self-start">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto">
            <button
              onClick={handleContinue}
              disabled={isAddingToCart}
              className={`w-full px-6 py-2 rounded flex items-center justify-center ${
                isAddingToCart 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#222222] hover:bg-[#333333]'
              } text-[#F5E3E3]`}
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  正在添加到购物车...
                </>
              ) : (
                'Add to cart'
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

