import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import DreamzeImage from "@/app/components/DreamzeImage"
import { useEffect, useRef } from 'react';
import { HARDCOVER, LAY_FLAT, SOFTCOVER } from '@/constants/cdn';

const COVERS = [
  {
    id: 'softcover',
    tl: 'Softcover',
    img: SOFTCOVER
  },
  {
    id: 'softcover',
    tl: 'hardcover',
    img: HARDCOVER
  },
  {
    id: 'lay-flat',
    tl: 'Premium Lay-Flat Hardcover',
    img: LAY_FLAT
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