import DreamzeImage from "@/app/components/DreamzeImage";

const PRICES = [
  {tl: 'Softcover', price: '$35', tag: 'Budget-friendly'},
  {tl: 'Hardcover', price: '$45', tag: 'Durable and elegant'},
  {tl: 'Premium Lay-Flat Hardcover', price: '$58', tag: 'Lifelong Keepsake'}
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
          
          {PRICES.map(({price,tl,tag}, index) => (
            <article key={tl} className="bg-white p-4 mb-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl">{tl}</h2>
                <span className="text-blue-600">{price}</span>
              </div>
              <span className="mt-3 inline-block text-red-400 p-1 border border-red-300 rounded">{tag}</span>
            </article>
          ))}

          <button className="cursor-pointer w-full bg-blue-700 text-white p-3 rounded-sm uppercase">Reserve save 40%</button>
          <button className="cursor-pointer w-full p-3 text-center mt-3">No thanks</button>
        </div>

      </div>

      <div className="p-10">
        <h2 className="text-center text-4xl font-bold">Get A Sneak Peek:</h2>
        <h2 className="text-center text-4xl font-bold">Preview Of Some Dreamaze Books!</h2>

        
      </div>

    </main>
  )
}