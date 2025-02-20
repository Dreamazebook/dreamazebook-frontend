import DreamzeImage from "@/app/components/DreamzeImage";

const PREVIEWS = [
  {
    tl:'',
    desc:'',
    img:{
      desktop:'/welcome/book-previews/preview_good_night.png',
      mobile:'/welcome/book-previews/preview_good_night_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    img:{
      desktop:'/welcome/book-previews/preview_santas_letter.png',
      mobile:'/welcome/book-previews/preview_santas_letter_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    img:{
      desktop:'/welcome/book-previews/preview_melody.png',
      mobile:'/welcome/book-previews/preview_melody_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    img:{
      desktop:'/welcome/book-previews/preview_birthday.png',
      mobile:'/welcome/book-previews/preview_birthday_book_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    img:{
      desktop:'/welcome/book-previews/preview_bravery.png',
      mobile:'/welcome/book-previews/preview_bravery_mobile.png'
    }
  }
];

export default function Previews() {
  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-center text-4xl font-bold">Get A Sneak Peek:</h2>
      <h2 className="text-center text-4xl font-bold">Preview Of Some Dreamaze Books!</h2>

      
      <div className="mt-10">
        {PREVIEWS.map(({tl,desc,img:{desktop,mobile}},idx)=>
          <article key={idx} className="text-[#222222]">
            <h3 className="font-bold text-2xl text-center">Good Night Luna{tl}</h3>
            <p className="font-light my-4">By leaving a $1 deposit, you reserve the right to purchase this product at a discount when we launch. This is a binding agreement between you and Dreamaze Book. You retain the right to a refund until the product is delivered.{desc}</p>
            <div className="relative w-full aspect-square md:aspect-[5/3]">
              <DreamzeImage src={desktop} alt={tl} cssClass="hidden md:block" />
              <DreamzeImage src={mobile} alt={tl} cssClass="md:hidden" />
            </div>
          </article>
        )}
      </div>
    </div>
  )
}