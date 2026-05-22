import Image from 'next/image';
import {
  FATHERS_DAY_EVERYTHING_FEELS_BIGGER_GRID,
  mobileAsset,
  pcAsset,
} from './fathersDayAssets';

function PhotoTile({
  src,
  caption,
  span,
}: {
  src: string;
  caption: string;
  span: 'narrow' | 'wide';
}) {
  const flexClass =
    span === 'narrow'
      ? 'flex-[232_1_0%] md:flex-[560_1_0%]'
      : 'flex-[420_1_0%] md:flex-[1040_1_0%]';
  const aspectClass =
    span === 'narrow'
      ? 'aspect-[232/400] md:aspect-[560/692]'
      : 'aspect-[420/400] md:aspect-[1040/692]';

  return (
    <figure className={`relative min-w-0 overflow-hidden ${flexClass}`}>
      <div
        className={`relative w-full ${aspectClass} md:aspect-auto md:h-full md:min-h-[280px] lg:min-h-[360px]`}
      >
        <Image
          src={mobileAsset(src)}
          alt={caption}
          fill
          className="object-cover md:hidden"
          sizes="45vw"
        />
        <Image
          src={pcAsset(src)}
          alt={caption}
          fill
          className="hidden object-cover md:block"
          sizes="480px"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-3 pb-3 pt-10 md:px-4 md:pb-4 md:pt-14">
          <figcaption className="text-[12px] leading-[16px] text-white md:text-[14px] md:leading-[20px]">
            {caption}
          </figcaption>
        </div>
      </div>
    </figure>
  );
}

function GridRow({
  items,
}: {
  items: (typeof FATHERS_DAY_EVERYTHING_FEELS_BIGGER_GRID)[number][];
}) {
  return (
    <div className="flex gap-3 md:gap-6 md:min-h-[280px] lg:min-h-[360px]">
      {items.map((item) => (
        <PhotoTile
          key={item.src}
          src={item.src}
          caption={item.caption}
          span={item.span}
        />
      ))}
    </div>
  );
}

export default function EverythingFeelsBiggerWithDad() {
  const [topLeft, topRight, bottomLeft, bottomRight] =
    FATHERS_DAY_EVERYTHING_FEELS_BIGGER_GRID;

  return (
    <section className="bg-[#f9f9f9] px-4 py-12 md:px-[88px] md:py-[88px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 md:gap-12">
        <h2 className="text-center text-[24px] font-medium leading-[32px] text-[#222222] md:text-[40px] md:leading-[48px]">
          Everything Feels Bigger with Dad
        </h2>

        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 md:max-w-[824px] md:gap-6">
          <GridRow items={[topLeft, topRight]} />
          <GridRow items={[bottomLeft, bottomRight]} />
        </div>
      </div>
    </section>
  );
}
