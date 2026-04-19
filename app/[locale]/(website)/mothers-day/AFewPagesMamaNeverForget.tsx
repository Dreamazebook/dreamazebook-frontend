import Image from 'next/image';

const R2_MOTHERS_DAY =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day';

function assetUrl(filename: string) {
  return `${R2_MOTHERS_DAY}/${encodeURIComponent(filename)}`;
}

const IMG_DESKTOP = 'A few pages Mama will never forget.jpg';
const IMG_MOBILE = 'A few pages Mama will never forget-mobile.jpg';

export default function AFewPagesMamaNeverForget() {
  return (
    <section className="bg-[#FFFFFF] px-4 pt-[64px] pb-[64px] md:px-16 md:pt-[88px] md:pb-[88px]">
      <div className="mx-auto flex w-full flex-col gap-6 md:gap-12">
        <h2 className="text-center text-[24px] font-semibold leading-[32px] text-[#222222] md:font-medium md:text-[40px] md:leading-[40px]">
          A few pages Mama will never forget
        </h2>

        <div className="w-full overflow-hidden rounded-sm">
          <Image
            src={assetUrl(IMG_MOBILE)}
            alt="Spreads from The Way I See You Mama picture book"
            width={750}
            height={1200}
            className="h-auto w-full md:hidden"
            sizes="100vw"
          />
          <Image
            src={assetUrl(IMG_DESKTOP)}
            alt="Spreads from The Way I See You Mama picture book"
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
