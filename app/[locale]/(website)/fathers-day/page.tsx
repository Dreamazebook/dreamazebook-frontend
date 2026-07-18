import type { Metadata } from 'next';
import Image from 'next/image'
import { Link } from '@/i18n/routing';
import BundlePromotionBlock from '../christmas/BundlePromotionBlock';
import EverythingFeelsBiggerWithDad from './EverythingFeelsBiggerWithDad';
import RecipeSection from './RecipeSection';
import AFewPagesDadNeverForget from './AFewPagesDadNeverForget';
import { FATHERS_DAY_BUNDLE_PROMO } from './fathersDayBundlePromo';
import { FATHERS_DAY_MOBILE, FATHERS_DAY_PC, mobileAsset, pcAsset } from './fathersDayAssets';
import { getBookCreatePath } from '@/constants/bookRoutes';

const DAD_BOOK_ID = 'PICBOOK_DAD';

export const metadata: Metadata = {
  title: "Father's Day | Dreamaze Book",
  description:
    "Give a gift from the heart: a personalized picture book where a child shows Dad how they see him — perfect for Father's Day and every day.",
};

export default function FathersDayPage() {
  return (
    <main className="min-h-screen bg-[#FFF7F9]">
      <div className="bg-[#FCF2F2]">
        {/* Hero/Banner */}
        <div className="relative overflow-hidden -mt-[68px] md:-mt-20">
          <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-t from-black/50 via-black/10 to-transparent md:from-transparent md:via-transparent" />
          <div className="relative min-h-[560px] mx-auto md:min-h-[720px] md:h-auto lg:h-[calc(100dvh-48px)]">
            <div
              className="relative z-10 flex min-h-[560px] flex-col justify-end gap-0 pb-10
              md:min-h-[720px] md:justify-start md:pb-8 md:pt-40
              lg:min-h-[calc(100dvh-48px)] lg:pb-0 lg:pt-48 xl:pt-60"
            >
              <div className="flex justify-center leading-[0] md:hidden">
                <Image
                  src={mobileAsset(FATHERS_DAY_MOBILE.bannerBooks)}
                  alt="Dad and Me personalized book covers"
                  width={750}
                  height={400}
                  className="block h-auto w-full max-w-full scale-110 origin-center"
                  priority
                />
              </div>
              <div className="hidden leading-[0] md:block">
                <Image
                  src={pcAsset(FATHERS_DAY_PC.bannerBooks)}
                  alt="Dad and Me personalized book covers"
                  width={718}
                  height={179}
                  className="block h-auto w-[718px] max-w-[calc(100vw-30px)] ml-[72px] object-contain object-left"
                  priority
                />
              </div>

              <div className="flex flex-col gap-6 px-4 md:gap-8 md:px-36 lg:gap-[70px]">
                <div>
                  <p className="text-white text-[32px] font-semibold leading-[40px] md:text-[64px] md:leading-[72px] md:font-medium md:tracking-[-0.25px]">
                    A Little Book of Our Big Memories
                  </p>
                  <p className="font-normal text-white/90 mt-3 max-w-xl text-[14px] md:text-[16px] md:leading-[24px]">
                    For the laughter, adventures, and little moments shared with Dad
                  </p>
                </div>

                <div className="w-full">
                  <Link
                    href={getBookCreatePath(DAD_BOOK_ID)}
                    className="w-full md:w-auto bg-[#222222] text-[#FCF2F2] text-[16px] leading-[24px] tracking-[0.5px] px-4 py-2 rounded-sm inline-flex items-center gap-2 justify-center"
                  >
                    Create Your Book
                    <Image src="/images/common/arrow-white.svg" alt="" width={16} height={16} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 z-0">
              <Image
                src={mobileAsset(FATHERS_DAY_MOBILE.banner)}
                alt="Father's Day banner"
                fill
                className="object-cover object-left object-top md:hidden"
                priority
              />
              <Image
                src={pcAsset(FATHERS_DAY_PC.banner)}
                alt="Father's Day banner"
                fill
                className="hidden object-cover object-top md:block"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <EverythingFeelsBiggerWithDad />
      <RecipeSection />
      <AFewPagesDadNeverForget />

      <div className="bg-[#FCF2F2] overflow-hidden" id="bundle-promo">
        <BundlePromotionBlock {...FATHERS_DAY_BUNDLE_PROMO} />
      </div>
    </main>
  );
}
