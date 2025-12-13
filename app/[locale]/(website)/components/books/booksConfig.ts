import React from 'react';
import { DEFAULT_GIFT_PACKAGES_CONFIG } from './giftPackagesData';

// 定义书籍section的类型
export interface BookSection {
  type: 'behind-story' | 'toddler-favorites' | 'why-personalized' | 'meet-author' | 'tips' | 'custom' | 'christmas-wonder' | 'personalization-power' | 'dreamaze-special' | 'faq' | 'gift-packages'; // section类型，可以扩展
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
  // Tips 专用字段
  tips?: string[]; // 提示列表数组
  bulletImage?: string; // Bullet point 图片URL（已废弃，使用 bulletImages）
  bulletImages?: string[]; // Bullet point 图片URL数组，与 tips 一一对应
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
    // 用于 bundle 加购（batch-add）时映射到对应产品
    spuCode?: string;
  }>;
  originalPrice?: string; // 原价
  discountedPrice?: string; // 折后价
  buttonText?: string; // 按钮文字
  bundleImage?: string; // Bundle 背景图（桌面端）
  bundleImageMobile?: string; // Bundle 背景图（移动端）
  // Why Personalized 专用字段
  items?: Array<{
    title: string;
    description: string;
    backgroundImage?: string; // 卡片右侧/底部背景图，稍后由你提供
  }>;
  // Christmas Wonder 专用字段
  illustrationImage?: string; // 左侧插图URL
  testimonials?: Array<{
    text: string;
    avatar?: string; // 头像URL（可选）
  }>;
  // Dreamaze Special 专用字段
  features?: Array<{
    title: string;
    description: string;
    icon?: string; // 图标URL（可选）
  }>;
  specialTestimonials?: Array<{
    text: string;
    author: string; // 作者姓名和城市
    avatar?: string; // 头像URL（可选）
  }>;
  // FAQ 专用字段
  faqs?: BookFAQ[]; // FAQ列表
  // Gift Packages 专用字段
  giftPackages?: Array<{
    id: number;
    quantity: string;
    title: string;
    description: string;
    discount: string;
    extras: string;
    image: string;
    width?: number;
  }>;
  bannerImage?: string; // 顶部横幅背景图
  bannerTitle?: string; // 横幅标题
  bannerDescription?: string[]; // 横幅描述（数组）
  waveImage?: string; // 波浪装饰图
}

// 定义书籍规格的类型
export interface BookSpecification {
  label: string; // 规格标签文本（支持国际化 key 或直接文本）
  value?: string; // 规格值（如果 label 是国际化 key，则 value 会被忽略）
}

// 定义 FAQ 的类型
export interface BookFAQ {
  question: string; // 问题
  answer: string; // 答案（支持多行文本，使用 \n 分隔）
}

// 定义书籍配置的类型
export interface BookConfig {
  id: string | number; // 书籍ID或代码
  sections: BookSection[]; // 该书籍显示的sections
  specifications?: BookSpecification[]; // 该书籍的规格信息（可选，如果没有则使用默认值）
  faqs?: BookFAQ[]; // 该书籍的 FAQ 列表（可选）
}

const GOODNIGHT_BASE_CONFIG: Omit<BookConfig, 'id'> = {
    // 如果没有指定 specifications，将使用默认值（从国际化文件读取）
    specifications: [
      { label: 'Best for ages 3–6' },
      { label: '20 × 20 cm hardcover' },
      { label: '36 pages' },
      { label: 'Printed and dispatched in 2–4 working days' },
    ],
    faqs: [
      {
        question: 'How is the book personalized?',
      answer:
        "- Add your child's name — the star of this story\n- Customize features (skin tone, hairstyle, hair color)\n- Upload a clear photo for accurate personalization\n- Add your dedication — printed on the first page\n- Choose your cover and gift options\n- Place your order — preview before printing",
      },
      {
        question: 'Why children love it?',
      answer:
        "In this bedtime adventure, your little one grows magical wings and soars across the world—flying over deserts, oceans, and forests, saying goodnight to animals big and small.\nIt's a gentle, imaginative story that helps children drift into sweet dreams while feeling safe, loved, and ready for sleep.",
      },
      {
        question: 'Reading tips for parents',
      answer:
        '- Make it part of your bedtime routine — a calm, cozy way to end the day.\n- Pause and ask gentle questions, like "What dream will you have tonight?" or "Where would you like to fly?"\n- Encourage your child to talk with the book-version of themselves and to say goodnight to the animals.\n- Use a soft, soothing voice to create a sense of comfort and help your child drift off peacefully.',
    },
    ],
    sections: [
      {
        type: 'behind-story',
        title: 'Behind the Story',
        paragraphs: [
          "Bedtime stories have always been part of my daughter's routine.",
          "But sometimes, the stories made her too excited to fall asleep.",
          "I wanted to create a story that gently guides children into dreamland.",
          "A story that makes them look forward to bedtime, with adventures waiting after they close their eyes.",
          "Turning sleep into something exciting helps reduce delays and makes nights calmer for everyone.",
        ],
        authorImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-behind.jpg',
      },
      {
        type: 'toddler-favorites',
        title: 'Toddler Favorites',
        description: `Make storytime more meaningful with books toddlers love to hear again and again.
 These titles are often chosen together for ages 2–5.`,
        className: 'w-full h-auto py-[88px] md:px-[0px] px-[20px] mx-auto flex flex-col gap-[48px]',
      bundleImage:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bundle.png',
      bundleImageMobile:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bundle-mobile.png',
        books: [
          {
            title: 'Goodnight to You',
            subtitle: 'Gentle bedtime routine',
            coverImage: '', // 需要添加实际图片URL
            price: '$12.2',
            backgroundColor: '#4A90E2', // 蓝色背景
          backgroundImage:
            'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_1.png',
            spuCode: 'PICBOOK_GOODNIGHT',
          },
          {
            title: "You're Brave in Many Ways",
            subtitle: 'Everyday courage',
            coverImage: '', // 需要添加实际图片URL
            price: '$4.2',
            backgroundColor: '#FFD700', // 黄色背景
          backgroundImage:
            'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_2.png',
            spuCode: 'PICBOOK_BRAVEY',
          },
        ],
        originalPrice: '$25.0',
        discountedPrice: '$19.9',
        buttonText: 'add bundle to bag',
      },
      {
        type: 'why-personalized',
        title: 'Why You Need a Personalized Book?',
        className: 'py-[48px] mx-auto md:w-full md:px-0 md:h-[860px] md:pt-[88px] md:pb-[128px]',
        items: [
          {
            title: 'Makes bedtime easier',
            description: 'Kids calm down faster when they see themselves in the story.',
            backgroundImage:
              'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card-1.png',
          },
          {
            title: 'Builds self-recognition',
            description: 'Like a mirror in story form, helping children feel seen and valued.',
            backgroundImage:
              'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card-2.png',
          },
          {
            title: 'Strengthens bonding',
            description: 'Creates meaningful parent–child moments you’ll both remember.',
            backgroundImage:
              'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card-3.png',
          },
          {
            title: 'A keepsake for life',
            description: 'More than a book, it’s a treasure you’ll want to keep forever.',
            backgroundImage:
              'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/bg-benefit-card-4.png',
          },
        ],
    },
  ],
};

// 存储不同书籍的配置
export const BOOKS_CONFIG: Record<string | number, BookConfig> = {
  // Good Night 书籍配置
  'PICBOOK_GOODNIGHT3': {
    id: 'PICBOOK_GOODNIGHT3',
    ...GOODNIGHT_BASE_CONFIG,
  },
  'PICBOOK_GOODNIGHT': {
    id: 'PICBOOK_GOODNIGHT',
    ...GOODNIGHT_BASE_CONFIG,
  },
  
  // You're Brave in Many Ways 书籍配置（兼容新版与旧版 ID）
  'PICBOOK_BRAVEY': {
    id: 'PICBOOK_BRAVEY',
    specifications: [
      { label: 'Best for ages 3–8' }, // 直接文本
      { label: 'Landscape format' }, // 直接文本
      { label: '34 pages' }, // 直接文本
      { label: 'specifications.delivery' }, // 使用国际化 key
    ],
    faqs: [
      {
        question: 'How is the book personalized?',
        answer: '- Add your child\'s name — the star of this story\n- Customize features (skin tone, hairstyle, hair color)\n- Upload a clear photo for accurate personalization\n- Add your dedication — printed on the first page\n- Choose your cover and gift options\n- Place your order — preview before printing'
      },
      {
        question: 'Recommendation',
        answer: 'This book is more than a story — it\'s a gentle mirror of your child\'s courage.\nFrom everyday challenges to little triumphs, each page celebrates bravery in forms they already know.\nIt\'s a heartfelt way to help children recognize their own strength, build confidence, and carry a quiet reminder: I am brave in many ways.'
      },
      {
        question: 'Reading tips for parents',
        answer: 'Use the story\'s everyday scenes as a conversation starter: ask your child to share other times they\'ve been brave in real life.\nCelebrate their answers — big or small — to reinforce the message that courage comes in many forms.\nRead during quiet family time or bedtime to create a safe space for reflection and encouragement.\nRepeat the phrase "You\'re brave in many ways" often, planting the seed of self-belief that will grow with your child.'
      }
    ],
    sections: [
      {
        type: 'meet-author',
        title: 'Meet the Author',
        authorImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bg-author.jpg',
        paragraphs: [
          "As a mom, I noticed a stage when my toddler was afraid to try many things. It's a normal part of early childhood development, but telling him \"be brave\" often made him doubt himself even more.",
          "So I wrote this book — to show him that courage is already part of his everyday life, from simple daily acts to new challenges. When he saw himself in the story, he truly believed he was a little warrior.",
        ],
      },
      {
        type: 'toddler-favorites',
        title: 'The Perfect Sibling Gift',
        description: 'For families with one big kid and one little one',
        className: 'w-full h-auto py-[88px] md:px-[0px] px-[20px] mx-auto flex flex-col gap-[48px]',
        bundleImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bundle.png',
        bundleImageMobile: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bundle-mobile.png',
        books: [
          {
            title: 'Goodnight to You',
            subtitle: 'Gentle bedtime routine',
            coverImage: '', // 需要添加实际图片URL
            price: '$12.2',
            backgroundColor: '#4A90E2', // 蓝色背景
            backgroundImage:
              'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_1.png',
            spuCode: 'PICBOOK_GOODNIGHT',
          },
          {
            title: "Little One, You're Brave in Many Ways",
            subtitle: 'A confidence-building story',
            coverImage: '', // 需要添加实际图片URL
            price: '$4.2',
            backgroundColor: '#FFD700', // 黄色背景
            backgroundImage:
              'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_2.png',
            spuCode: 'PICBOOK_BRAVEY',
          },
        ],
        originalPrice: '$25.0',
        discountedPrice: '$19.9',
        buttonText: 'add bundle to bag',
      },
      {
        type: 'tips',
        title: 'Tips to Help Your Child Build Courage',
        bulletImages: [
          'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bullet-1.png',
          'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bullet-2.png',
          'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bullet-3.png',
          'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bullet-4.png',
          'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bullet-5.png',
          'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/bullet-6.png',
        ],
        tips: [
          "Speak as if they're already brave",
          'Validate their feelings',
          'Celebrate effort, not just success',
          'Offer small, safe challenges',
          'Model courage yourself',
          'Invite daily bravery stories',
        ],
      },
    ],
  },
  
  // Santa Letter 书籍配置
  'PICBOOK_SANTA': {
    id: 'PICBOOK_SANTA',
    specifications: [
      { label: 'Best for ages 3–8' },
      { label: '210 × 210 mm square book' },
      { label: '42 pages' },
      { label: 'Printed and dispatched in 2–4 working days' },
    ],
    faqs: [
      {
        question: 'How is the book personalized?',
        answer: '- Add your child\'s name — on the cover and in every page\n- Customize features (skin tone, hairstyle, hair color)\n- Upload a clear photo for accurate personalization\n- Add your dedication — printed on the first page\n- Choose from four cover designs\n- Preview selected pages before purchase'
      },
      {
        question: 'Recommendation',
        answer: 'This delightful book brings Santa\'s voice straight to your child.\nIt celebrates their kindness, highlights the joy they\'ve brought throughout the year, and makes their Christmas wishes feel even more special.\nIt\'s a heartwarming way to nurture wonder, strengthen traditions, and create a holiday memory your family will return to year after year.'
      },
      {
        question: 'Reading tips for parents',
        answer: 'As you read, invite your child to guess what Santa has written in his record book about their good behavior.\nTalk about what gift they hope Santa will bring this year.\nEncourage your child to write or draw a reply letter to Santa — turning reading time into a festive family activity.\nRevisit the story each December as a tradition, keeping the magic of Christmas alive.'
      }
    ],
    sections: [
      {
        type: 'meet-author',
        title: 'Meet the Illustrator',
        authorImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/bg-author.jpg',
        paragraphs: [
          "I feel so happy to bring this warm story to life through my drawings. As a child, I once wondered: \"How does Santa know I've been good?\" This book gives a gentle, heartwarming answer. With every page, I hope my illustrations and this story bring warmth and joy to each young reader.",
        ],
      },
      {
        type: 'christmas-wonder',
        title: 'Our Christmas Wonder',
        description: "See what little readers say about their very own Santa's Letter!",
        backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/wonder-bg.webp',
        illustrationImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/wonder-left.png',
        testimonials: [
          {
            text: "I think I can do even better next year... so Santa will send me another letter like this!",
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/wonder-1.jpg',
          },
          {
            text: "I told my friends that Santa wrote me a book-like letter — they were all amazed!",
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/wonder-2.jpg',
          },
          {
            text: "I love this letter - it has me, and Santa's words just for me.",
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/wonder-3.jpg',
          },
          {
            text: "I always sneak back to look at the pages — it's really me, it's really me!!!",
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/wonder-4.jpg',
          },
        ],
      },
      DEFAULT_GIFT_PACKAGES_CONFIG,
    ],
  },
  
  // Birthday 书籍配置
  'PICBOOK_BIRTHDAY': {
    id: 'PICBOOK_BIRTHDAY',
    specifications: [
      { label: 'Best for ages 3–8' },
      { label: 'Landscape format' },
      { label: '44 pages' },
      { label: 'Printed and dispatched in 2–4 working days' },
    ],
    faqs: [
      {
        question: 'How is the book personalized?',
        answer: '- Add your child\'s name — the star of the birthday story\n- Choose features (skin tone, hairstyle, hair color)\n- Upload a clear front-facing photo\n- Select your child\'s birthday date\n- Pick 4 personality traits shown as forest animals\n- Add a dedication on the first page\n- Place your order — preview before printing'
      },
      {
        question: 'Recommendation',
        answer: 'This isn\'t just a birthday book — it\'s a one-of-a-kind keepsake.\nEvery page celebrates your child\'s name, their birthday, and their personality traits through the voices of forest friends.\nIt\'s a joyful way to mark another year, honor who they are, and make birthdays more meaningful than ever.'
      },
      {
        question: 'Reading tips for parents',
        answer: 'As you read, invite your child to spot the forest animals bringing blessings.\nAsk: Besides the animals in the book, who else is here to celebrate your birthday today? (family, friends, even toys can "join in").\nTalk about the traits chosen: Did the animals describe you well? Which one feels the most like you?\nEnd the story by making a new birthday wish together — a sweet ritual to repeat every year as they grow.'
      }
    ],
    sections: [
      {
        type: 'personalization-power',
        title: 'The Power of Personalization',
        authorImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/personalization-power.png',
        paragraphs: [
          "You can personalize your story with your child's name and character details. Not only does it look extra-adorable (and it truly does), but research shows it also brings lasting benefits.",
          "Studies in early childhood education highlight that children engage more deeply when they see themselves in a story. Personalized books can boost reading motivation, strengthen self-recognition, and support healthy self-esteem.",
          "With every page, your child doesn't just read a story — they experience themselves as the hero of it.",
        ],
      },
      {
        type: 'dreamaze-special',
        title: 'What Makes Dreamaze Truly Special',
        features: [
          {
            title: 'Hand-drawn illustrations',
            description: 'Heartfelt stories, never low-quality AI scenes',
            icon: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/why-families-choose/illustrations.webp',
          },
          {
            title: 'Real photo personalization',
            description: 'Instant recognition, deeper connection',
            icon: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/why-families-choose/photo.webp',
          },
          {
            title: 'Supports self-recognition',
            description: 'Reading their own story builds identity & confidence',
            icon: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/why-families-choose/self-recognition.webp',
          },
          {
            title: 'Keepsake quality',
            description: 'Premium, non-toxic paper for little hands',
            icon: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/assets/our-books/why-families-choose/keepsake.webp',
          },
        ],
        specialTestimonials: [
          {
            text: "I've seen other personalized books, but Dreamaze is the only one where my child instantly recognized himself.",
            author: 'Akaay, Paris',
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/akaay-paris.jpg',
          },
          {
            text: "The hand-drawn pages feel like art. It's not just a story, it's a keepsake.",
            author: 'Michale, Sydney',
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/michale-sydney.jpg',
          },
          {
            text: "Most books let you add a name, but this one truly sees my child.",
            author: 'Hadjer, London',
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/hadjer-london.jpg',
          },
          {
            text: 'The quality is amazing — durable and precious, beautiful enough to treasure.',
            author: 'Charlene, San Francisco',
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/charlene-san-francisco.jpg',
          },
          {
            text: "The moment my son saw his own face in the book, he shouted his name with the biggest smile. I've never seen him so excited to read.",
            author: 'Julia, New York',
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/julia-new-york.jpg',
          },
          {
            text: "Every page feels crafted with love. The colors, the details, the binding — it's not just a book, it's something we'll keep forever.",
            author: 'Beyza, Melbourne',
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/beyza-melbourne.jpg',
          },
          {
            text: "As a gift, this was unbeatable. My niece immediately recognized herself and carried the book everywhere. It made her feel so special.",
            author: 'Claire, Los Angeles',
            avatar: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/claire-los-angeles.jpg',
          }
        ],
      },
      {
        type: 'toddler-favorites',
        title: 'Celebrate birthdays with courage.',
        description: 'Mark each milestone with joy and courage.',
        className: 'w-full h-auto py-[88px] md:px-[0px] px-[20px] mx-auto flex flex-col gap-[48px]',
        bundleImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/bundle.png',
        bundleImageMobile: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/bundle-mobile.png',
        books: [
          {
            title: "You're Brave in Many Ways",
            subtitle: 'Everyday courage',
            coverImage: '',
            price: '$4.2',
            backgroundColor: '#FFD700',
            backgroundImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/toddler_book_2.png',
            spuCode: 'PICBOOK_BRAVEY',
          },
          {
            title: 'Birthday Book for You',
            subtitle: 'Special day keepsake',
            coverImage: '',
            price: '$8.5',
            backgroundColor: '#FF6B6B',
            backgroundImage: '',
            spuCode: 'PICBOOK_BIRTHDAY',
          },
        ],
        originalPrice: '$25.0',
        discountedPrice: '$19.9',
        buttonText: 'add bundle to bag',
      },
      {
        type: 'faq',
        title: 'FAQ for Birthday Book for You',
        faqs: [
          {
            question: 'What can I personalize in the Birthday Book?',
            answer: 'Your child\'s name, photo, birthday, and personality traits appear throughout the story.',
          },
          {
            question: 'How can I make the book feel even more personalized?',
            answer: 'Add a dedication on the first page, include the gift giver\'s name, or even a special photo.',
          },
        ],
      },
    ],
  },
  
  // Your Melody 书籍配置
  'PICBOOK_MELODY': {
    id: 'PICBOOK_MELODY',
    specifications: [
      { label: 'Best for ages 0–2' },
      { label: '20 × 20 cm board book' },
      { label: 'Page count varies (depending on your baby’s name)' },
      { label: 'Printed and dispatched in 2–4 working days' },
    ],
    faqs: [
      {
        question: 'How is the book personalized?',
        answer:
          "- Add your child's name — the star of this story\n- Customize features (skin tone, hairstyle, hair color)\n- Upload a clear photo for accurate personalization\n- Add your dedication — printed on the first page\n- Choose your cover and gift options\n- Place your order — preview before printing",
      },
      {
        question: 'Recommendation',
        answer:
          "This unique story transforms your child’s name into music.\nEvery letter becomes a beautiful instrument, carrying a special blessing. One by one, these instruments join together to create a melody that belongs only to your child.\nIt’s a heartwarming way to celebrate their arrival, their name, and the joy they bring to your family.",
      },
      {
        question: 'Reading tips for parents',
        answer:
          'Enjoy the book during any bonding moment — snuggle time, playtime, or bedtime.\nGently repeat your baby’s name as you read, inviting them to move like the child in the story — crawling, sitting, or reaching.\nTry reading with a sing-song rhythm, turning the words into a little melody.\nRepeat often — babies love hearing their name, and it helps them form a lasting connection with both the story and themselves.',
      },
    ],
    sections: [
      {
        type: 'meet-author',
        title: 'Meet the Illustrator',
        authorImage: 'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MELODY/bg-author.jpg',
        className: 'bg-[#FCF2F2]',
        paragraphs: [
          "This book is a very special piece for me.",
          "So far, I've drawn over 200 pages, and along the way I even learned new musical instruments myself.",
          'When I draw, I imagine how adorable it will be to see young readers interact with the instruments on each page.',
          "My hope is that this blessing book will bring joy, wonder, and a sense of music into every child's heart.",
        ],
      },
      {
        type: 'faq',
        title: 'FAQ for Your Melody',
        faqs: [
          {
            question: 'Why is Your Melody the best gift for a baby?',
            answer:
              'Every letter of your baby’s name carries a blessing and becomes part of the story. It’s a unique way to welcome new life — just as special and one-of-a-kind as your little one.',
          },
          {
            question: 'Can long names be used?',
            answer:
              'We recommend using your baby’s first name. The maximum length is 13 letters to ensure the story flows beautifully.',
          },
        ],
      },
    ],
  },
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

