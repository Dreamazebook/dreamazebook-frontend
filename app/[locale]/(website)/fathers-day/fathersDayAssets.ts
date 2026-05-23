const R2_FATHERS_DAY_PC =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/fathers-day/PC';
const R2_FATHERS_DAY_MOBILE =
  'https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/fathers-day/mobile';

export function pcAsset(filename: string) {
  return `${R2_FATHERS_DAY_PC}/${encodeURIComponent(filename)}`;
}

export function mobileAsset(filename: string) {
  return `${R2_FATHERS_DAY_MOBILE}/${encodeURIComponent(filename)}`;
}

export const FATHERS_DAY_EVERYTHING_FEELS_BIGGER_GRID = [
  {
    src: 'Everything Feels Bigger with Dad.png',
    caption: "Dad's shoes feel enormous.",
    span: 'narrow',
  },
  {
    src: 'Everything Feels Bigger with Dad-1.png',
    caption: "Dad's shoulders make the world feel bigger.",
    span: 'wide',
  },
  {
    src: 'Everything Feels Bigger with Dad-2.png',
    caption: 'Dad always helps me reach a little higher.',
    span: 'wide',
  },
  {
    src: 'Everything Feels Bigger with Dad-3.png',
    caption: "Dad's hands are always close by.",
    span: 'narrow',
  },
] as const;

export const FATHERS_DAY_PACKED_WITH_LOVE = {
  background: 'Packed With Love for Dad.png',
  dadMomMePhotos: 'Packed With Love for Dad-1.png',
  familyPhoto: 'Packed With Love for Dad-2.png',
  heart: '爱心.png',
} as const;

export const FATHERS_DAY_PC = {
  banner: 'BANNER.png',
  bannerBooks: 'A Little Book of Our Big Memories.png',
} as const;

export const FATHERS_DAY_MOBILE = {
  banner: 'BANNER.png',
  bannerBooks: 'A Little Book of Our Big Memories.png',
  everythingFeelsBigger: [
    'Everything Feels Bigger with Dad.png',
    'Everything Feels Bigger with Dad-1.png',
    'Everything Feels Bigger with Dad-2.png',
    'Everything Feels Bigger with Dad-3.png',
  ],
} as const;
