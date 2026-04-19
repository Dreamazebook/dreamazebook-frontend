import type { Metadata } from 'next';
import Image from 'next/image'
import { Link } from '@/i18n/routing';
import TheWayTheySeeYouMama from './TheWayTheySeeYouMama';
import RecipeSection from './RecipeSection';
import AFewPagesMamaNeverForget from './AFewPagesMamaNeverForget';

const MOM_BOOK_ID = 'PICBOOK_MOM';

export const metadata: Metadata = {
  title: "Mother's Day | Dreamaze Book",
  description:
    "Give a gift from the heart: a personalized picture book where a child shows Mama how they see her — perfect for Mother's Day and every day.",
};

export default function MothersDayPage() {
  return (
    <main className="min-h-screen bg-[#FFF7F9]">
      <div className="bg-[#FCF2F2]">
        {/* Hero/Banner */}
        <div className="relative overflow-hidden md:-mt-20">
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
          />
          {/* Banner container: 1440x537 with 10px horizontal padding and 10px gap semantics */}
          <div className="relative h-[560px] md:h-[537px] mx-auto px-[10px]">
            {/* Mobile: 叠在 banner 下半区；Desktop: 顶部留白排版 */}
            <div
              className="z-10 flex flex-col gap-6
              absolute inset-x-0 bottom-0 justify-end px-4 pb-10
              md:relative md:inset-auto md:top-auto md:bottom-auto md:gap-[88px] md:px-36 md:pt-36 md:pb-0 md:justify-start"
            >
              <div className="md:max-w-[736px]">
                <p className="text-[#012CCE] text-[36px] font-semibold leading-[44px] md:text-[64px] md:leading-[88px] md:font-medium md:tracking-[-0.25px]">
                  Happy Mother's Day
                </p>
                <p className="font-semibold md:font-normal text-[#222222] mt-4 max-w-xl text-[14px] md:text-[16px]">
                  Celebrate the beautiful bond between you and your little one.
                </p>
              </div>
              <div className="w-full">
                <Link
                  href={`/personalize?book=${MOM_BOOK_ID}`}
                  className="w-full md:w-auto bg-[#222222] text-[#FCF2F2] text-[16px] leading-[24px] tracking-[0.5px] px-4 py-2 rounded-sm inline-flex items-center gap-2 justify-center"
                >
                  Create Your Book
                  <Image src="/images/common/arrow-white.svg" alt="" width={16} height={16} />
                </Link>
              </div>
         
            </div>

            {/* Background image: cover the entire banner area */}
            <div className="absolute inset-x-0 bottom-0 md:top-[-36px] top-[0] z-0">
              {/* Mobile banner */}
              <Image
                src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day/banner-mobile.png"
                alt="Mother's Day banner"
                fill
                className="object-cover object-top block md:hidden"
                priority
              />
              {/* Desktop banner */}
              <Image
                src="https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day/banner.png"
                alt="Mother's Day banner"
                fill
                className="object-cover object-top hidden md:block"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <TheWayTheySeeYouMama />
      <RecipeSection />
      <AFewPagesMamaNeverForget />
    </main>
  );
}
