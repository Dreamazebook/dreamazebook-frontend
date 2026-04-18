// 定义评论的类型
export interface Review {
  reviewer_name: string;
  rating: number;
  comment: string; // 评论内容
  review_date?: string; // 评论日期
  pagepic?: string; // 用户图片，可能是可选的
}

// 定义关键词的类型
export interface Keyword {
  keyword: string;
  count: number;
}

// 定义书籍评论数据的类型
export interface BookReviewData {
  title: string; // 标题
  rating: number; // 平均评分（1-5）
  reviewsCount: number; // 评论总数
  reviews: Review[]; // 评论数组
  keywords?: Keyword[]; // 关键词数组（可选）
}

const PICBOOK_MOM_REVIEW_DATA: BookReviewData = {
  title: 'Loved by parents · 5.0 / 5.0',
  rating: 5.0,
  reviewsCount: 5,
  keywords: [
    { keyword: 'Made mama cry', count: 5 },
    { keyword: 'heartfelt gift', count: 12 },
    { keyword: "child's drawing inside", count: 8 },
    { keyword: 'family keepsake', count: 6 },
  ],
  reviews: [
    {
      reviewer_name: 'Sarah M., London',
      rating: 5,
      comment:
        "When I opened the book and saw my daughter's little drawing of me inside, I honestly cried. It felt so personal and full of love.",
      pagepic:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MOM/reviews/avatars/sarah-london.jpg',
    },
    {
      reviewer_name: 'Lauren P., California',
      rating: 5,
      comment:
        'My son loved pointing at every page and saying, "That\'s you and me, Mama!" Such a beautiful way to hear how your child sees you.',
      pagepic:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MOM/reviews/avatars/lauren-california.jpg',
    },
    {
      reviewer_name: 'Megan C., Dublin',
      rating: 5,
      comment:
        "The illustrations are gorgeous, and adding my child's own artwork made it feel so unique. This is more than a book—it's a memory we'll keep forever.",
      pagepic:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MOM/reviews/avatars/megan-dublin.jpg',
    },
    {
      reviewer_name: 'Natalie F., Brisbane',
      rating: 5,
      comment:
        'Reading this together gave us such a sweet moment to talk, hug, and laugh. It made me realize how closely my child notices every little thing about me.',
      pagepic:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MOM/reviews/avatars/natalie-brisbane.jpg',
    },
    {
      reviewer_name: 'Olivia K., Seattle',
      rating: 5,
      comment:
        "I bought this as a Mother's Day gift for myself, but honestly it's something I would want any time of year. It made me feel so loved and seen.",
      pagepic:
        'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MOM/reviews/avatars/olivia-seattle.jpg',
    },
  ],
};

const GOODNIGHT_REVIEW_DATA: BookReviewData = {
  title: "What Parents Are Saying",
  rating: 5.0, // 平均评分
  reviewsCount: 137, // 评论总数
  keywords: [
    { keyword: "Good quality", count: 12 },
    { keyword: "my child loves it", count: 28 },
    { keyword: "beautiful illustration", count: 33 },
    { keyword: "amazing gift", count: 49 },
  ],
  reviews: [
    {
      reviewer_name: "Amanda L., California",
      rating: 5,
      comment:
        "My daughter couldn't stop smiling when she saw her own face in the story. She kept asking me to read it again and again—such a special bedtime routine for us now.",
      pagepic:
        "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/reviews/avatars/amanda-california.jpg",
    },
    {
      reviewer_name: "Renee M., London",
      rating: 5,
      comment:
        "The quality is amazing—thick pages, beautiful illustrations, and the personalization makes it feel like it was made just for our family. Worth every penny.",
      pagepic:
        "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/reviews/avatars/renee-london.jpg",
    },
    {
      reviewer_name: "Amelia K., Paris",
      rating: 5,
      comment:
        "My son was so excited to say goodnight to the animals in the book. He fell asleep hugging it—what more could a mom ask for?",
      pagepic:
        "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/reviews/avatars/amelia-paris.jpg",
    },
    {
      reviewer_name: "Elena C.",
      rating: 5,
      comment:
        "This book feels like a keepsake we'll treasure forever. I love that we could add a dedication on the first page—it makes it even more meaningful.",
      pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_GOODNIGHT/reviews/avatars/elena.jpg",
    },
  ],
};

// 统一存储不同书籍的评论数据
// 在此文件中更新和管理不同书籍的评论数据
export const BOOK_REVIEWS_DATA: Record<string | number, BookReviewData> = {
  // Good Night 书籍的评论数据（兼容新版与旧版 ID）
  'PICBOOK_GOODNIGHT3': GOODNIGHT_REVIEW_DATA,
  'PICBOOK_GOODNIGHT': GOODNIGHT_REVIEW_DATA,
  'PICBOOK_MOM': PICBOOK_MOM_REVIEW_DATA,
  
  // You're Brave in Many Ways 书籍的评论数据（兼容新版与旧版 ID）
  'PICBOOK_BRAVEY': {
    title: "What Parents Are Saying",
    rating: 5.0, // 平均评分
    reviewsCount: 23, // 评论总数
    keywords: [
      { keyword: "Personalized", count: 6 },
      { keyword: "Confidence Building", count: 4 },
      { keyword: "Gift Ready Packaging", count: 3 },
    ],
    reviews: [
      {
        reviewer_name: "Judith V., London",
        rating: 5,
        comment: "This book shows kids that bravery is in the little things.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/reviews/avatars/judith-london.jpg",
      },
      {
        reviewer_name: "Jason S., New York",
        rating: 5,
        comment: "It really helped my four-year-old feel proud of himself.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/reviews/avatars/jason-new-york.jpg",
      },
      {
        reviewer_name: "Lily I., Halifax",
        rating: 5,
        comment: "Perfect for bedtime talks about the brave things we did today.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/reviews/avatars/lily-halifax.jpg",
      },
      {
        reviewer_name: "George M., Montreal",
        rating: 5,
        comment: "My son related to the story right away and felt confident.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/reviews/avatars/george-montreal.jpg",
      },
      {
        reviewer_name: "Andrina T., California",
        rating: 5,
        comment: "A gentle way to build confidence — we love reading it together.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BRAVEY/reviews/avatars/andrina-california.jpg",
      },
    ],
  },
  
  // Santa Letter 书籍的评论数据
  'PICBOOK_SANTA': {
    title: "What Parents Are Saying",
    rating: 5.0, // 平均评分
    reviewsCount: 28, // 评论总数
    keywords: [
      { keyword: "Christmas Magic", count: 5 },
      { keyword: "Festive Keepsake", count: 4 },
      { keyword: "Family Tradition", count: 3 },
      { keyword: "Kindness", count: 3 },
    ],
    reviews: [
      {
        reviewer_name: "Luisa S., Chicago",
        rating: 5,
        comment: "Such a touching story — I teared up reading it with my son. He kept saying, 'Santa really knows me!'",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/reviews/avatars/luisa-chicago.jpg",
      },
      {
        reviewer_name: "Braden A., London",
        rating: 5,
        comment: "My daughter asked to read it every night before Christmas, and we even wrote a reply letter together.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/reviews/avatars/braden-london.jpg",
      },
      {
        reviewer_name: "Linda B., Vancouver",
        rating: 5,
        comment: "It feels so personal and heartwarming.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/reviews/avatars/linda-vancouver.jpg",
      },
      {
        reviewer_name: "Sarah H., Sydney",
        rating: 5,
        comment: "A beautiful keepsake for the holidays. My little one truly believed Santa wrote just for him.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/reviews/avatars/sarah-sydney.jpg",
      },
      {
        reviewer_name: "Simon C., Paris",
        rating: 5,
        comment: "It's definitely the most special gift under the Christmas tree.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_SANTA/reviews/avatars/simon-paris.jpg",
      },
    ],
  },
  
  // Birthday 书籍的评论数据
  'PICBOOK_BIRTHDAY': {
    title: "What Parents Are Saying",
    rating: 5.0, // 平均评分
    reviewsCount: 31, // 评论总数
    keywords: [
      { keyword: "Forest Animals", count: 5 },
      { keyword: "Joyful Celebration", count: 5 },
      { keyword: "Birthday", count: 6 },
    ],
    reviews: [
      {
        reviewer_name: "Yuki S., Japan",
        rating: 5,
        comment: "We love that there are different seasonal covers — it makes the birthday book feel extra special.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/yuki-japan.jpg",
      },
      {
        reviewer_name: "Daniel P., Toronto",
        rating: 5,
        comment: "The story is so warm and sweet, it's the perfect keepsake for my child's birthday.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/daniel-toronto.jpg",
      },
      {
        reviewer_name: "Noah P., Cape Town",
        rating: 5,
        comment: "Such a thoughtful and personal gift. My son kept saying, 'happy birthday!' while reading.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/noah-cape-town.jpg",
      },
      {
        reviewer_name: "Rachel C., Washington",
        rating: 5,
        comment: "The book is beautifully made and my daughter asks for it everyday since her birthday.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/rachel-washington.jpg",
      },
      {
        reviewer_name: "Sophie M., Bathurst",
        rating: 5,
        comment: "My little one can't stop smiling — she loves seeing herself in the story.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_BIRTHDAY/reviews/avatars/sophie-bathurst.jpg",
      }
    ],
  },
  
  // Your Melody 书籍的评论数据
  'PICBOOK_MELODY': {
    title: "Loved by Parents",
    rating: 5.0,
    reviewsCount: 24,
    keywords: [
      { keyword: "Heartfelt personalization", count: 22 },
      { keyword: "Thoughtful storyline", count: 18 },
      { keyword: "Meaningful keepsake", count: 26 },
      { keyword: "amazing gift", count: 49 },
    ],
    reviews: [
      {
        reviewer_name: "Elowen S., Portland",
        rating: 5,
        comment:
          "An amazing gift for my new cousin — everyone at the party wanted to read it with him and see his reaction!",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MELODY/reviews/avatars/elowen-portland.jpg",
      },
      {
        reviewer_name: "Hannah R., Sydney",
        rating: 5,
        comment:
          "The moment my grandchild saw it, he reached out to touch the page and giggled. It was so precious to watch!",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MELODY/reviews/avatars/hannah-sydney.jpg",
      },
      {
        reviewer_name: "Rachel B., California",
        rating: 5,
        comment:
          "My little one can't speak yet, but when she saw her own face in the book, she called out 'dada, dada!' — that's her way of showing excitement. We're big fans of this book now.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MELODY/reviews/avatars/rachel-california.jpg",
      },
      {
        reviewer_name: "James D., Toronto",
        rating: 5,
        comment:
          "The print quality is beautiful, and the character really looks like my son — it feels so personal.",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MELODY/reviews/avatars/james-toronto.jpg",
      },
      {
        reviewer_name: "Maria L., Berlin",
        rating: 5,
        comment:
          "It's the best gift I've ever given. They truly love it and now call it a precious keepsake!",
        pagepic: "https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/PICBOOK_MELODY/reviews/avatars/maria-berlin.jpg",
      },
    ],
  },
};
