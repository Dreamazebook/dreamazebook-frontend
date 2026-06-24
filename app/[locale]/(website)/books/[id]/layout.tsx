import type { Metadata } from 'next';
import { sharedMetadata } from '@/components/metadata';
import {
  ProductSchema,
  BreadcrumbSchema,
  FAQSchema,
} from '@/app/components/StructuredDataSchemas';
import { getBookAbsoluteUrl, resolveBookRouteFromParam } from '@/constants/bookRoutes';

// ── Book SEO data ──────────────────────────────────────────────────────────

interface BookSeo {
  name: string;
  subtitle: string;
  seoTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string[];
  primaryKeyword: string;
  faqs: Array<{ question: string; answer: string }>;
}

const BOOK_SEO: Record<string, BookSeo> = {
  PICBOOK_GOODNIGHT3: {
    name: 'Good Night to You',
    subtitle: 'A personalized bedtime storybook starring your child’s real photo.',
    seoTitle: 'Good Night to You: Personalized Bedtime Book | Dreamaze',
    metaDescription:
      'Create a calming personalized bedtime book starring your child’s real photo. A gentle story for toddlers and young children to end the day feeling seen and loved.',
    ogTitle: 'A Bedtime Storybook Starring Your Child',
    ogDescription:
      'Create a personalized bedtime book starring your child.',
    keywords: [
      'personalized bedtime book',
      'bedtime story for toddlers',
      'custom children\'s bedtime book',
      'personalized book with child photo',
      'good night book for kids',
    ],
    primaryKeyword: 'personalized bedtime book',
    faqs: [
      {
        question: 'Can I preview the book before it’s printed?',
        answer: 'Yes! You can preview every page of your personalized book online before placing your order. Make sure everything looks perfect before it goes to print.',
      },
      {
        question: 'Is my child’s photo safe and private?',
        answer: 'Absolutely. Your child’s photo is used only to create your book and is never shared or used for any other purpose. We take privacy and data security seriously.',
      },
      {
        question: 'What age is this book suitable for?',
        answer: 'Good Night to You is designed for toddlers and young children aged 0–5. The gentle, rhythmic story and familiar bedtime theme make it a perfect wind‑down book for the earliest years.',
      },
      {
        question: 'How long does production and shipping take?',
        answer: 'Production typically takes 3–5 business days after you approve your preview. Shipping times vary by destination — you’ll see an estimated delivery date at checkout.',
      },
      {
        question: 'What if I need changes after seeing the preview?',
        answer: 'You can make adjustments to your personalization details before approving the final preview. If you spot an issue after ordering, contact our support team and we’ll help make it right.',
      },
    ],
  },
  PICBOOK_GOODNIGHT: {
    name: 'Good Night to You',
    subtitle: 'A personalized bedtime storybook starring your child’s real photo.',
    seoTitle: 'Good Night to You: Personalized Bedtime Book | Dreamaze',
    metaDescription:
      'Create a calming personalized bedtime book starring your child’s real photo. A gentle story for toddlers and young children to end the day feeling seen and loved.',
    ogTitle: 'A Bedtime Storybook Starring Your Child',
    ogDescription:
      'Create a personalized bedtime book starring your child.',
    keywords: [
      'personalized bedtime book',
      'bedtime story for toddlers',
      'custom children\'s bedtime book',
      'personalized book with child photo',
      'good night book for kids',
    ],
    primaryKeyword: 'personalized bedtime book',
    faqs: [
      {
        question: 'Can I preview the book before it’s printed?',
        answer: 'Yes! You can preview every page of your personalized book online before placing your order. Make sure everything looks perfect before it goes to print.',
      },
      {
        question: 'Is my child’s photo safe and private?',
        answer: 'Absolutely. Your child’s photo is used only to create your book and is never shared or used for any other purpose. We take privacy and data security seriously.',
      },
      {
        question: 'What age is this book suitable for?',
        answer: 'Good Night to You is designed for toddlers and young children aged 0–5. The gentle, rhythmic story and familiar bedtime theme make it a perfect wind‑down book for the earliest years.',
      },
      {
        question: 'How long does production and shipping take?',
        answer: 'Production typically takes 3–5 business days after you approve your preview. Shipping times vary by destination — you’ll see an estimated delivery date at checkout.',
      },
      {
        question: 'What if I need changes after seeing the preview?',
        answer: 'You can make adjustments to your personalization details before approving the final preview. If you spot an issue after ordering, contact our support team and we’ll help make it right.',
      },
    ],
  },
  PICBOOK_DAD: {
    name: 'Dad & Me',
    subtitle: 'A personalized book and keepsake gift for Dad, made with your child’s real photo.',
    seoTitle: 'Dad & Me: Personalized Book for Dad | Dreamaze',
    metaDescription:
      'Turn everyday moments with Dad into a personalized keepsake book made with your child’s real photo and family details. A meaningful gift for Dad.',
    ogTitle: 'A Personalized Keepsake Book for Dad',
    ogDescription:
      'Turn everyday moments with Dad into a personalized keepsake book made with your child’s real photo.',
    keywords: [
      'personalized book for dad',
      'father\'s day gift',
      'dad keepsake book',
      'personalized gift for dad',
      'custom dad book with child photo',
    ],
    primaryKeyword: 'personalized book for dad',
    faqs: [
      {
        question: 'Is this book only for Father’s Day?',
        answer: 'Not at all! Dad & Me makes a wonderful gift for Father’s Day, Dad’s birthday, or any day you want to celebrate the special bond between father and child.',
      },
      {
        question: 'Can I upload a family photo?',
        answer: 'Yes — you can upload your child’s photo (and optionally a family photo) to make the book truly personal. The photos are used only to create your book.',
      },
      {
        question: 'Can I add a personal dedication?',
        answer: 'Absolutely. You can include a heartfelt dedication page with a custom message from your child to Dad, making the book even more meaningful.',
      },
      {
        question: 'Can I preview the book before ordering?',
        answer: 'Yes! Preview every page online before your book goes to print so you can be sure it’s exactly what you want.',
      },
      {
        question: 'How long will shipping take?',
        answer: 'Production takes 3–5 business days after preview approval. Shipping time depends on your location — you’ll see an estimate at checkout.',
      },
    ],
  },
  PICBOOK_MOM: {
    name: 'The Way I See You, Mama',
    subtitle: 'A personalized book for Mom, told through the love only a child can see.',
    seoTitle: 'The Way I See You, Mama: Personalized Book for Mom | Dreamaze',
    metaDescription:
      'Celebrate Mom through your child’s eyes with a personalized keepsake book made with real photos and heartfelt family details.',
    ogTitle: 'A Personalized Keepsake Book for Mom',
    ogDescription:
      'Celebrate Mom through your child’s eyes with a personalized book made with real photos and heartfelt details.',
    keywords: [
      'personalized book for mom',
      'mother\'s day gift',
      'mom keepsake book',
      'personalized gift for mom',
      'custom mom book with child photo',
    ],
    primaryKeyword: 'personalized book for mom',
    faqs: [
      {
        question: 'Is this book only for Mother’s Day?',
        answer: 'Not at all! The Way I See You, Mama is a beautiful gift for Mother’s Day, Mom’s birthday, or any moment you want to celebrate her.',
      },
      {
        question: 'How is the story told from a child’s perspective?',
        answer: 'The book is narrated through the child’s voice, capturing all the little things they notice and love about Mom — from her warm hugs to the way she makes everything better.',
      },
      {
        question: 'Can I add a personal dedication?',
        answer: 'Yes! Include a custom dedication page with a personal message to Mom, making the book an even more treasured keepsake.',
      },
      {
        question: 'Can I preview before printing?',
        answer: 'Absolutely. You can review every page online and make adjustments before your order goes to print.',
      },
      {
        question: 'Is my child’s photo safe?',
        answer: 'Yes. Photos are used exclusively to create your book and are never shared or used for any other purpose.',
      },
    ],
  },
  PICBOOK_MELODY: {
    name: 'Name Melody',
    subtitle: 'A personalized baby book celebrating your child’s name, photo, and first little story.',
    seoTitle: 'Name Melody: Personalized Baby Book | Dreamaze',
    metaDescription:
      'Create a gentle personalized baby book with your child’s real photo, name, and a musical story made for early memories.',
    ogTitle: 'A Personalized Baby Book Made for Their Name',
    ogDescription:
      'Celebrate your child’s name with a gentle personalized baby book made with their real photo.',
    keywords: [
      'personalized baby book',
      'baby name book',
      'custom baby gift',
      'personalized newborn book',
      'baby keepsake book',
    ],
    primaryKeyword: 'personalized baby book',
    faqs: [
      {
        question: 'What age is Name Melody suitable for?',
        answer: 'Name Melody is designed for babies and toddlers aged 0–3. The gentle, musical story and simple illustrations are perfect for the earliest years.',
      },
      {
        question: 'How does name personalization work?',
        answer: 'Each letter of your child’s name becomes a gentle instrument carrying a blessing, creating a unique melody just for them. Simply enter the name when personalizing.',
      },
      {
        question: 'Can I upload my baby’s photo?',
        answer: 'Yes! Upload your baby’s photo to appear in the book, making it a truly personal keepsake.',
      },
      {
        question: 'Can I preview before printing?',
        answer: 'Yes, you can preview every page online and make adjustments before your order goes to print.',
      },
      {
        question: 'Is this a good baby shower gift?',
        answer: 'Absolutely! Name Melody makes a thoughtful and unique baby shower or newborn gift that parents will treasure for years.',
      },
    ],
  },
  PICBOOK_BIRTHDAY: {
    name: 'Happy Birthday',
    subtitle: 'A personalized birthday book where your child becomes the star of the celebration.',
    seoTitle: 'Happy Birthday: Personalized Birthday Book | Dreamaze',
    metaDescription:
      'Make your child the star of a personalized birthday book made with their real photo, name, and celebration details.',
    ogTitle: 'A Birthday Book Where Your Child Is the Star',
    ogDescription:
      'Create a personalized birthday keepsake starring your child’s real photo and celebration details.',
    keywords: [
      'personalized birthday book',
      'birthday gift for kids',
      'custom birthday book',
      'personalized birthday keepsake',
      'child birthday book',
    ],
    primaryKeyword: 'personalized birthday book',
    faqs: [
      {
        question: 'What age is the birthday book for?',
        answer: 'Happy Birthday is designed for children of all ages — from first birthdays through the elementary years. The story adapts to the age you provide.',
      },
      {
        question: 'What personalization details can I add?',
        answer: 'You can include your child’s name, photo, age, and special celebration details to make the story uniquely theirs.',
      },
      {
        question: 'Can I preview before printing?',
        answer: 'Yes! Preview every page online and make sure everything looks perfect before your order goes to print.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Production takes 3–5 business days after preview approval. We recommend ordering at least 2 weeks before the birthday to allow for shipping.',
      },
      {
        question: 'Do you offer gift packaging?',
        answer: 'Yes! Gift packaging options are available at checkout to make your birthday present extra special.',
      },
    ],
  },
  PICBOOK_BRAVEY: {
    name: 'You’re Brave',
    subtitle: 'A personalized storybook that helps your child feel brave, seen, and celebrated.',
    seoTitle: 'You’re Brave: Personalized Book for Kids | Dreamaze',
    metaDescription:
      'Help your child see their courage in a personalized book made with their real photo, name, and everyday brave moments.',
    ogTitle: 'A Personalized Book That Celebrates Your Child’s Courage',
    ogDescription:
      'Help your child see their courage in a personalized storybook made with their real photo.',
    keywords: [
      'personalized book for kids',
      'confidence building book',
      'bravery book for children',
      'personalized courage story',
      'custom children\'s book',
    ],
    primaryKeyword: 'personalized book for kids',
    faqs: [
      {
        question: 'What age range is You’re Brave for?',
        answer: 'You’re Brave is designed for children aged 3–8. The story celebrates everyday courage that young children can relate to and feel proud of.',
      },
      {
        question: 'What does the bravery theme cover?',
        answer: 'The story highlights everyday acts of courage — trying new foods, speaking up in class, facing fears, and being kind — helping your child see how brave they already are.',
      },
      {
        question: 'Can I upload my child’s photo?',
        answer: 'Yes! Your child’s real photo is placed throughout the story, making them the hero of their own courage-filled adventure.',
      },
      {
        question: 'Can I preview before printing?',
        answer: 'Yes, preview every page online and make adjustments before your book goes to print.',
      },
      {
        question: 'What personalization details can I add?',
        answer: 'You can personalize with your child’s name, photo, and other details that make the story uniquely theirs.',
      },
    ],
  },
  PICBOOK_SANTA: {
    name: 'Santa’s Letter',
    subtitle: 'A personalized Christmas book where your child receives a letter made just for them.',
    seoTitle: 'Santa’s Letter: Personalized Christmas Book | Dreamaze',
    metaDescription:
      'Create a personalized Christmas book from Santa, made with your child’s real photo, name, and festive story details.',
    ogTitle: 'A Personalized Christmas Book Made Just for Your Child',
    ogDescription:
      'Create a personalized Christmas book from Santa, starring your child’s real photo and name.',
    keywords: [
      'personalized Christmas book',
      'Santa letter book',
      'Christmas gift for kids',
      'personalized holiday book',
      'custom Santa book',
    ],
    primaryKeyword: 'personalized Christmas book',
    faqs: [
      {
        question: 'Will my book arrive before Christmas?',
        answer: 'We recommend ordering by early December to ensure holiday delivery. Production takes 3–5 business days after preview approval, plus shipping time. Exact cutoff dates are shown at checkout.',
      },
      {
        question: 'How is the Santa letter personalized?',
        answer: 'The book includes a letter from Santa that mentions your child’s name, good deeds, and Christmas wishes — making the magic feel truly real.',
      },
      {
        question: 'Can I upload my child’s photo?',
        answer: 'Yes! Include your child’s photo to make their Santa letter book even more special and personal.',
      },
      {
        question: 'Can I preview before printing?',
        answer: 'Yes, preview every page online before your order goes to print to make sure everything is perfect.',
      },
      {
        question: 'Do you offer gift packaging?',
        answer: 'Yes! Festive gift packaging options are available at checkout to make your Christmas present extra magical.',
      },
    ],
  },
};

// ── Helper: resolve book SEO data ──────────────────────────────────────────

function getBookSeo(id: string): BookSeo | undefined {
  return BOOK_SEO[id];
}

// ── generateMetadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { productId, slug } = resolveBookRouteFromParam(id);
  const seo = getBookSeo(productId);
  const bookUrl = getBookAbsoluteUrl(slug);

  const bookName = seo?.name ?? 'Personalized Children\'s Book';
  const seoTitle = seo?.seoTitle ?? `${bookName} | Personalized Children's Book | Dreamaze`;
  const metaDescription =
    seo?.metaDescription ??
    'Discover a personalized children\'s book where your child becomes the hero of their own magical story.';
  const ogTitle = seo?.ogTitle ?? bookName;
  const ogDescription = seo?.ogDescription ?? metaDescription;

  const keywords = seo?.keywords ?? [
    bookName,
    'personalized children\'s book',
    'custom children\'s book',
    'personalized gift',
    'children\'s story',
    'illustrated book',
  ];

  return {
    ...sharedMetadata,
    title: seoTitle,
    description: metaDescription,
    robots: {
      index: true,
      follow: true,
    },
    keywords,
    openGraph: {
      ...sharedMetadata.openGraph,
      title: ogTitle,
      description: ogDescription,
      url: bookUrl,
      type: 'website',
    },
    twitter: {
      ...sharedMetadata.twitter,
      title: ogTitle,
      description: ogDescription,
      card: 'summary_large_image',
    },
    alternates: {
      canonical: bookUrl,
    },
  };
}

// ── BookDetailLayout (pass-through + structured data) ──────────────────────

export default function BookDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  // We render structured data server-side via an async wrapper
  return (
    <>
      <BookStructuredData params={params} />
      {children}
    </>
  );
}

// ── Structured Data (async, runs on server) ────────────────────────────────

async function BookStructuredData({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { productId, slug } = resolveBookRouteFromParam(id);
  const bookUrl = getBookAbsoluteUrl(slug);
  const seo = getBookSeo(productId);

  const bookName = seo?.name ?? 'Personalized Children\'s Book';
  const bookDescription = seo?.metaDescription ?? '';
  const bookSubtitle = seo?.subtitle;

  // Fetch product data from API for price/image (server-side)
  let price = '29.99';
  let productImage: string | null = null;
  let currency = 'USD';

  try {
    // Dynamic import to avoid bundling api client into every page if not needed
    const api = (await import('@/utils/api')).default;
    const resp = await api.get<any>(`/products/${productId}`);
    const data = resp?.data?.data || resp?.data || resp;
    if (data) {
      price = data.current_price ?? data.base_price ?? data.price ?? '29.99';
      currency = data.currencycode ?? data.currency ?? 'USD';
      productImage =
        data.primary_image ??
        (Array.isArray(data.images) ? data.images[0] : null) ??
        data.image ??
        data.imageCover ??
        null;
    }
  } catch {
    // Fall back to defaults if API call fails
  }

  const imageUrl = productImage
    ? productImage.startsWith('http')
      ? productImage
      : `https://dreamazebook.com${productImage}`
    : 'https://dreamazebook.com/landing-page/cover.png';

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: 'https://dreamazebook.com/en' },
    { name: 'Books', url: 'https://dreamazebook.com/en/books' },
    { name: bookName, url: bookUrl },
  ];

  return (
    <>
      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: bookName,
            description: bookDescription,
            ...(bookSubtitle ? { slogan: bookSubtitle } : {}),
            image: imageUrl,
            brand: {
              '@type': 'Brand',
              name: 'Dreamaze',
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: currency,
              price: String(price),
              availability: 'https://schema.org/InStock',
              url: bookUrl,
            },
          }),
        }}
        suppressHydrationWarning
      />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: item.url,
            })),
          }),
        }}
        suppressHydrationWarning
      />

      {/* FAQ JSON-LD (if FAQs exist) */}
      {seo?.faqs && seo.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: seo.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
          suppressHydrationWarning
        />
      )}
    </>
  );
}
