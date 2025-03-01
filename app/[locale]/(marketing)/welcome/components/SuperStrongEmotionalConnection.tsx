// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import { useEffect } from 'react';
import { Container } from '../../components/Container';
import { ContainerTitle } from '../../components/ContainerTitle';
import { ContainerDesc } from '../../components/ContainerDesc';

const VIDEOS = [
  {
    video: '/welcome/super-strong-emotional-connection/dad-baby.mp4',
  },
  {
    video: '/welcome/super-strong-emotional-connection/luna.mp4', 
  },
  {
    video: '/welcome/super-strong-emotional-connection/luna-read.mp4',
  },
  {
    video: '/welcome/super-strong-emotional-connection/son-read.mp4',
  },
  {
    video: '/welcome/super-strong-emotional-connection/daughter-read.mp4',
  },
  {
    video: '/welcome/super-strong-emotional-connection/mother-son.mp4',
  },
  {
    video: '/welcome/super-strong-emotional-connection/dad-son.mp4',
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

    // // Add the module preload link
    // const preloadLink = document.createElement("link");
    // preloadLink.rel = "modulepreload";
    // preloadLink.href =
    //   "https://panorama-slider.uiinitiative.com/assets/vendor.dba6b2d2.js";
    // document.head.appendChild(preloadLink);

    // // Add the external script
    // const script = document.createElement("script");
    // script.type = "module";
    // script.crossOrigin = "anonymous";
    // script.src =
    //   "https://panorama-slider.uiinitiative.com/assets/index.d2ce9dca.js";
    // document.body.appendChild(script);

    // // Cleanup script and links on unmount
    // return () => {
    //   // document.head.removeChild(link);
    //   document.head.removeChild(preloadLink);
    //   document.body.removeChild(script);
    // };
  }, []);
  return (
    <Container cssClass="bg-[#FFFBF3]">
      <ContainerTitle cssClass='mb-6'>
        Super Strong<br/><span className="text-[#022CCE]">Emotional</span> Connection
      </ContainerTitle>
      <ContainerDesc cssClass='max-w-5xl mx-auto'>
      Reading a story where you and your child are the heroes strengthens bonds and creates cherished memories. These shared moments become treasures that last a lifetime.
      </ContainerDesc>
      
      <div className="relative mt-16">
        <Swiper
          slidesPerView={2}
          breakpoints={{
            // when window width is >= 640px
            640: {
              slidesPerView: 2,
            },
            // when window width is >= 768px
            768: {
              slidesPerView: 3,
            },
            // when window width is >= 1024px
            // 1024: {
            //   slidesPerView: 4,
            // },
          }}
          spaceBetween={10}
          centeredSlides={true}
          grabCursor={true}
          loop={true}
          autoplay={
            {
              delay: 500
            }
          }
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
          {VIDEOS.map(({video},idx) => (
            <SwiperSlide key={idx}>
              <div className="relative aspect-[4/3] rounded overflow-hidden">
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
      </div>



    {/* <div className="panorama-slider  ">
      <div className="swiper h-[240px]">
        <div className="swiper-wrapper gap-5">
          {VIDEOS.map(({video}, idx) => (
            <div className="swiper-slide" key={idx}>
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
    </div> */}


    </Container>
  )
}