import DreamzeImage from "@/app/components/DreamzeImage";
import { HOME_PACKAGES, HOME_TOP_PICKS } from "@/constants/cdn";
import Image from "next/image";

function GiftPackages() {
  const packages = [
    {
      id: 1,
      quantity: 'x2',
      title: 'Side by Side Set',
      description: 'Perfect for siblings or friends',
      discount: '10%',
      extras: 'holiday extras',
      image: HOME_PACKAGES('pic_1.webp')
    },
    {
      id: 2,
      quantity: 'x3',
      title: 'Growing Together Set',
      description: 'One story for each child to feel seen',
      discount: '15%',
      extras: 'free personalized cover',
      image: HOME_PACKAGES('pic_2.webp')
    },
    {
      id: 3,
      quantity: 'x4',
      title: 'Holiday Sharing Set',
      description: 'A joyful gift for holiday gatherings.',
      discount: '20%',
      extras: 'premium festive wrapping',
      image: HOME_PACKAGES('pic_3.webp')
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F9]">
      <div
        className="relative h-[256px] md:h-[381px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${HOME_TOP_PICKS('banner.webp')})`,
          backgroundPosition: 'center 40%'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Ready-to-Gift Packages
          </h1>
          <p className="text-base md:text-lg lg:text-xl mb-2 leading-relaxed">
            Handpicked bundles with books + keepsakes - beautifully wrapped for effortless gifting.
          </p>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed">
            Create your own perfect gift set
          </p>
        </div>

        <img src={HOME_TOP_PICKS('wave_2.webp')} className="absolute bottom-0 left-0 right-0 h-16 md:h-20 w-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col items-center text-center">
              <div className="relative w-full aspect-[74/65] mb-6 md:mb-8">
                <DreamzeImage src={pkg.image} alt={pkg.title} />
              </div>

              <div className="space-y-2 mb-6 md:mb-8">
                <h2 className="text-[18px] font-medium text-[#222222]">
                  {pkg.title}
                </h2>

                <p className="text-[14px] text-[#22222299] max-w-xs mx-auto leading-relaxed">
                  {pkg.description}
                </p>

                <p className="text-[14px] text-[#22222299]">
                  save <span className="font-semibold text-[#012CCE]">{pkg.discount}</span> + {pkg.extras}
                </p>
              </div>

              <button className="inline-flex cursor-pointer items-center gap-2 text-[#222222] hover:text-primary transition-colors group text-[16px]">
                <span>Choose Books</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GiftPackages;
