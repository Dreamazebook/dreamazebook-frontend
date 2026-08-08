'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { getBookCreatePath } from '@/constants/bookRoutes';
import { WEBSITE_CDN_URL } from '@/constants/cdn';

const CDN_BASE = `${WEBSITE_CDN_URL}products/picbooks/PICBOOK_FIRST_DAY_OF_SCHOOL`;
const BIG_FIRST_PC_IMAGE = `${CDN_BASE}/A%20big%20first%20for%20both%20of%20you/A%20big%20first%20for%20both%20of%20you-PC.png`;
const BIG_FIRST_MOBILE_IMAGE = `${CDN_BASE}/A%20big%20first%20for%20both%20of%20you/A%20big%20first%20for%20both%20of%20you-mobile.png`;
const GETTING_READY_PC_IMAGE = `${CDN_BASE}/Getting%20ready%20is%20more%20than%20packing%20a%20backpack/Getting%20ready%20is%20more%20than%20packing%20a%20backpack-PC.png`;
const GETTING_READY_MOBILE_IMAGE = `${CDN_BASE}/Getting%20ready%20is%20more%20than%20packing%20a%20backpack/Getting%20ready%20is%20more%20than%20packing%20a%20backpack-mobile.png`;
const EXPERIENCE_EXPANDED_WIDTH = 752;
const EXPERIENCE_STRIP_WIDTH = 160;
const EXPERIENCE_ROW_HEIGHT = 500;
const EXPERIENCE_BASE = `${CDN_BASE}/Let%20them%20experience%20the%20first%20day%20before%20it%20arrives`;
/** expanded = 大图（experience0N）；strip = 窄条（pc-0N） */
const EXPERIENCE_MOMENTS = [1, 2, 3, 4, 5].map((n) => {
  const id = String(n).padStart(2, '0');
  return {
    id,
    expandedSrc: `${EXPERIENCE_BASE}/Let%20them%20experience${id}.png`,
    stripSrc: `${EXPERIENCE_BASE}/Let%20them%20experience-pc-${id}.png`,
    mobileSrc: `${EXPERIENCE_BASE}/Let%20them%20experience-mobile-${id}.png`,
    alt: `First day moment ${n}`,
  };
});
const HERO_SECTION_BASE = `${CDN_BASE}/When%20they%E2%80%99re%20the%20hero%2C%20the%20story%20means%20more`;
/** PC 端每张 360px 宽，步进 216px（重叠 40%） */
const HERO_SPREAD_PC_WIDTH = 360;
const HERO_SPREAD_PC_HEIGHT = 270;
const HERO_SPREAD_PC_STEP = Math.round(HERO_SPREAD_PC_WIDTH * 0.6);
const HERO_SPREAD_IMAGES = [1, 2, 3, 4].map((n) => {
  const id = String(n).padStart(2, '0');
  const zIndexById: Record<string, number> = { '01': 1, '02': 4, '03': 2, '04': 3 };
  return {
    id,
    src: `${HERO_SECTION_BASE}/When%20they%E2%80%99re%20the%20hero-${id}.png`,
    alt: `Personalized storybook spread ${n}`,
    zIndex: zIndexById[id],
  };
});
const HERO_SPREAD_PC_TOTAL_WIDTH =
  HERO_SPREAD_PC_WIDTH + (HERO_SPREAD_IMAGES.length - 1) * HERO_SPREAD_PC_STEP;
const HERO_SPREAD_MOBILE_WIDTH = 240;
const HERO_SPREAD_MOBILE_HEIGHT = 180;
const HERO_SPREAD_MOBILE_STEP = Math.round(HERO_SPREAD_MOBILE_WIDTH * 0.6);
const HERO_SPREAD_MOBILE_TOTAL_WIDTH =
  HERO_SPREAD_MOBILE_WIDTH +
  (HERO_SPREAD_IMAGES.length - 1) * HERO_SPREAD_MOBILE_STEP;
const HERO_TESTIMONIAL_PC_IMAGE = `${HERO_SECTION_BASE}/%E8%AF%84%E8%AF%AD-PC.png`;
const HERO_TESTIMONIAL_MOBILE_IMAGE = `${HERO_SECTION_BASE}/%E8%AF%84%E8%AF%AD-mobile.png`;
const TESTIMONIAL_BODY =
  'I still remember my eldest starting school—and wishing I had helped him feel more prepared. This time, I know I can’t take every worry away. But with this story, his little sister can know what to expect and carry a little piece of home with her.”';
const TESTIMONIAL_ATTRIBUTION = '— Sarah, mum of two';

/** Mobile：叠放露边 + 左右滑动翻页（循环） */
const HeroSpreadMobileCarousel: React.FC = () => {
  const count = HERO_SPREAD_IMAGES.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const snapTo = (direction: 1 | -1) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragOffset(direction * -HERO_SPREAD_MOBILE_STEP);
    window.setTimeout(() => {
      setActiveIndex((index) => (index + direction + count) % count);
      setDragOffset(0);
      setIsAnimating(false);
    }, 300);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    touchStartX.current = event.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || isAnimating) return;
    const delta = event.touches[0].clientX - touchStartX.current;
    const clamped = Math.max(
      -HERO_SPREAD_MOBILE_STEP,
      Math.min(HERO_SPREAD_MOBILE_STEP, delta),
    );
    setDragOffset(clamped);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || isAnimating) return;
    isDragging.current = false;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (delta < -40) snapTo(1);
    else if (delta > 40) snapTo(-1);
    else setDragOffset(0);
  };

  return (
    <div className="w-full md:hidden flex justify-center overflow-hidden px-4">
      <div
        className="relative touch-pan-y"
        style={{
          width: HERO_SPREAD_MOBILE_TOTAL_WIDTH,
          height: HERO_SPREAD_MOBILE_HEIGHT,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: count }).map((_, slot) => {
          const image = HERO_SPREAD_IMAGES[(activeIndex + slot) % count];
          return (
            <div
              key={slot}
              className="absolute top-0"
              style={{
                left: slot * HERO_SPREAD_MOBILE_STEP,
                width: HERO_SPREAD_MOBILE_WIDTH,
                height: HERO_SPREAD_MOBILE_HEIGHT,
                zIndex: count - slot,
                transform: `translateX(${dragOffset}px)`,
                transition: isAnimating ? 'transform 300ms ease-out' : undefined,
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain object-center pointer-events-none"
                sizes="240px"
                unoptimized
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface FirstDayOfSchoolSectionsProps {
  bookId: string | number;
}

const SectionHeading: React.FC<{
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
}> = ({
  title,
  description,
  className = 'w-full max-w-[815px]',
  titleClassName = 'text-center text-[24px] md:text-[40px] font-semibold md:font-medium leading-[32px] md:leading-[64px] tracking-normal text-[#222]',
}) => (
  <div className={`mx-auto flex flex-col items-center gap-4 md:gap-6 px-4 md:px-0 ${className}`}>
    <h2
      className={titleClassName}
      style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
    >
      {title}
    </h2>
    {description && (
      <p className="text-center text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px] tracking-[0.25px] md:tracking-[0.5px] text-[#222222]">
        {description}
      </p>
    )}
  </div>
);

/** A Big First for Both of You */
const BigFirstSection: React.FC = () => (
  <section className="w-full bg-[#FCF2F2] py-12 md:py-[88px] flex flex-col items-center gap-8 md:gap-12 px-4 md:px-0">
    <SectionHeading title="A Big First for Both of You" />
    <div className="w-full max-w-[1200px] mx-auto px-0 md:px-4">
      <div className="relative w-full hidden md:block">
        <Image
          src={BIG_FIRST_PC_IMAGE}
          alt="A Big First for Both of You"
          width={1200}
          height={400}
          className="w-full h-auto object-contain"
          unoptimized
        />
      </div>
      <div className="relative w-full md:hidden">
        <Image
          src={BIG_FIRST_MOBILE_IMAGE}
          alt="A Big First for Both of You"
          width={750}
          height={900}
          className="w-full h-auto object-contain"
          unoptimized
        />
      </div>
    </div>
    <p className="text-center text-[14px] md:text-[16px] font-medium leading-[20px] md:leading-[24px] tracking-[0.5px] text-[#222222] px-4">
      Your first day worries begin with the same thing: not knowing what comes next.
    </p>
  </section>
);

/** Getting ready is more than packing a backpack */
const GettingReadySection: React.FC = () => (
  <section className="w-full bg-white flex flex-col justify-center items-center py-12 px-4 md:py-[88px] md:px-[120px] overflow-hidden">
    <SectionHeading
      title="Getting ready is more than packing a backpack"
      className="w-full md:w-[837px]"
      titleClassName="w-full text-center text-[24px] leading-[32px] font-semibold md:text-[40px] md:leading-[64px] md:font-medium md:tracking-[0] text-[#222] not-italic"
    />
    <div className="relative w-full max-w-[1008px]">
      <div className="relative w-full hidden md:block">
        <Image
          src={GETTING_READY_PC_IMAGE}
          alt="Getting ready is more than packing a backpack"
          width={1008}
          height={523}
          className="w-full h-auto object-contain"
          unoptimized
        />
      </div>
      <div className="relative w-full md:hidden">
        <Image
          src={GETTING_READY_MOBILE_IMAGE}
          alt="Getting ready is more than packing a backpack"
          width={750}
          height={900}
          className="w-full h-auto object-contain"
          unoptimized
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-2 md:pb-4 text-center text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px] tracking-[0.5px] text-[#666666]">
        <p>The most important preparation?</p>
        <p>Helping them picture how the first day might feel.</p>
      </div>
    </div>
  </section>
);

/** Story moments: 序号固定 1–5；桌面 hover 时被 hover 的变大图，其余变窄条 */
const StoryMomentsSection: React.FC = () => (
  <section className="w-full bg-white flex flex-col justify-center items-center gap-8 md:gap-[48px] py-12 px-0 md:py-[88px] md:px-0 overflow-hidden">
    <SectionHeading
      title="Let them experience the first day before it arrives"
      description="Walk through each little moment together—from getting ready to Mama coming back."
      className="w-full max-w-[1200px] px-4 md:px-0"
      titleClassName="w-full text-center text-[24px] leading-[32px] font-semibold md:text-[40px] md:leading-[64px] md:font-medium md:tracking-[0] md:whitespace-nowrap text-[#222] not-italic"
    />

    {/* Mobile: 横向滚动，不切换宽窄 */}
    <div className="w-full flex md:hidden gap-2 h-[280px] overflow-x-auto px-4">
      {EXPERIENCE_MOMENTS.map((moment) => (
        <div
          key={moment.id}
          className="relative h-full w-[200px] shrink-0 overflow-hidden bg-[#F3F3FA]"
        >
          <Image
            src={moment.mobileSrc}
            alt={moment.alt}
            fill
            className="object-cover"
            sizes="200px"
            unoptimized
          />
        </div>
      ))}
    </div>

    {/* Desktop: 展开 752px 显示大图，收起 160px 显示窄条；用原生 img 确保 CSS 切换生效 */}
    <div
      className="experience-row hidden md:flex w-full justify-center px-0"
      style={{ height: EXPERIENCE_ROW_HEIGHT }}
    >
      {EXPERIENCE_MOMENTS.map((moment) => (
        <div
          key={moment.id}
          className="experience-item relative h-full shrink-0 overflow-hidden bg-[#F3F3FA]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={moment.expandedSrc}
            alt={moment.alt}
            className="experience-img-expanded"
            width={EXPERIENCE_EXPANDED_WIDTH * 2}
            height={EXPERIENCE_ROW_HEIGHT * 2}
            decoding="async"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={moment.stripSrc}
            alt=""
            className="experience-img-strip"
            width={EXPERIENCE_STRIP_WIDTH * 2}
            height={EXPERIENCE_ROW_HEIGHT * 2}
            decoding="async"
            aria-hidden
          />
        </div>
      ))}
    </div>

    <style jsx>{`
      .experience-row {
        gap: 0;
      }

      .experience-item {
        width: ${EXPERIENCE_STRIP_WIDTH}px;
        margin-right: 12px;
        transition: width 300ms ease-out;
      }

      .experience-item:last-child {
        margin-right: 0;
      }

      /* 默认：第一张展开为大图宽度 */
      .experience-item:first-child {
        width: ${EXPERIENCE_EXPANDED_WIDTH}px;
      }

      .experience-row:hover .experience-item:first-child:not(:hover) {
        width: ${EXPERIENCE_STRIP_WIDTH}px;
      }

      .experience-item:hover {
        width: ${EXPERIENCE_EXPANDED_WIDTH}px;
      }

      .experience-img-expanded,
      .experience-img-strip {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        transition: opacity 200ms ease-out;
      }

      /* 大图按原始比例完整显示，不裁剪 */
      .experience-img-expanded {
        object-fit: contain;
        object-position: center;
        opacity: 0;
      }

      .experience-img-strip {
        object-fit: cover;
        object-position: center;
        opacity: 1;
      }

      .experience-item:first-child .experience-img-expanded {
        opacity: 1;
      }

      .experience-item:first-child .experience-img-strip {
        opacity: 0;
      }

      .experience-row:hover .experience-item:first-child:not(:hover) .experience-img-expanded {
        opacity: 0;
      }

      .experience-row:hover .experience-item:first-child:not(:hover) .experience-img-strip {
        opacity: 1;
      }

      .experience-item:hover .experience-img-expanded {
        opacity: 1;
      }

      .experience-item:hover .experience-img-strip {
        opacity: 0;
      }
    `}</style>
  </section>
);

/** Fanned spreads + testimonial */
const HeroTestimonialSection: React.FC = () => (
  <section className="w-full bg-white pt-12 md:pt-[88px] pb-12 md:pb-11 px-4 md:px-[120px] flex flex-col items-center gap-8 md:gap-12 overflow-hidden">
    <SectionHeading
      title="When they’re the hero, the story means more."
      description="Their story. Their feelings. Their Mama coming back."
    />

    <HeroSpreadMobileCarousel />

    {/* Desktop: 绝对定位叠放，每张重叠约 40% */}
    <div
      className="relative hidden md:block"
      style={{ width: HERO_SPREAD_PC_TOTAL_WIDTH, height: HERO_SPREAD_PC_HEIGHT }}
    >
      {HERO_SPREAD_IMAGES.map((image, index) => (
        <div
          key={image.id}
          className="absolute top-0"
          style={{
            left: index * HERO_SPREAD_PC_STEP,
            width: HERO_SPREAD_PC_WIDTH,
            height: HERO_SPREAD_PC_HEIGHT,
            zIndex: image.zIndex,
          }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain object-center"
            sizes="360px"
            unoptimized
          />
        </div>
      ))}
    </div>

    <div className="relative w-full max-w-[1130px]">
      {/* PC：固定 1130×518 比例，引号/文案按 Figma 坐标叠在背景内 */}
      <div className="relative hidden md:block w-full aspect-[1130/518] overflow-hidden">
        <Image
          src={HERO_TESTIMONIAL_PC_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          sizes="1130px"
          unoptimized
        />
        <div className="pointer-events-none absolute inset-0">
          <p
            className="absolute left-[13.5%] top-[31%] text-[128px] leading-[64px] text-[rgba(1,44,206,0.4)] select-none"
            aria-hidden
          >
            “
          </p>
          <div className="absolute left-[16.81%] top-[34.66%] w-[36.64%]">
            <p className="text-[16px] font-normal leading-[24px] tracking-[0.25px] text-[#222222]">
              {TESTIMONIAL_BODY}
            </p>
            <p className="mt-4 text-[16px] font-normal leading-[24px] tracking-[0.25px] text-[#222222]">
              {TESTIMONIAL_ATTRIBUTION}
            </p>
            <p
              className="absolute left-[79%] top-[82%] text-[128px] leading-[64px] text-[rgba(1,44,206,0.4)] select-none"
              aria-hidden
            >
              ”
            </p>
          </div>
        </div>
      </div>

      {/* Mobile：左下粉区内横向窄栏排版，开/闭引号 */}
      <div className="relative md:hidden w-full aspect-[750/708] overflow-hidden">
        <Image
          src={HERO_TESTIMONIAL_MOBILE_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        <div className="pointer-events-none absolute left-0 top-[36%] w-1/2">
          <div className="relative pl-[6%] pr-[2%]">
            <p
              className="text-[40px] leading-none text-[rgba(1,44,206,0.4)] select-none"
              aria-hidden
            >
              “
            </p>
            <div className="mt-1 text-[13px] font-normal leading-[18px] tracking-[0.25px] text-[#222222]">
              <p>{TESTIMONIAL_BODY}</p>
              <p className="mt-2">{TESTIMONIAL_ATTRIBUTION}</p>
            </div>
            <p
              className="absolute right-0 top-[72%] text-[40px] leading-none text-[rgba(1,44,206,0.4)] select-none"
              aria-hidden
            >
              ”
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/** Final CTA */
const FinalCtaSection: React.FC<{ bookId: string | number }> = ({ bookId }) => (
  <section className="relative w-full overflow-hidden px-4 md:px-[120px] py-12 md:py-[88px] flex flex-col items-center gap-8 md:gap-12">
    <div className="absolute inset-0 bg-[#FCF2F2] pointer-events-none" />
    <div className="relative z-10 w-full max-w-[815px] flex flex-col items-center gap-4 md:gap-6">
      <h2 className="text-center text-[24px] md:text-[40px] font-semibold md:font-medium leading-[32px] md:leading-[64px] text-[#222222]">
        Make their first day feel more familiar
      </h2>
      <p className="text-center text-[14px] md:text-[16px] font-normal leading-[20px] md:leading-[24px] tracking-[0.5px] text-[#222222]">
        Create their personalized school story and preview it free before you decide.
      </p>
    </div>
    <Link
      href={getBookCreatePath(String(bookId))}
      className="relative z-10 inline-flex h-[44px] items-center justify-center rounded-[4px] bg-[#222222] px-4 text-[16px] leading-[24px] tracking-[0.5px] text-[#F5E3E3] hover:bg-black transition-colors"
    >
      Create Their Free Preview
    </Link>
  </section>
);

const FirstDayOfSchoolSections: React.FC<FirstDayOfSchoolSectionsProps> = ({
  bookId,
}) => (
  <>
    <BigFirstSection />
    <GettingReadySection />
    <StoryMomentsSection />
    <HeroTestimonialSection />
    <FinalCtaSection bookId={bookId} />
  </>
);

export default FirstDayOfSchoolSections;
