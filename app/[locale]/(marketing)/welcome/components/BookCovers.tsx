import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import DreamzeImage from "@/app/components/DreamzeImage"
import { useEffect, useRef } from 'react';

const COVERS = [
  {
    id: 'softcover',
    tl: 'Softcover',
    img: '/welcome/product-book/softcover.png'
  },
  {
    id: 'softcover',
    tl: 'hardcover',
    img: '/welcome/product-book/hardcover.png'
  },
  {
    id: 'lay-flat',
    tl: 'Premium Lay-Flat Hardcover',
    img: '/welcome/product-book/lay-falt.png'
  },
];

interface BookCoversProps {
  curbook: string
}

export default function BookCovers({curbook}:BookCoversProps) {

  const bookCoverRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (curbook && bookCoverRef .current) {
      bookCoverRef .current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [curbook]); 

  return (
    <>
    <div className='hidden lg:block'>
      {COVERS.map(({img,id})=>
      <div className='relative aspect-square w-full' key={img} id={id} ref={curbook === id ? bookCoverRef  : null}>
        <DreamzeImage src={img} alt='' />
      </div>
      )}
    </div>
    <div className='lg:hidden'>
      <Swiper
        spaceBetween={30}
        // centeredSlides={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: true,
        }}
        loop={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
      {COVERS.map(({img})=>
      <SwiperSlide key={img} className="relative w-full aspect-square">
        <DreamzeImage src={img} alt="" />
      </SwiperSlide>
      )}
    </Swiper>
    </div>
    
  </>
  )
}