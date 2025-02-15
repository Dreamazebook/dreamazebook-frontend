import DreamzeImage from "@/app/components/DreamzeImage";
import FAQReserve from "../../components/FAQReserve";

const PRICES = [
  {
    bg:'bg-white',
     tl: 'Softcover',
     discount: '$35',
     price: '$59',
     desc: 'Light yet durable, this softcover edition offers a flexible and travel-friendly option'
  },
  {
    headerStyle:'bg-linear-to-r from-[#FF638A] from-20% to-[#FF2566] to-[100%] text-transparent bg-clip-text',
     header: 'Creator\'s Recommendation',
    bg:'bg-[#FFFBF3]',
     tl: 'Hardcover',
     discount: '$45',
     price: '$75',
     desc: 'Premium hardcover with a smooth matte finish, designed for lasting reading and enjoyment.'
  },
  {
    headerStyle:'bg-linear-to-r from-[#FF638A] from-20% via-[#FF8383] via-46% via-[#867BFF] via-75% to-[#FF2566] to-[100%] text-transparent bg-clip-text',
     header: 'Most People\'s Choice',
     bg:'bg-white',
     tl: 'Premium Lay-Flat Hardcover',
     discount: '$58',
     price: '$97',
     desc: 'Luxurious layflat design with seamless panoramic spreads—perfect for a lifelong keepsake gift.'
  },
];

export default function Reserve() {
  return (
    <main className="bg-gray-100">

      <div className="w-full md:flex">
        <div className="relative w-full aspect-square md:w-1/2">
          <DreamzeImage src="/welcome/the-only-book/lucas.png" alt="Test" />
        </div>

        <div className="p-6 w-full md:w-1/2">
          <h1 className="text-3xl text-center font-bold">Reserve Your Special Discount</h1>
          <p className="my-4">Choose your preferred format and reserve the lowest price ever.</p>
          
          {PRICES.map(({price,discount,tl,desc,header,headerStyle,bg}) => (
            <article key={tl} className="mb-3 from-[#FFF4F4] to-[#FFE5E5]">
              {header && <h2 className={`font-semibold py-2 px-4 bg-red-50 ${headerStyle}`}>{header}</h2>}
              <div className={`${bg} p-4`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{tl}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-[#012CCE] font-bold">{discount}</span>
                    <span className="line-through text-[#999999]">{price}</span>
                  </div>
                </div>
                <span className="mt-3 text-xl text-[#999999]">{desc}</span>
              </div>
            </article>
          ))}

          <button className="cursor-pointer w-full bg-blue-700 text-white p-3 rounded-sm uppercase">Reserve save 40%</button>
          <button className="cursor-pointer w-full p-3 text-center mt-3">No thanks</button>
        </div>

      </div>

      <FAQReserve />

      <div className="p-10">
        <h2 className="text-center text-4xl font-bold">Get A Sneak Peek:</h2>
        <h2 className="text-center text-4xl font-bold">Preview Of Some Dreamaze Books!</h2>

        
      </div>

    </main>
  )
}