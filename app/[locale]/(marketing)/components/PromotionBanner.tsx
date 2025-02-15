import DreamzeImage from '@/app/components/DreamzeImage';

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
    <section className="px-4 py-12 sm:py-16 bg-gray-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Why Sign Up Today?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          {PROMOTION_BANNERS.map(({tl,desc, img, cssClasses})=>
            <div key={tl} className={`bg-white text-center ${cssClasses}`}>
              <div className="flex items-center mb-4">
              </div>
              <h3 className="text-xl p-6 text-blue-800 font-semibold mb-2 text-nowrap">{tl}</h3>
              <div className='relative w-full aspect-[4/3]'>
                <DreamzeImage src={img} alt={tl} cssClass="hover:scale-105 transition-transform overflow-hidden" />
              </div>
              <p className="text-gray-600 p-6">{desc}</p>
            </div>
          )}

        </div>
      </div>
    </section>
  )
};