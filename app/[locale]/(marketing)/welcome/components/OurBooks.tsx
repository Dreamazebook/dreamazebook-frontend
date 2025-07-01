import DreamzeImage from "@/app/components/DreamzeImage"
import { RESERVE_BOOKS_URL, RESERVE_LAUNCHING } from "@/constants/cdn"

// const BOOKS = [
//   {
//     tl: 'luxurious panoramic spreads',
//     price: '$58',
//     oprice: '97',
//     desc: 'Premium Lay Flat Hardcover',
//     save: '39',
//     img: `${RESERVE_BOOK_URL}1.png`,
//   },
//   {
//     tl: 'prmiium smooth matte finish',
//     price: '$45',
//     oprice: '76',
//     desc: 'Hardcover Book',
//     save: '30',
//     img: `${RESERVE_BOOK_URL}2.png`,
//   },
//   {
//     tl: 'prmiium smooth matte finish',
//     price: '$35',
//     oprice: '59',
//     desc: 'Softcover Book',
//     save: '30',
//     img: `${RESERVE_BOOK_URL}3.png`,
//   },
// ]

export default function OurBooks() {
  return (
    <section className="bg-[#FBFBF9] text-center text-[#222222] py-11 px-[22px]">
      
      <h2 className="text-[32px] font-bold mb-3">One Story <br/>Three Beautiful Ways</h2>
      <p className="font-light text-[16px] mb-6">3 Formats, 3 Styles — all crafted to suit different needs.</p>

      <div className="flex flex-col gap-5">
        <article className="bg-[#FBF7F4] relative w-full aspect-[765/949]">
          <DreamzeImage src={RESERVE_BOOKS_URL} alt="One Story, Three Beautiful Ways" />
        </article>
      </div>

      <div className="relative w-full aspect-[572/97] mt-5">
        <DreamzeImage src={RESERVE_LAUNCHING} alt="One Story, Three Beautiful Ways" />
      </div>

    </section>
  )
}