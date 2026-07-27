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
  rating?: number; // 5 = 5 stars (default), 4 = 4 stars
}

const reviews: Review[] = [
  // Interleaved: short + medium/long mixed for visual variety
  { id: 1, avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80', title: '"That\'s me!"', text: "My daughter saw herself in the book and instantly said, \"That's me!\" Such a sweet idea and beautifully done.", size: 'short' },
  { id: 2, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Warm and personal', text: "Really lovely book. The illustrations feel warm and personal, not like a generic AI image.", size: 'short' },
  { id: 11, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Naturally part of the story', text: "I ordered this as a gift and it was such a special surprise. The best part was seeing how naturally the child's photo was included in the illustrations. It didn't feel like a random picture pasted onto a page — it felt like she was really part of the story.", size: 'medium' },
  { id: 34, avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Something we\'ll keep for years', text: "I wasn't sure what to expect at first, because there are so many personalized books now, but this one felt different. It wasn't just my child's name added to a story — her face and little features were actually part of the illustrations. The moment she saw herself, she smiled and said, \"That's me!\" It was honestly so sweet. The book feels warm, thoughtful, and like something we'll keep for years.", size: 'long' },
  { id: 3, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'A lovely surprise', text: "The preview was such a nice surprise. I loved seeing my child actually woven into the story.", size: 'short' },
  { id: 19, avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Recognized herself straight away', text: "My daughter recognized herself straight away and was so excited, which was the best part. I did feel that 2 or 3 pages didn't look exactly like her, but overall it's probably the best personalized book I've seen so far. The story and illustrations are really beautiful.", size: 'medium', rating: 4 },
  { id: 4, avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'More than just a name', text: "Beautiful keepsake. It feels much more special than a normal personalized book with just a name.", size: 'short' },
  { id: 35, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'She became the hero', text: "Such a beautiful and meaningful gift. I made this for my niece and the reaction was priceless. She kept looking at the pages and pointing to herself in the story. The illustrations are soft and lovely, and the personalization feels much more natural than an avatar. It really feels like the child becomes the hero of the book.", size: 'long' },
  { id: 5, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Wanted to read it again', text: "My son wanted to read it again right away. Seeing himself in the story made it feel magical.", size: 'short' },
  { id: 12, avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Thoughtful and beautiful', text: "This is one of the sweetest personalized books I've seen. A lot of custom books just add the child's name, but this felt much more thoughtful. The artwork is beautiful and the story has a gentle, emotional feeling.", size: 'medium' },
  { id: 6, avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Soft and thoughtful', text: "Very sweet and meaningful. The artwork is soft, thoughtful, and really gift-worthy.", size: 'short' },
  { id: 20, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Child loved it', text: "If I'm being very picky, I think a few of the dynamic facial expressions could be improved. But my child absolutely loved seeing herself in the book and kept asking to read it again. Overall, we're very happy with it.", size: 'medium', rating: 4 },
  { id: 7, avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'So personal', text: "I was surprised by how personal it felt. Not just a face added on top — it really looked like part of the story.", size: 'short' },
  { id: 36, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Personal without feeling gimmicky', text: "I love that this still feels like a proper storybook. Some personalized books feel a bit rushed or like the pictures are generated separately, but this one has a gentle flow from page to page. The artwork feels warm and cohesive, and the child's photo is blended into the story in a really thoughtful way. It's personal without feeling gimmicky.", size: 'long' },
  { id: 8, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Lovely gift', text: "A lovely gift idea. My niece was so excited to see herself as the hero.", size: 'short' },
  { id: 13, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'She pointed and smiled', text: "My little one recognized herself straight away, which was such a lovely moment. She kept pointing at the pages and smiling. It made the book feel really personal, not just cute.", size: 'medium' },
  { id: 9, avatar: 'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Perfect for bedtime', text: "The story felt gentle and well made. Perfect for bedtime.", size: 'short' },
  { id: 21, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Arrived a day late, book was perfect', text: "The book arrived one day later than expected, but honestly the book itself was perfect. The illustrations are warm and lovely, and my son was thrilled to see himself as the main character.", size: 'medium', rating: 4 },
  { id: 10, avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'So emotional', text: "So much more emotional than I expected. A beautiful little keepsake.", size: 'short' },
  { id: 37, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Exciting from preview to bedtime', text: "The preview was easy to create and made the whole experience feel very exciting. Seeing my child inside the story before ordering was such a nice touch. I also appreciated that the book didn't feel like a simple template. The illustrations are beautiful, and the story has a calm, loving feeling that makes it perfect for bedtime.", size: 'long' },
  { id: 14, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Easy preview, beautiful result', text: "The preview process was easy and I liked being able to see how the book would look before ordering. The illustrations are warm and storybook-like, and the personalization feels carefully done.", size: 'medium' },
  { id: 22, avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'A magical effect', text: "Really beautiful book and such a sweet idea. Some pages looked more like my child than others, but the overall effect was still magical. She recognized herself and was very excited, so I'd definitely recommend it.", size: 'medium', rating: 4 },
  { id: 15, avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'A meaningful gift', text: "I bought this for my granddaughter and she absolutely loved seeing herself in the story. It felt like a meaningful gift, not just another toy or book.", size: 'medium' },
  { id: 38, avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'She felt seen and special', text: "This was a gift for my daughter, and she absolutely loved it. She recognized herself immediately and kept asking us to read it again. As a parent, I really liked that the book felt emotional and personal, not just \"funny\" or novelty. It made her feel seen and special, which is exactly what I was hoping for.", size: 'long' },
  { id: 16, avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'A real storybook', text: "What I liked most is that the book still feels like a real children's story. The personalization is special, but the story and illustrations are beautiful on their own too.", size: 'medium' },
  { id: 23, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Worth it for the reaction', text: "I loved the concept and the final book feels very special. The photo integration is impressive, though I think a couple of pages could have captured my child's expression a little better. Still, the reaction from my child made it completely worth it.", size: 'medium', rating: 4 },
  { id: 17, avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'She felt like the main character', text: "The book made my child feel like the main character, which was so sweet to watch. She was excited, but also really proud. Such a lovely idea.", size: 'medium' },
  { id: 24, avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Better than other personalized books', text: "The preview was easy to create and the book turned out lovely. I would say a few small details were not 100% perfect, but the story feels warm and the illustrations are much better than other personalized books I've tried.", size: 'medium', rating: 4 },
  { id: 39, avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Hand-drawn warmth, not digital', text: "A really lovely keepsake. The quality of the illustrations stood out to me — they feel hand-drawn and warm, not overly digital or generic. The personalization is also done in a way that feels natural. My child looked like herself, but still belonged in the story world. That balance is hard to get right, and Dreamaze did it beautifully.", size: 'long' },
  { id: 18, avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Natural photo integration', text: "I've seen a few personalized books before, but this one felt different. The photo integration looked more natural and the hand-drawn style made it feel like something we'd want to keep.", size: 'medium' },
  { id: 25, avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80', title: '"That\'s me!"', text: 'My niece loved it and immediately said, "That\'s me!" There were one or two pages where I thought the face looked slightly different, but overall it was beautifully done and made a wonderful gift.', size: 'medium', rating: 4 },
  { id: 26, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Gorgeous artwork', text: "Very happy with the book overall. The artwork is gorgeous and it feels like a real storybook, not just a template. I took off one star only because delivery was a little slower than expected.", size: 'medium', rating: 4 },
  { id: 27, avatar: 'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'A meaningful gift', text: "Such a meaningful gift. My child loved being the hero of the story. I do think some action scenes are harder to make look exactly like the photo, but the book still felt very personal and special.", size: 'medium', rating: 4 },
  { id: 28, avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Thoughtful and high quality', text: "The book is beautiful and my daughter was genuinely excited. Some pages captured her perfectly, while a couple were a little less close. But compared with other custom books, this felt much more thoughtful and high quality.", size: 'medium', rating: 4 },
  { id: 29, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'A lovely keepsake', text: "A really lovely keepsake. The illustrations are soft and charming, and the story has a nice flow. My only small note is that I would have liked one more round of edits on a few facial details, but my child loved it.", size: 'medium', rating: 4 },
  { id: 30, avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Worth the wait', text: "We had a small delay with shipping, but customer service was kind and the book was worth the wait. It's beautifully made and my little boy was so proud to see himself in the story.", size: 'medium', rating: 4 },
  { id: 31, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Priceless moment', text: "I'm giving 4 stars only because a couple of pages didn't look quite as close to the original photo as I expected. But the overall book is still gorgeous, and the moment my child recognized herself was priceless.", size: 'medium', rating: 4 },
  { id: 32, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'Most natural-looking personalized book', text: "This was a very sweet gift and the child's reaction was amazing. I think the personalization is not perfect on every single page, but it's still the most natural-looking personalized book I've seen.", size: 'medium', rating: 4 },
  { id: 33, avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=80', title: 'A real illustrated story', text: "The book feels premium and thoughtful. I especially liked that it looked like a real illustrated story, not just AI images. One or two pages were not a perfect likeness, but the whole experience was still really special.", size: 'medium', rating: 4 },
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

const StarRating = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`w-6 h-6 rounded-sm flex items-center justify-center ${
          i < count ? 'bg-[#00b67a]' : 'bg-gray-300'
        }`}
      >
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
      <StarRating count={review.rating ?? 5} />
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
  const bgImage = PERSONALIZED_STORYBOOKS('thatsme-bg.webp');

  return (
    <>
      {/* Mobile */}
      <div
        className="block md:hidden min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
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
      <div
        className="hidden md:block min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
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
