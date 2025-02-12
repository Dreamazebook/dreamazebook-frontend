// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';

export default function SuperStrongEmotionalConnection() {
  return (
    <div className="px-4 py-16 bg-yellow-50">
      <h2 className="text-5xl font-bold text-center mb-8">Super Strong<br/><span className="text-blue-500">Emotional</span> Connection</h2>
      <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl mx-auto">
        Reading a story where you and your child are the heroes strengthens bonds and creates cherished memories. These shared moments become treasures that last a lifetime.
      </p>
      
      <div className="relative">
        <Swiper
          slidesPerView={3}
          spaceBetween={10}
          centeredSlides={true}
          grabCursor={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          effect={'coverflow'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          className="mySwiper"
        >
          {[
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
          ].map(({video}) => (
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
      </div>


    </div>
  )
}