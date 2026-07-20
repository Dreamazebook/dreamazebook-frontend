"use client";
import { PERSONALIZED_STORYBOOKS } from '@/constants/cdn';
import { useRef, useEffect, useCallback } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

const photos = [
  PERSONALIZED_STORYBOOKS('thatsme-1.webp'),
  PERSONALIZED_STORYBOOKS('thatsme-2.webp'),
  PERSONALIZED_STORYBOOKS('thatsme-3.webp'),
  PERSONALIZED_STORYBOOKS('thatsme-4.webp'),
];

type ReviewSize = 'short' | 'medium' | 'long';

interface Review {
  id: number;
  avatar: string;
  title: string;
  text: string;
  size: ReviewSize;
}

const reviews: Review[] = [
  {
    id: 1,
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'She saw herself and lit up',
    text: "My daughter saw herself in the book and instantly said, \"That's me!\" Such a sweet idea and beautifully done.",
    size: 'short',
  },
  {
    id: 2,
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'More than just a name',
    text: "Beautiful keepsake. It feels much more special than a normal personalized book with just a name.",
    size: 'short',
  },
  {
    id: 3,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'A story we will keep for years',
    text: "I wasn't sure what to expect at first, because there are so many personalized books now, but this one felt different. It wasn't just my child's name added to a story — her face and little features were actually part of the illustrations. The moment she saw herself, she smiled and said, \"That's me!\" It was honestly so sweet. The book feels warm, thoughtful, and like something we'll keep for years.",
    size: 'long',
  },
  {
    id: 4,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'Warm, hand-drawn feel',
    text: "Really lovely book. The illustrations feel warm and personal, not like a generic AI image.",
    size: 'short',
  },
  {
    id: 5,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'She was really part of the story',
    text: "I ordered this as a gift and it was such a special surprise. The best part was seeing how naturally the child's photo was included in the illustrations. It didn't feel like a random picture pasted onto a page — it felt like she was really part of the story.",
    size: 'medium',
  },
  {
    id: 6,
    avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'Her face, her story',
    text: "My daughter saw herself in the book and instantly said, \"That's me!\" Such a sweet idea and beautifully done.",
    size: 'short',
  },
  {
    id: 7,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'A melody made just for him',
    text: "The moment I saw the melody book with my son's face in it, I was truly moved. Seeing the instruments come together, carrying the unique blessing behind his name, felt so personal and magical. It's such a beautiful and meaningful gift!",
    size: 'medium',
  },
  {
    id: 8,
    avatar: 'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'Now part of our bedtime routine',
    text: "We've bought many personalized books but this one genuinely stopped us in our tracks. The way the illustrations were crafted around our son's actual likeness made it feel like a bespoke piece of art. He carries it everywhere now and insists on reading it every night. It's become part of our bedtime routine in the best possible way. The quality is excellent and the story itself is charming. Couldn't recommend it more highly.",
    size: 'long',
  },
  {
    id: 9,
    avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'Not generic — genuinely personal',
    text: "Really lovely book. The illustrations feel warm and personal, not like a generic AI image.",
    size: 'short',
  },
  {
    id: 10,
    avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=80',
    title: 'A keepsake that stands out',
    text: "Beautiful keepsake. It feels much more special than a normal personalized book with just a name.",
    size: 'short',
  },
];

// ─── Column grouping ─────────────────────────────────────────────────────────
// Rules:
//  TypeA: short + short  (equal height split)
//  TypeB: short + medium (short=content, medium=fill)
//  TypeC: long alone

type ColumnType = 'AA' | 'SM' | 'L';
interface Column {
  type: ColumnType;
  reviews: Review[];
}

function buildColumns(source: Review[]): Column[] {
  const cols: Column[] = [];
  const pool = [...source];
  let i = 0;

  while (i < pool.length) {
    const r = pool[i];
    if (r.size === 'long') {
      cols.push({ type: 'L', reviews: [r] });
      i++;
    } else if (r.size === 'short') {
      const next = pool[i + 1];
      if (next?.size === 'short') {
        cols.push({ type: 'AA', reviews: [r, next] });
        i += 2;
      } else if (next?.size === 'medium') {
        cols.push({ type: 'SM', reviews: [r, next] });
        i += 2;
      } else if (next?.size === 'long') {
        // pair short with next-next if available
        const nn = pool[i + 2];
        if (nn?.size === 'medium' || nn?.size === 'short') {
          cols.push({ type: nn.size === 'short' ? 'AA' : 'SM', reviews: [r, nn] });
          pool.splice(i + 2, 1);
        } else {
          cols.push({ type: 'L', reviews: [r] });
          i++;
          continue;
        }
        i += 2;
      } else {
        cols.push({ type: 'L', reviews: [r] });
        i++;
      }
    } else {
      // medium alone → treat like long
      cols.push({ type: 'L', reviews: [r] });
      i++;
    }
  }
  return cols;
}

const columns = buildColumns(reviews);

// ─── Sub-components ──────────────────────────────────────────────────────────

const StarRating = () => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="w-6 h-6 bg-[#00b67a] rounded-sm flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    ))}
  </div>
);

const ReviewCard = ({ review, className = '' }: { review: Review; className?: string }) => (
  <div className={`bg-white rounded-2xl p-5 flex flex-col ${className}`}>
    <div className="flex items-center gap-3 mb-3">
      <img
        src={review.avatar}
        alt="reviewer"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <StarRating />
    </div>
    <p className="font-bold text-gray-900 text-[15px] leading-tight mb-2">{review.title}</p>
    <p className="text-gray-500 text-sm leading-relaxed">{review.text}</p>
  </div>
);

// ─── Scroll strip hook ────────────────────────────────────────────────────────

function useAutoScroll(speed = 0.6) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);

  const animate = useCallback(() => {
    const track = trackRef.current;
    if (!track || isDragging.current) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }
    posRef.current += speed;
    const half = track.scrollWidth / 2;
    if (posRef.current >= half) posRef.current -= half;
    track.style.transform = `translateX(-${posRef.current}px)`;
    rafRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartPos.current = posRef.current;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = dragStartX.current - e.clientX;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    let next = dragStartPos.current + delta;
    if (next < 0) next += half;
    if (next >= half) next -= half;
    posRef.current = next;
    track.style.transform = `translateX(-${posRef.current}px)`;
  };

  const onMouseUp = () => { isDragging.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    dragStartX.current = e.touches[0].clientX;
    dragStartPos.current = posRef.current;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = dragStartX.current - e.touches[0].clientX;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    let next = dragStartPos.current + delta;
    if (next < 0) next += half;
    if (next >= half) next -= half;
    posRef.current = next;
    track.style.transform = `translateX(-${posRef.current}px)`;
  };

  const onTouchEnd = () => { isDragging.current = false; };

  return { trackRef, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd };
}

// ─── Photo Strip ─────────────────────────────────────────────────────────────

const PhotoStrip = ({ isMobile }: { isMobile: boolean }) => {
  const scroll = useAutoScroll(0.5);
  const photoH = isMobile ? 'h-[190px]' : 'h-[240px]';
  const photoW = isMobile ? 'w-[185px]' : 'w-[270px]';

  return (
    <div
      className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={scroll.onMouseDown}
      onMouseMove={scroll.onMouseMove}
      onMouseUp={scroll.onMouseUp}
      onMouseLeave={scroll.onMouseUp}
      onTouchStart={scroll.onTouchStart}
      onTouchMove={scroll.onTouchMove}
      onTouchEnd={scroll.onTouchEnd}
    >
      <div ref={scroll.trackRef} className="flex will-change-transform">
        {[...photos, ...photos].map((src, i) => (
          <img
            key={i}
            src={src}
            alt="moment"
            draggable={false}
            className={`${photoH} ${photoW} object-cover flex-shrink-0 ${isMobile ? 'mr-1' : 'mr-2'}`}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Review Strip ─────────────────────────────────────────────────────────────

const ReviewStrip = ({ isMobile }: { isMobile: boolean }) => {
  const scroll = useAutoScroll(0.45);
  const colW = isMobile ? 'w-[272px]' : 'w-[300px]';
  const colH = isMobile ? 'h-[380px]' : 'h-[480px]';
  const gap = isMobile ? 'mr-3' : 'mr-4';

  const renderColumn = (col: Column, key: number) => {
    if (col.type === 'AA') {
      return (
        <div key={key} className={`${colW} ${colH} ${gap} flex flex-col gap-3 flex-shrink-0`}>
          <ReviewCard review={col.reviews[0]} className="flex-1" />
          <ReviewCard review={col.reviews[1]} className="flex-1" />
        </div>
      );
    }
    if (col.type === 'SM') {
      return (
        <div key={key} className={`${colW} ${colH} ${gap} flex flex-col gap-3 flex-shrink-0`}>
          <ReviewCard review={col.reviews[0]} />
          <ReviewCard review={col.reviews[1]} className="flex-1" />
        </div>
      );
    }
    // 'L'
    return (
      <div key={key} className={`${colW} ${colH} ${gap} flex-shrink-0`}>
        <ReviewCard review={col.reviews[0]} className="h-full" />
      </div>
    );
  };

  const allCols = [...columns, ...columns];

  return (
    <div
      className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={scroll.onMouseDown}
      onMouseMove={scroll.onMouseMove}
      onMouseUp={scroll.onMouseUp}
      onMouseLeave={scroll.onMouseUp}
      onTouchStart={scroll.onTouchStart}
      onTouchMove={scroll.onTouchMove}
      onTouchEnd={scroll.onTouchEnd}
    >
      <div ref={scroll.trackRef} className={`flex ${isMobile ? 'py-4 pl-4' : 'py-6 pl-8'} will-change-transform`}>
        {allCols.map((col, i) => renderColumn(col, i))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ThatsMeSection() {
  return (
    <>
      {/* Mobile */}
      <div className="block md:hidden bg-[#f0ede8] min-h-screen">
        <div className="pt-10 pb-2 px-4 text-center">
          <h2 className="text-[28px] font-bold text-gray-900 leading-tight">
            The &ldquo;That&rsquo;s me!&rdquo; moment
          </h2>
        </div>
        <div className="mt-4">
          <PhotoStrip isMobile={true} />
        </div>
        <div className="mt-2">
          <ReviewStrip isMobile={true} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-[#f0ede8] min-h-screen">
        <div className="pt-14 pb-2 text-center">
          <h2 className="text-[42px] font-semibold text-gray-900 tracking-tight leading-tight">
            The &ldquo;That&rsquo;s me!&rdquo; moment
          </h2>
        </div>
        <div className="mt-6">
          <PhotoStrip isMobile={false} />
        </div>
        <div className="mt-2">
          <ReviewStrip isMobile={false} />
        </div>
      </div>
    </>
  );
}
