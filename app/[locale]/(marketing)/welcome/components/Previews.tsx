import DreamzeImage from "@/app/components/DreamzeImage";
import { ContainerDesc } from "../../components/ContainerDesc";
import { Container } from "../../components/Container";
import { ContainerTitle } from "../../components/ContainerTitle";

const PREVIEWS = [
  {
    tl:'',
    desc:'',
    thumbnail:'/welcome/book-previews/preview1.png',
    img:{
      desktop:'/welcome/book-previews/preview_good_night.png',
      mobile:'/welcome/book-previews/preview_good_night_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    thumbnail:'/welcome/book-previews/preview2.png',
    img:{
      desktop:'/welcome/book-previews/preview_santas_letter.png',
      mobile:'/welcome/book-previews/preview_santas_letter_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    thumbnail:'/welcome/book-previews/preview3.png',
    img:{
      desktop:'/welcome/book-previews/preview_melody.png',
      mobile:'/welcome/book-previews/preview_melody_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    thumbnail:'/welcome/book-previews/preview4.png',
    img:{
      desktop:'/welcome/book-previews/preview_birthday.png',
      mobile:'/welcome/book-previews/preview_birthday_book_mobile.png'
    }
  },
  {
    tl:'',
    desc:'',
    thumbnail:'/welcome/book-previews/preview5.png',
    img:{
      desktop:'/welcome/book-previews/preview_bravery.png',
      mobile:'/welcome/book-previews/preview_bravery_mobile.png'
    }
  }
];

export default function Previews() {
  return (
    <Container>
      <ContainerTitle cssClass="mb-16 md:mb-0">
        Get A Sneak Peek:<br/>
        Preview Of Some Dreamaze Books!
      </ContainerTitle>

      <div className="py-16 gap-6 justify-center hidden md:flex">
        {PREVIEWS.map(({thumbnail})=>
         <div key={thumbnail} className="relative aspect-square w-15 h-15 hover:scale-120 transition-transform">
          <DreamzeImage src={thumbnail} alt="Preivew" />
         </div>
        )}
      </div>

      
      <div className="container mx-auto">
        {PREVIEWS.map(({tl,desc,img:{desktop,mobile}},idx)=>
          <article key={idx} className="text-[#222222]">
            <h3 className="font-bold text-[28px] text-center">Good Night Luna{tl}</h3>
            <ContainerDesc>
              By leaving a $1 deposit, you reserve the right to purchase this product at a discount when we launch. This is a binding agreement between you and Dreamaze Book. You retain the right to a refund until the product is delivered.{desc}
            </ContainerDesc>
            <div className="relative w-full aspect-square md:aspect-[5/2] mt-6 mb-16">
              <DreamzeImage src={desktop} alt={tl} cssClass="hidden md:block" />
              <DreamzeImage src={mobile} alt={tl} cssClass="md:hidden" />
            </div>
          </article>
        )}
      </div>
    </Container>
  )
}