import { HOME_PACKAGES } from '@/constants/cdn';
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
      quantity: 'x3',
      title: 'Growing Together Set',
      description: 'Perfect for siblings or friends',
      discount: '20%',
      extras: 'holiday extras',
      width: 148,
      image: HOME_PACKAGES('pic_1.webp')
    },
    {
      id: 2,
      quantity: 'x4',
      title: 'Family Keepsake Set',
      description: 'One story for each child to feel seen',
      discount: '20%',
      extras: 'free personalized cover',
      width: 148,
      image: HOME_PACKAGES('pic_2.webp')
    },
    {
      id: 3,
      quantity: 'x5',
      title: 'Growing Up Collection',
      description: 'Capture every chapter of childhood.',
      discount: '20%',
      extras: 'premium festive wrapping',
      width: 160,
      image: HOME_PACKAGES('pic_3.webp')
    }
  ]
};