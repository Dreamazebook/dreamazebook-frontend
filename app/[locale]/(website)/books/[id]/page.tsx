import { resolveBookRouteFromParam } from '@/constants/bookRoutes';
import api from "@/utils/api";
import { apiCache } from "@/utils/apiCache";
import { WEBSITE_CDN_URL } from '@/constants/cdn';
import BookDetailClient from './BookDetailClient';

interface PagePic {
  id: number;
  pagenum: number;
  pagepic: string;
}

interface Tag {
  tname: string;
}

const BOOK_DETAIL_OVERRIDES: Record<
  string,
  {
    name?: string;
    description?: string;
    tags?: Tag[];
  }
> = {
  PICBOOK_GOODNIGHT3: {
    name: 'Good Night to You',
    description:
      'Make bedtime a moment they look forward to.<br/>In this gentle dream adventure, your child will fly around the world and say goodnight to friendly animals along the way.<br/>A calming invitation to bedtime—making an everyday routine feel sweeter, closer, and a little more magical.',
    tags: [{ tname: 'Bedtime favorite' }, { tname: 'Perfect starter book' }],
  },
  PICBOOK_MOM: {
    name: 'The Way I See You, Mama',
    description:
      "Celebrate the love between a child and their mama with The Way I See You, Mama. Told through a child's eyes, this heartfelt story explores all the little things that make Mama special — from her warm hugs and gentle hands to the way she makes the world feel safe and full of love. With personalized details and your child's own drawings woven into the story, this book becomes a deeply meaningful keepsake for both mother and child.",
    tags: [{ tname: "Mother's Day Gift" }, { tname: 'Family Bonding' }],
  },
  PICBOOK_DAD: {
    name: 'Dad & Me: A Little Book of Our Big Memories',
    description:
      "Celebrate the love between a child and their dad with Dad & Me: A Little Book of Our Big Memories. Told through a child's eyes, this heartfelt story explores all the little things that make Dad special — from his laughter and adventures to the way he makes the world feel safe and full of love. With personalized photos, your child's own words, and favorite family moments woven into the story, this book becomes a deeply meaningful keepsake for both father and child.",
    tags: [{ tname: "Father's Day Gift" }, { tname: 'Family Bonding' }],
  },
  PICBOOK_BRAVEY: {
    name: "Little One, You're Brave in Many Ways",
    description:
      "Even the smallest acts of bravery make a big difference.<br/>From trying new foods, to speaking up in class, to facing a fear of the dark — your child will see themselves reflected in a story that celebrates courage in all its forms.<br/>A keepsake that nurtures confidence and reminds little ones: they are braver than they think.",
    tags: [{ tname: 'Everyday Courage' }, { tname: 'Confidence Builder' }],
  },
  PICBOOK_BIRTHDAY: {
    name: 'Birthday Book for You',
    description:
      'Every birthday is magical when the forest gathers to celebrate your child.<br/>From playful animals bringing gifts, to special blessings that reflect their unique traits, this story makes their big day unforgettable.<br/>A personalized treasure that turns each birthday into a memory to cherish, year after year.',
    tags: [{ tname: 'Joyful Celebration' }, { tname: 'Birthday Keepsake' }],
  },
  PICBOOK_SANTA: {
    name: "Santa's Letter for You",
    description:
      "Imagine the joy on your child's face when they receive their very own letter from Santa Claus.<br/>In this personalized story, Santa shares what he's noticed about your child's good deeds, their wishes, and the magic of the season.<br/>A festive keepsake that makes Christmas sparkle with wonder, warmth, and love.",
    tags: [{ tname: 'Christmas Magic' }, { tname: 'Festive Keepsake' }],
  },
  PICBOOK_MELODY: {
    name: 'Your Melody',
    description:
      "Your Melody celebrates your baby's name in the sweetest way. Each letter turns into a gentle instrument carrying a blessing, and together they create a unique song just for them. A precious keepsake to welcome little ones and treasure their earliest years.",
    tags: [{ tname: 'Name-to-Melody' }, { tname: 'Keepsake Blessing' }],
  },
  PICBOOK_FIRST_DAY_OF_SCHOOL: {
    name: 'Your First Day of School',
    description:
      'Explore the first day of school together, through a gentle personalized story with your child at its heart.',
  },
};

const applyBookOverride = (bookData: any, override?: { name?: string; description?: string }) => {
  if (!override) return bookData;
  const patched = { ...(bookData || {}) };
  if (override.name) {
    patched.name = override.name;
    patched.default_name = override.name;
  }
  if (override.description) {
    patched.description = override.description;
  }
  if (patched.data && typeof patched.data === 'object') {
    patched.data = { ...patched.data };
    if (override.name) patched.data.name = override.name;
    if (override.description) patched.data.description = override.description;
  }
  return patched;
};

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const routeParam = Array.isArray(id) ? id[0] : String(id || '');
  const { productId } = resolveBookRouteFromParam(routeParam);

  let book: any = null;
  let pagePics: PagePic[] = [];
  let tags: Tag[] = [];
  let availableLanguages: string[] = ['en', 'zh'];

  if (productId) {
    // Fetch product details
    try {
      const productResponse = await apiCache.request<any>(
        () => api.get<any>(`/products/${productId}`, { params: { language: locale } }),
        `/products/${productId}`,
        { language: locale },
        {
          ttl: 10 * 60 * 1000,
          useCache: true,
          useDedupe: true,
        }
      );
      const data = productResponse?.data || productResponse;
      const override = BOOK_DETAIL_OVERRIDES[productId];
      book = applyBookOverride(data, override);

      try {
        const langs = (data?.data?.customization_config?.languages
          || data?.customization_config?.languages
          || []) as string[];
        if (Array.isArray(langs) && langs.length > 0) {
          availableLanguages = langs;
        }
      } catch {}

      // 标签优先用本地覆盖；否则与 Our Books 一致，取后端 marketing_tags
      if (override?.tags?.length) {
        tags = override.tags;
      } else {
        const productPayload = data?.data && typeof data.data === 'object' ? data.data : data;
        const marketingTags =
          productPayload?.marketing_tags ??
          data?.marketing_tags ??
          [];
        if (Array.isArray(marketingTags)) {
          tags = marketingTags
            .map((tag: unknown) => {
              if (typeof tag === 'string' && tag.trim()) return { tname: tag.trim() };
              if (tag && typeof tag === 'object') {
                const t = tag as Record<string, unknown>;
                const name = t.tname ?? t.name ?? t.label ?? t.tag;
                if (typeof name === 'string' && name.trim()) return { tname: name.trim() };
              }
              return null;
            })
            .filter((tag): tag is Tag => Boolean(tag));
        }
      }
    } catch (error) {
      console.error('Failed to fetch book details:', error);
    }

    // Fetch gallery directly from CDN
    try {
      const galleryId =
        String(productId) === 'PICBOOK_GOODNIGHT3'
          ? 'PICBOOK_GOODNIGHT'
          : String(productId);

      const cdnBase = WEBSITE_CDN_URL.endsWith('/')
        ? WEBSITE_CDN_URL
        : `${WEBSITE_CDN_URL}/`;
      const galleryBaseUrl = `${cdnBase}products/picbooks/${encodeURIComponent(galleryId)}/gallery`;
      const indexUrl = `${galleryBaseUrl}/index.json`;

      const resp = await fetch(indexUrl, { cache: 'no-store' });
      if (!resp.ok) {
        throw new Error(`Failed to load gallery index: ${resp.status}`);
      }

      const json = await resp.json();
      const rawItems = Array.isArray(json?.files)
        ? json.files
        : Array.isArray(json)
        ? json
        : [];

      /** gallery index 里 src 可能是 string，也可能是 { desktop, mobile } */
      const resolveSrcValue = (src: unknown): string | null => {
        if (typeof src === 'string' && src.trim()) return src;
        if (src && typeof src === 'object') {
          const obj = src as Record<string, unknown>;
          const candidate = obj.desktop ?? obj.mobile ?? obj.src ?? obj.url;
          if (typeof candidate === 'string' && candidate.trim()) return candidate;
        }
        return null;
      };

      const normalizeSrc = (src: string) =>
        src.replace(/^\.\//, '').replace(/^\/+/, '');

      const buildFullUrl = (src: unknown): string | null => {
        const resolved = resolveSrcValue(src);
        if (!resolved) return null;
        if (/^https?:\/\//i.test(resolved)) return resolved;
        const cleaned = normalizeSrc(resolved);
        return `${galleryBaseUrl}/${cleaned}`;
      };

      const items: Array<{ id: string; order: number; src: string }> = [];

      rawItems.forEach((entry: any, idx: number) => {
        if (typeof entry === 'string') {
          const src = buildFullUrl(entry);
          if (src) items.push({ id: `item-${idx}`, order: idx + 1, src });
        } else if (entry && typeof entry === 'object') {
          const src = buildFullUrl(entry.src ?? entry.url ?? entry.path);
          if (src) {
            items.push({
              id: entry.id ?? `item-${idx}`,
              order:
                typeof entry.order === 'number'
                  ? entry.order
                  : parseInt(String(entry.order ?? idx + 1), 10) || idx + 1,
              src,
            });
          }
        }
      });

      const sortedItems = items
        .filter((item) => typeof item.src === 'string' && item.src.length > 0)
        .sort((a, b) => a.order - b.order);

      pagePics = sortedItems.map((item: any, index: number) => ({
        id: item.id ?? index,
        pagenum: item.order ?? index + 1,
        pagepic: item.src,
      }));
    } catch (error) {
      console.error('Failed to fetch gallery from CDN:', error);
    }
  }

  return (
    <BookDetailClient
      book={book}
      productId={productId}
      pagePics={pagePics}
      tags={tags}
      availableLanguages={availableLanguages}
    />
  );
}
