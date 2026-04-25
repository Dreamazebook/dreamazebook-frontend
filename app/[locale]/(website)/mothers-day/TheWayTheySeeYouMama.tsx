import Image from 'next/image';

const INDEX_JSON =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day/index.json';
const R2_MOTHERS_DAY =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day';

/** Overrides remote captions; includes ids for when index.json adds more items. */
const THE_WAY_THEY_SEE_YOU_CAPTIONS: Record<string, string> = {
  'mama-1': "My mom's hugs are the best place in the whole world.",
  'mama-2': 'When Mom smiles at me, I feel so loved.',
  'mama-3': "I call 'Mom! Mom! Mom!' a hundred times a day",
  'mama-4': 'My mom tells the best stories.',
  'mama-5': "She's the best mom ever. I just know it.",
  'mama-6': 'My favorite place is next to Mom.',
};

type TheWayTheySeeYouItem = {
  id: string;
  type: string;
  src: string;
  caption: string;
};

type MothersDayIndex = {
  the_way_they_see_you?: TheWayTheySeeYouItem[];
};

function assetUrl(filename: string) {
  return `${R2_MOTHERS_DAY}/${encodeURIComponent(filename)}`;
}

async function getTheWayTheySeeYou(): Promise<TheWayTheySeeYouItem[]> {
  try {
    const res = await fetch(INDEX_JSON, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as MothersDayIndex;
    return data.the_way_they_see_you ?? [];
  } catch {
    return [];
  }
}

export default async function TheWayTheySeeYouMama() {
  const items = await getTheWayTheySeeYou();

  return (
    <section className="bg-white px-6 md:px-6 md:pt-[88px] pt-[64px] md:pb-[88px] pb-[24px] flex flex-col md:gap-[48px] gap-[24px] md:px-[88px]">
      <h2 className="text-center text-[24px] md:text-[40px] leading-[32px] md:leading-[40px] font-medium text-[#222222] max-w-[1184px] mx-auto">
        The Way They See You, Mama
      </h2>

      <div className="mx-auto w-full max-w-[1184px] grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 md:gap-x-12 md:gap-y-12">
        {items.map((item) => {
          const caption =
            THE_WAY_THEY_SEE_YOU_CAPTIONS[item.id] ?? item.caption;
          return (
            <article
              key={item.id}
              className="flex min-w-0 flex-col w-full overflow-hidden bg-white opacity-100"
            >
              <div className="shrink-0 w-full overflow-hidden bg-[#F5F5F5]">
                <Image
                  src={assetUrl(item.src)}
                  alt={caption.slice(0, 120)}
                  width={260}
                  height={242}
                  className="w-full h-auto object-cover object-center"
                  sizes="(max-width: 768px) 42vw, 260px"
                />
              </div>
              <p className="font-normal md:font-semibold w-full shrink-0 bg-[#FCF2F2] text-[#222222] text-[14px] md:text-[16px] leading-[20px] md:leading-[24px] tracking-[0.15px] px-2 overflow-hidden">
                {caption}
              </p>
            </article>
          );
        })}
      </div>

    </section>
  );
}
