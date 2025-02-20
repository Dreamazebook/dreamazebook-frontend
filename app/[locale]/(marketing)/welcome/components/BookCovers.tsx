import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import DreamzeImage from "@/app/components/DreamzeImage"

const COVERS = [
  {
    img: '/welcome/product-book/softcover.png'
  },
  {
    img: '/welcome/product-book/hardcover.png'
  },
  {
    img: '/welcome/product-book/lay-falt.png'
  },
]
export default function BookCovers() {
  return (
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
  )
}