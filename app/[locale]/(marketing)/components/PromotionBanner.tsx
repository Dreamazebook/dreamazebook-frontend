import DreamzeImage from '@/app/components/DreamzeImage';
import { Container } from './Container';
import { ContainerTitle } from './ContainerTitle';

export default function PromotionBanner() {
  const PROMOTION_BANNERS = [
    {
      tl: 'Lock in 40% Off',
      desc: 'Reserve now before this exclusive VIP discount disappears!',
      img: '/welcome/why-sign-up-today/lock-in-40-off.png'
    },
    {
      tl: 'First Access',
      desc: 'Early sign-ups get an exclusive bonus with their first order!',
      img: '/welcome/why-sign-up-today/first-access.png'
    },
    {
      tl: 'Limited Gift Package',
      desc: 'Early sign-ups get an exclusive bonus with their first order!',
      img: '/welcome/why-sign-up-today/limited-gift-package.png',
      cssClasses:'col-span-full md:col-span-1'
    }
  ];
  return (
    <Container cssClass="bg-[#F8F8F8]">
      <div className="container mx-auto">
        <ContainerTitle cssClass='mb-21'>Why Sign Up Today?</ContainerTitle>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-15">
          {PROMOTION_BANNERS.map(({tl,desc, img, cssClasses})=>
            <div key={tl} className={`bg-white text-center ${cssClasses}`}>
              <div className="flex items-center mb-4">
              </div>
              <h3 className="text-[28px] p-3 text-[#022CCE] font-bold text-nowrap">{tl}</h3>
              <div className='relative w-full aspect-[4/3] overflow-hidden'>
                <DreamzeImage src={img} alt={tl} cssClass="hover:scale-105 transition-transform" />
              </div>
              <p className="text-[#000000] font-light p-3">{desc}</p>
            </div>
          )}

        </div>
      </div>
    </Container>
  )
};