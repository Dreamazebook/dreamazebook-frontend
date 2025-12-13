import { BookSection } from './booksConfig';

// Gift Package 数据接口
export interface GiftPackage {
  id: number;
  quantity: string;
  title: string;
  description: string;
  discount: string;
  extras: string;
  image: string;
  width?: number;
}

// Gift Packages Section 配置接口
export interface GiftPackagesConfig {
  type: "gift-packages";
  bannerImage: string;
  bannerTitle: string;
  bannerDescription: string[];
  waveImage: string;
  giftPackages: GiftPackage[];
}

// 默认的 Gift Packages 数据
export const DEFAULT_GIFT_PACKAGES_CONFIG: GiftPackagesConfig = {
  type: 'gift-packages',
  bannerImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/home/top_picks_this_month/banner.webp',
  bannerTitle: 'Ready-to-Gift Packages',
  bannerDescription: [
    'Handpicked bundles with books + keepsakes - beautifully wrapped for effortless gifting.',
    'Create your own perfect gift set'
  ],
  waveImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/home/top_picks_this_month/wave_2.webp',
  giftPackages: [
    {
      id: 1,
      quantity: 'x2',
      title: 'Side by Side Set',
      description: 'Perfect for siblings or friends',
      discount: '10%',
      extras: 'holiday extras',
      width: 148,
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/home/ready_to_gift_packages/pic_1.webp'
    },
    {
      id: 2,
      quantity: 'x3',
      title: 'Growing Together Set',
      description: 'One story for each child to feel seen',
      discount: '15%',
      extras: 'free personalized cover',
      width: 148,
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/home/ready_to_gift_packages/pic_2.webp'
    },
    {
      id: 3,
      quantity: 'x4',
      title: 'Holiday Sharing Set',
      description: 'A joyful gift for holiday gatherings.',
      discount: '20%',
      extras: 'premium festive wrapping',
      width: 160,
      image: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/home/ready_to_gift_packages/pic_3.webp'
    }
  ]
};