import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { aLittleMonster } from '@/app/fonts';
import {
  FATHERS_DAY_PACKED_WITH_LOVE,
  mobileAsset,
  pcAsset,
} from './fathersDayAssets';
import { getBookCreatePath } from '@/constants/bookRoutes';

const DAD_BOOK_ID = 'PICBOOK_DAD';

const TAGS_ROW = [
  { icon: '❤️', label: 'A heartfelt dedication' },
  { icon: '😊', label: 'A sweet nickname' },
] as const;

const TAG_FULL_WIDTH = {
  icon: '🙈',
  label: '3 little things only your child knows about Dad',
} as const;

const STEPS = [
  {
    title: 'Step 1',
    description: 'Upload photos of Dad, Mom, and your little one.',
  },
  {
    title: 'Step 2',
    description: 'Tell us 3 little things that make Dad feel like Dad.',
  },
  {
    title: 'Step 3',
    description: 'Add a favorite family photo and a loving note for Dad.',
  },
] as const;

function SectionBackground() {
  const bg = FATHERS_DAY_PACKED_WITH_LOVE.background;
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat md:hidden"
        style={{ backgroundImage: `url(${mobileAsset(bg)})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: `url(${pcAsset(bg)})` }}
        aria-hidden
      />
    </>
  );
}

function StepItem({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#222222]"
          aria-hidden
        />
        <h3
          className={`${aLittleMonster.className} text-[15px] text-[#222222] md:text-[22px]`}
        >
          {title}
        </h3>
      </div>
      <p className="mt-1 text-[13px] leading-[20px] text-[#222222] md:text-[16px] md:leading-[24px]">
        {description}
      </p>
    </div>
  );
}

export default function RecipeSection() {
  const { dadMomMePhotos, familyPhoto, heart } = FATHERS_DAY_PACKED_WITH_LOVE;

  return (
    <section className="relative w-full overflow-hidden">
      <SectionBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-12 pt-12 md:gap-12 md:px-16 md:pb-[88px] md:pt-[88px]">
        <h2 className="text-center text-[24px] font-medium leading-[32px] text-[#222222] md:text-[40px] md:leading-[48px]">
          Packed With Love for Dad
        </h2>

        <div className="mx-auto flex w-full max-w-[994px] flex-col items-center gap-6 md:gap-8 lg:flex-row lg:justify-center">
          {/* Ingredients card */}
          <div className="w-full max-w-[481px] min-w-0 rounded-sm bg-white px-5 py-6 md:flex md:h-[436px] md:flex-col md:justify-between md:px-6 md:py-10 lg:w-[481px] lg:shrink-0">
            <div className="flex items-start justify-center gap-4 md:gap-8">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className="flex h-[153px] w-full items-end justify-center md:h-[200px]">
                  <Image
                    src={mobileAsset(dadMomMePhotos)}
                    alt="Dad, Mom, and child photos"
                    width={170}
                    height={153}
                    className="max-h-full max-w-full object-contain md:hidden"
                    sizes="170px"
                  />
                  <Image
                    src={pcAsset(dadMomMePhotos)}
                    alt="Dad, Mom, and child photos"
                    width={312}
                    height={299}
                    className="hidden max-h-full max-w-full object-contain md:block"
                    sizes="200px"
                  />
                </div>
                <p className="mt-0.5 text-[12px] leading-[16px] text-[#222222] md:text-[18px] md:leading-[20px]">
                  Dad &amp; Mom &amp; Me photos
                </p>
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className="flex h-[153px] w-full items-end justify-center md:h-[200px]">
                  <Image
                    src={mobileAsset(familyPhoto)}
                    alt="One family photo"
                    width={146}
                    height={143}
                    className="max-h-full max-w-full object-contain md:hidden"
                    sizes="146px"
                  />
                  <Image
                    src={pcAsset(familyPhoto)}
                    alt="One family photo"
                    width={292}
                    height={286}
                    className="hidden max-h-full max-w-full object-contain md:block"
                    sizes="200px"
                  />
                </div>
                <p className="mt-0.5 text-[12px] leading-[16px] text-[#222222] md:text-[18px] md:leading-[20px]">
                  One family photo
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 md:mt-0 md:gap-3">
              <div className="flex w-full items-stretch gap-2 md:gap-3">
                {TAGS_ROW.map((tag) => (
                  <span
                    key={tag.label}
                    className="flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 px-2 py-3 bg-[#EDF1FF] text-center text-[11px] leading-[16px] text-[#222222] md:text-[18px] md:leading-[18px]"
                  >
                    <span aria-hidden>{tag.icon}</span>
                    {tag.label}
                  </span>
                ))}
              </div>
              <span className="flex w-full items-center justify-center gap-1.5 px-1 py-3 bg-[#EDF1FF] text-[11px] leading-[16px] text-[#222222] md:text-[18px] md:leading-[18px]">
                <span aria-hidden>{TAG_FULL_WIDTH.icon}</span>
                {TAG_FULL_WIDTH.label}
              </span>
            </div>
          </div>

          {/* Steps card */}
          <div className="w-full max-w-[481px] min-w-0 rounded-sm bg-white px-5 py-6 md:flex md:h-[436px] md:flex-col md:justify-center md:px-6 md:py-10 lg:w-[481px] lg:shrink-0">
            <div className="space-y-5 md:space-y-6">
              {STEPS.map((step) => (
                <StepItem
                  key={step.title}
                  title={step.title}
                  description={step.description}
                />
              ))}

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#222222]"
                    aria-hidden
                  />
                  <h3
                    className={`${aLittleMonster.className} flex items-center gap-1.5 text-[15px] text-[#222222] md:text-[22px]`}
                  >
                    <span className="text-[#222222]">Final Touch</span>
                    <Image
                      src={mobileAsset(heart)}
                      alt=""
                      width={32}
                      height={32}
                      className="h-[0.95em] w-[0.95em] shrink-0 object-contain pointer-events-none select-none"
                      unoptimized
                    />
                  </h3>
                </div>
                <div className="mt-1 space-y-1 text-[13px] leading-[20px] text-[#222222] md:text-[16px] md:leading-[24px]">
                  <p>Takes about 5 minutes to create.</p>
                  <p>Preview your full book within 48 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full justify-center">
          <Link
            href={getBookCreatePath(DAD_BOOK_ID)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#222222] px-4 py-2 text-[16px] leading-[24px] tracking-[0.5px] text-[#FCF2F2] md:w-auto"
          >
            Create Your Book
            <Image src="/images/common/arrow-white.svg" alt="" width={16} height={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
