import Image from 'next/image';
import { aLittleMonster } from '@/app/fonts';

const INDEX_JSON =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day/index.json';
const R2_MOTHERS_DAY =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day';
const TILED_BG =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/mothers-day/%E5%BA%95%E5%9B%BE.jpg';

const BG_TILE_WIDTH_PX = 640;
const FINAL_TOUCH_HEART_IMAGE = '爱心.png';

type HighlightItem = { id: string; type: string; src: string };
type MothersDayIndex = { highlights?: HighlightItem[] };

const FALLBACK_HIGHLIGHTS: HighlightItem[] = [
  { id: 'heartfelt-dedication', type: 'image', src: 'A heartfelt dedication.png' },
  { id: 'sweet-nickname', type: 'image', src: 'A sweet nickname.png' },
  { id: 'child-drawings', type: 'image', src: '2 child drawings.png' },
  { id: 'mama-and-child-photos', type: 'image', src: 'Mama & child photos.png' },
  { id: 'one-family-photo', type: 'image', src: 'One family photo.png' },
  { id: 'what-mama-makes-best', type: 'image', src: 'What Mama makes best.png' },
];

const INGREDIENTS = [
  { id: 'child-drawings', label: '2 child drawings' },
  { id: 'mama-and-child-photos', label: 'Mama & child photos' },
  { id: 'sweet-nickname', label: 'A sweet nickname' },
  { id: 'what-mama-makes-best', label: 'What Mama makes best' },
  { id: 'one-family-photo', label: 'One family photo' },
  { id: 'heartfelt-dedication', label: 'A heartfelt dedication' },
] as const;

const STEPS = [
  { t: 'Step 1', d: 'Tell us a little about your child.' },
  { t: 'Step 2', d: 'Upload up to 2 child drawings.\nOptional — but highly recommended.' },
  { t: 'Step 3', d: 'Tell us what Mama makes best.\nPancakes? Big hugs? Bedtime stories?\nHard to choose…' },
  { t: 'Step 4', d: 'Upload your favorite photos together.' },
  { t: 'Step 5', d: 'Add one family photo and\na loving dedication message.' },
] as const;

function assetUrl(filename: string) {
  return `${R2_MOTHERS_DAY}/${encodeURIComponent(filename)}`;
}

async function getHighlights(): Promise<HighlightItem[]> {
  try {
    const res = await fetch(INDEX_JSON, { next: { revalidate: 300 } });
    if (!res.ok) return FALLBACK_HIGHLIGHTS;
    const data = (await res.json()) as MothersDayIndex;
    const items = data.highlights ?? [];
    return items.length > 0 ? items : FALLBACK_HIGHLIGHTS;
  } catch {
    return FALLBACK_HIGHLIGHTS;
  }
}

export default async function RecipeSection() {
  const highlights = await getHighlights();
  const byId = new Map(highlights.map((h) => [h.id, h]));

  return (
    <section
      className="relative w-full"
      style={{
        backgroundImage: `url(${TILED_BG})`,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: `${BG_TILE_WIDTH_PX}px auto`,
      }}
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-16 pt-[64px] md:pt-[88px] pb-[64px] md:pb-[88px] gap-[24px] md:gap-[48px] flex flex-col">
        <div className="text-center flex flex-col">
          <h2 className="text-[24px] md:text-[40px] font-medium text-[#222222]">
            Recipe for the Perfect Mother’s Day Gift
          </h2>
          <p className="mt-2 text-[14px] md:text-[16px] text-[#444444]">
            Just a few little ingredients, made with lots of love.
          </p>
        </div>

        <div className="flex flex-col md:gap-[48px] gap-[24px]">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-[12px] md:text-[14px] text-[#222222]">
            {[
              'Prep time: 5 min',
              'Love: 100%',
              'Difficulty: Easy',
              'Best enjoyed with: Mama',
              'Best served with: Hugs',
            ].map((chip) => (
              <span
                key={chip}
                className="px-3 py-1"
                style={{ backgroundColor: '#FFF9DF' }}
              >
                {chip}
              </span>
            ))}
          </div>
            
          <div className="relative overflow-visible flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Ingredients card */}
            <div className="relative z-[1] w-full min-w-0 lg:flex-1 bg-white rounded-[16px] shadow-sm px-5 pt-6 pb-8 md:pt-8 md:pb-[160px] xl:pb-[260px] overflow-visible">
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 text-[#222222]">
                  <span
                    className={`${aLittleMonster.className} text-[18px] md:text-[22px] tracking-wide text-[#222222]`}
                  >
                    ------ Ingredients ------
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                  {INGREDIENTS.map((it) => {
                    const hit = byId.get(it.id);
                    const src = hit?.src ? assetUrl(hit.src) : '';
                    return (
                      <div key={it.id} className="flex flex-col items-center text-center gap-2">
                        <div className="relative w-[60px] h-[60px] md:w-[120px] md:h-[120px]">
                          {src ? (
                            <Image
                              src={src}
                              alt={it.label}
                              width={120}
                              height={120}
                              className="w-full h-full object-contain"
                              sizes="120px"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full rounded-[12px] bg-[#F3F3F3]" />
                          )}
                        </div>
                        <div className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[18px] md:leading-[28px] text-[#222222] leading-snug">
                          {it.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 桌面端装饰锅 */}
              <div
                className="pointer-events-none select-none hidden md:block absolute -bottom-[30%] left-1/2 z-0 w-[110%] max-w-none -translate-x-1/2 opacity-90"
                aria-hidden
              >
                <Image
                  src={assetUrl('锅.png')}
                  alt=""
                  width={748}
                  height={302}
                  className="h-auto w-full"
                />
              </div>
            </div>

            {/* Steps */}
            <div className="relative z-[1] w-full shrink-0 lg:w-[400px] text-[#222222]">
              <div className="space-y-5 md:space-y-6">
                {STEPS.map((s) => (
                  <div key={s.t}>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#222222]"
                        aria-hidden
                      />
                      <div
                        className={`${aLittleMonster.className} text-[15px] md:text-[28px] text-[#222222]`}
                      >
                        {s.t}
                      </div>
                    </div>
                    <div className="mt-1 text-[13px] md:text-[18px] md:leading-[28px] text-[#222222] whitespace-pre-line">
                      {s.d}
                    </div>
                  </div>
                ))}

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#222222]"
                      aria-hidden
                    />
                    <div
                      className={`${aLittleMonster.className} flex min-w-0 items-center gap-1 text-[15px] md:gap-1.5 md:text-[28px]`}
                    >
                      <span className="text-[#222222]">Final Touch</span>
                      <Image
                        src={assetUrl(FINAL_TOUCH_HEART_IMAGE)}
                        alt=""
                        width={32}
                        height={32}
                        className="h-[0.95em] w-[0.95em] shrink-0 object-contain pointer-events-none select-none"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="mt-1 text-[13px] md:text-[18px] md:leading-[28px] text-[#222222] space-y-1">
                    <p>
                      Takes about 5 minutes to create. <br /> Preview your full book within 48 hours after ordering.
                    </p>
                  </div>
                </div>

                {/* 手机端：裁切为中间区域，避免整宽缩放过扁 */}
                <div
                  className="relative mx-auto h-[min(200px,42vw)] w-full max-w-[360px] overflow-hidden md:hidden pointer-events-none select-none opacity-90 -mt-10"
                  aria-hidden
                >
                  <Image
                    src={assetUrl('锅.png')}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="360px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}

