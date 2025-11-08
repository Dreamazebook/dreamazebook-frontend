import React from 'react';

// 定义书籍section的类型
export interface BookSection {
  type: 'behind-story' | 'toddler-favorites' | 'why-personalized' | 'meet-author' | 'custom'; // section类型，可以扩展
  title?: string; // section标题
  content?: string; // section内容
  description?: string; // section描述文字
  backgroundImage?: string; // 背景图片URL
  backgroundOverlay?: string; // 背景遮罩样式
  className?: string; // 额外的CSS类名
  render?: () => React.ReactNode; // 自定义渲染函数（可选）
  // Meet Author 专用字段
  authorImage?: string; // 作者图片URL
  paragraphs?: string[]; // 段落数组
  // SVG 装饰元素配置
  svgDecorations?: Array<{
    svg: React.ReactNode; // SVG元素
    width: string | number;
    height: string | number;
    position: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
    transform?: string; // 旋转或其他变换
    zIndex?: number;
  }>;
  // Toddler Favorites 专用字段
  books?: Array<{
    title: string;
    subtitle: string;
    coverImage: string;
    price: string;
    backgroundColor?: string;
    backgroundImage?: string;
  }>;
  originalPrice?: string; // 原价
  discountedPrice?: string; // 折后价
  buttonText?: string; // 按钮文字
  // Why Personalized 专用字段
  items?: Array<{
    title: string;
    description: string;
    backgroundImage?: string; // 卡片右侧/底部背景图，稍后由你提供
  }>;
}

// 定义书籍规格的类型
export interface BookSpecification {
  label: string; // 规格标签文本（支持国际化 key 或直接文本）
  value?: string; // 规格值（如果 label 是国际化 key，则 value 会被忽略）
}

// 定义书籍配置的类型
export interface BookConfig {
  id: string | number; // 书籍ID或代码
  sections: BookSection[]; // 该书籍显示的sections
  specifications?: BookSpecification[]; // 该书籍的规格信息（可选，如果没有则使用默认值）
}

// 存储不同书籍的配置
export const BOOKS_CONFIG: Record<string | number, BookConfig> = {
  // Good Night 书籍配置
  'PICBOOK_GOODNIGHT': {
    id: 'PICBOOK_GOODNIGHT',
    // 如果没有指定 specifications，将使用默认值（从国际化文件读取）
    specifications: [
      { label: 'specifications.size' },
      { label: 'specifications.pages' },
      { label: 'specifications.delivery' },
    ],
    sections: [
      {
        type: 'behind-story',
        title: 'Behind the Story',
        content: `Bedtime stories have always been part of my daughter's routine.
But sometimes, the stories made her too excited to fall asleep.
I wanted to create a story that gently guides children into dreamland.
A story that makes them look forward to bedtime, with adventures waiting after they close their eyes.
Turning sleep into something exciting helps reduce delays and makes nights calmer for everyone.`,
        backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-behind.jpg',
        backgroundOverlay: 'linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8))',
        className: 'md:h-[408px] md:py-[88px] h-[500px] py-[32px] px-[12px]',
      },
      {
        type: 'toddler-favorites',
        title: 'Toddler Favorites',
        description: `Make storytime more meaningful with books toddlers love to hear again and again.
 These titles are often chosen together for ages 2–5.`,
        className: 'w-full h-auto py-[88px] md:px-[0px] px-[20px] mx-auto flex flex-col gap-[48px]',
        books: [
          {
            title: 'Goodnight to You',
            subtitle: 'Gentle bedtime routine',
            coverImage: '', // 需要添加实际图片URL
            price: '$12.2',
            backgroundColor: '#4A90E2', // 蓝色背景
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_1.png',
          },
          {
            title: "You’re Brave in Many Ways",
            subtitle: 'Everyday courage',
            coverImage: '', // 需要添加实际图片URL
            price: '$4.2',
            backgroundColor: '#FFD700', // 黄色背景
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_2.png',
          },
          {
            title: 'Birthday Book for You',
            subtitle: 'Special day keepsake',
            coverImage: '', // 需要添加实际图片URL
            price: '$8.5',
            backgroundColor: '#FF6B6B', // 红色背景
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_3.png',
          },
        ],
        originalPrice: '$25.0',
        discountedPrice: '$19.9',
        buttonText: 'add bundle to bag',
      },
      {
        type: 'why-personalized',
        title: 'Why you need a personalized book?',
        className: 'px-[88px] py-[120px] mx-auto md:w-full md:px-0 md:h-[860px] md:pt-[88px] md:pb-[128px]',
        items: [
          {
            title: 'Makes bedtime easier',
            description: 'Kids calm down faster when they see themselves in the story.',
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card.png'
          },
          {
            title: 'Builds self-recognition',
            description: 'Like a mirror in story form, helping children feel seen and valued.',
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card.png'
          },
          {
            title: 'Strengthens bonding',
            description: 'Creates meaningful parent–child moments you’ll both remember.',
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card.png'
          },
          {
            title: 'A keepsake for life',
            description: 'More than a book, it’s a treasure you’ll want to keep forever.',
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card.png'
          }
        ]
      },
    ],
  },
  
  // You're Brave in Many Ways 书籍配置
  'PICBOOK_YOUAREBRAVEYINMANYWAYS': {
    id: 'PICBOOK_YOUAREBRAVEYINMANYWAYS',
    specifications: [
      { label: 'Best for ages 3–8' }, // 直接文本
      { label: 'Landscape format' }, // 直接文本
      { label: '34 pages' }, // 直接文本
      { label: 'specifications.delivery' }, // 使用国际化 key
    ],
    sections: [
      {
        type: 'meet-author',
        title: 'Meet the Author',
        authorImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_YOUAREBRAVEYINMANYWAYS/bg-author.jpg',
        paragraphs: [
          "As a mom, I noticed a stage when my toddler was afraid to try many things. It's a normal part of early childhood development, but telling him \"be brave\" often made him doubt himself even more.",
          "So I wrote this book — to show him that courage is already part of his everyday life, from simple daily acts to new challenges. When he saw himself in the story, he truly believed he was a little warrior.",
        ],
      },
    ],
  },
  
  // 可以在这里添加其他书籍的配置
  // 示例：另一本书的配置（使用自定义规格）
  // 'PICBOOK_SANTALETTER': {
  //   id: 'PICBOOK_SANTALETTER',
  //   specifications: [
  //     { label: 'Best for ages 3–8' }, // 直接文本
  //     { label: 'Landscape format' }, // 直接文本
  //     { label: '34 pages' }, // 直接文本
  //     { label: 'specifications.delivery' }, // 使用国际化 key
  //   ],
  //   sections: [
  //     {
  //       type: 'custom',
  //       title: 'Special Section',
  //       content: 'Custom content here...',
  //     },
  //   ],
  // },
};

// 根据书籍ID获取配置
export const getBookConfig = (book: any, id: string | number): BookConfig | null => {
  // 尝试通过book.id获取
  if (book?.id && BOOKS_CONFIG[book.id]) {
    return BOOKS_CONFIG[book.id];
  }
  
  // 尝试通过spu_code获取
  const spuCode = (book as any)?.spu_code || (book as any)?.code;
  if (spuCode && BOOKS_CONFIG[spuCode]) {
    return BOOKS_CONFIG[spuCode];
  }
  
  // 尝试通过URL中的id获取
  if (id && BOOKS_CONFIG[id]) {
    return BOOKS_CONFIG[id];
  }
  
  return null;
};

