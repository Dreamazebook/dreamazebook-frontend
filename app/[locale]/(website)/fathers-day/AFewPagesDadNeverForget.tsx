import Image from 'next/image';
import {
  FATHERS_DAY_MOBILE,
  FATHERS_DAY_PC,
  mobileAsset,
  pcAsset,
} from './fathersDayAssets';

export default function AFewPagesDadNeverForget() {
  return (
    <section className="bg-[#FFFFFF] px-4 pt-[64px] pb-[64px] md:px-16 md:pt-[88px] md:pb-[88px]">
      <div className="mx-auto flex w-full flex-col gap-6 md:gap-12">
        <h2 className="text-center text-[24px] font-semibold leading-[32px] text-[#222222] md:font-medium md:text-[40px] md:leading-[40px]">
          A few pages Dad will never forget
        </h2>

        <div className="w-full overflow-hidden rounded-sm">
          <Image
            src={mobileAsset(FATHERS_DAY_MOBILE.fewPagesNeverForget)}
            alt="Spreads from Dad & Me: A Little Book of Our Big Memories"
            width={750}
            height={1200}
            className="h-auto w-full md:hidden"
            sizes="100vw"
          />
          <Image
            src={pcAsset(FATHERS_DAY_PC.fewPagesNeverForget)}
            alt="Spreads from Dad & Me: A Little Book of Our Big Memories"
            width={1440}
            height={900}
            className="hidden h-auto w-full md:block"
            sizes="(min-width: 1280px) 1280px, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
