import DreamzeImage from "@/app/components/DreamzeImage"
import { RESERVE_BOOK_URL } from "@/constants/cdn"

const BOOKS = [
  {
    tl: 'luxurious panoramic spreads',
    price: '$58',
    oprice: '97',
    desc: 'Premium Lay Flat Hardcover',
    save: '39',
    img: `${RESERVE_BOOK_URL}1.png`,
  },
  {
    tl: 'prmiium smooth matte finish',
    price: '$45',
    oprice: '76',
    desc: 'Hardcover Book',
    save: '30',
    img: `${RESERVE_BOOK_URL}2.png`,
  },
  {
    tl: 'prmiium smooth matte finish',
    price: '$35',
    oprice: '59',
    desc: 'Softcover Book',
    save: '30',
    img: `${RESERVE_BOOK_URL}3.png`,
  },
]

export default function OurBooks() {
  return (
    <section className="bg-[#FBFBF9] text-center text-[#222222] py-11 px-[22px]">
      
      <h2 className="text-[32px] font-bold mb-6">Our Books</h2>

      <div className="flex flex-col gap-5">
        {BOOKS.map((book)=>
          <article key={book.tl} className="bg-[#FBF7F4] relative w-full aspect-[750/587]">
            <DreamzeImage src={book.img} alt={book.tl} />
            {/* <h3 className="font-light text-[14px] text-black">{book.tl}</h3>
            <div className="flex items-center bg-[#FCF2F2]">
              <div className="text-4xl text-[#012DCE] font-bold w-3/5">{book.price}</div>
              
              <div className="flex flex-col w-2/5">
                <p className="bg-[#FEFBE8] text-black text-[12px] font-medium py-0.5 leading-4">{book.desc}</p>
                <p className="bg-[#012DCE] text-white text-[16px] font-medium py-0.5">SAVE ${book.save}</p>
              </div>
            </div> */}
          </article>
        )}
      </div>

    </section>
  )
}