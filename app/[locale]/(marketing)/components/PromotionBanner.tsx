import DreamzeImage from '@/app/components/DreamzeImage';
import { Container } from './Container';
import { ContainerTitle } from './ContainerTitle';
import { FIRST_ACCESS, KICKSTARTER, LIMITED_GIFT_PACKAGE, LOCK_IN_OFF } from '@/constants/cdn';

export default function PromotionBanner() {
  const PROMOTION_BANNERS = [
    {
      tl: 'Lock in 40% Off',
      desc: 'Reserve now before this exclusive VIP discount disappears!',
      img: LOCK_IN_OFF
    },
    {
      tl: 'Be First to Create Joy',
      desc: 'Be the first to explore and even influence our personalized books.',
      img: FIRST_ACCESS
    },
    {
      tl: 'Exclusive Early-Bird Gift',
      desc: 'Early sign-ups get an exclusive bonus with their first order!',
      img: LIMITED_GIFT_PACKAGE,
      cssClasses:'col-span-full md:col-span-1'
    }
  ];
  return (
    <Container cssClass="bg-[#F8F8F8]">
      <div className="container mx-auto px-4">
        <ContainerTitle cssClass='mb-16 md:mb-21'>Why Sign Up Today?</ContainerTitle>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-15">
          {PROMOTION_BANNERS.map(({tl,desc, img, cssClasses})=>
            <div key={tl} className={`bg-white text-center ${cssClasses}`}>
              <h3 className="text-[16px] md:text-[28px] p-3 text-[#022CCE] font-bold">{tl}</h3>
              <div className='relative w-full aspect-[4/3] overflow-hidden'>
                <DreamzeImage src={img} alt={tl} cssClass="hover:scale-105 transition-transform" />
              </div>
              <p className="text-[#000000] font-light p-3">{desc}</p>
            </div>
          )}

        </div>
      </div>
      <div className='relative aspect-[616/30] max-w-[323px] md:max-w-[616px] mx-auto mt-24'> 
        <DreamzeImage src={KICKSTARTER} alt="Kickstarter" />
      </div>
    </Container>
  )
};