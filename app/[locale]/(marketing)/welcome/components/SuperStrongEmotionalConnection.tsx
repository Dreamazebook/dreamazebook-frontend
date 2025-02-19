// Import Swiper React components
// import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import { useEffect } from 'react';

const VIDEOS = [
  {
    video: '/welcome/super-strong-emotional-connection/20250209-212016.mp4',
    title: 'Bedtime Stories',
    desc: 'Create magical moments every night'
  },
  {
    video: '/welcome/super-strong-emotional-connection/20250209-212024.mp4', 
    title: 'Family Time',
    desc: 'Share adventures together'
  },
  {
    video: '/welcome/super-strong-emotional-connection/20250209-212132.mp4',
    title: 'Learning Together',
    desc: 'Make education fun and personal'
  },
  {
    video: '/welcome/super-strong-emotional-connection/20250209-212138.mp4',
    title: 'Learning Together',
    desc: 'Make education fun and personal'
  },
  {
    video: '/welcome/super-strong-emotional-connection/20250209-212147.mp4',
    title: 'Learning Together',
    desc: 'Make education fun and personal'
  },
];

export default function SuperStrongEmotionalConnection() {
  useEffect(() => {
    // // Add the external CSS link
    // const link = document.createElement("link");
    // link.rel = "stylesheet";
    // link.href =
    //   "https://panorama-slider.uiinitiative.com/assets/index.c1d53924.css";
    // document.head.appendChild(link);

    // Add the module preload link
    const preloadLink = document.createElement("link");
    preloadLink.rel = "modulepreload";
    preloadLink.href =
      "https://panorama-slider.uiinitiative.com/assets/vendor.dba6b2d2.js";
    document.head.appendChild(preloadLink);

    // Add the external script
    const script = document.createElement("script");
    script.type = "module";
    script.crossOrigin = "anonymous";
    script.src =
      "https://panorama-slider.uiinitiative.com/assets/index.d2ce9dca.js";
    document.body.appendChild(script);

    // Cleanup script and links on unmount
    return () => {
      // document.head.removeChild(link);
      document.head.removeChild(preloadLink);
      document.body.removeChild(script);
    };
  }, []);
  return (
    <div className="px-4 py-16 bg-yellow-50">
      <h2 className="text-5xl font-bold text-center mb-8">Super Strong<br/><span className="text-blue-500">Emotional</span> Connection</h2>
      <p className="text-lg text-center text-[#222222] font-light mb-8 max-w-4xl mx-auto">
        Reading a story where you and your child are the heroes strengthens bonds and creates cherished memories. These shared moments become treasures that last a lifetime.
      </p>
      
      {/* <div className="relative">
        <Swiper
          slidesPerView={3}
          spaceBetween={10}
          centeredSlides={true}
          grabCursor={true}
          loop={true}
          effect={'coverflow'}
          coverflowEffect={{
            rotate: 80,
            depth: -100,
            modifier: .2,
            scale: 1.2,
            stretch: 0,
            slideShadows: true,
          }}
          className="mySwiper"
        >
          {VIDEOS.map(({video}) => (
            <SwiperSlide key={video}>
              <div className="relative aspect-video rounded overflow-hidden">
                <video 
                  src={video}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div> */}



    <div className="panorama-slider  ">
      <div className="swiper h-[240px]">
        <div className="swiper-wrapper gap-5">
          {VIDEOS.map(({video}) => (
            <div className="swiper-slide" key={video}>
              <video 
                src={video}
                className="slide-image w-full h-full object-cover pointer-events-none"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          ))}
          
        </div>
      </div>
    </div>


    </div>
  )
}