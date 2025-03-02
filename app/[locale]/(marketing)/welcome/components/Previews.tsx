import DreamzeImage from "@/app/components/DreamzeImage";
import { ContainerDesc } from "../../components/ContainerDesc";
import { Container } from "../../components/Container";
import { ContainerTitle } from "../../components/ContainerTitle";

const PREVIEWS = [
  {
    tl:'Goodnight to you',
    desc: 'Ease your little one into peaceful dreams with Good Night to You. On a magical journey through sleep, gentle animals remind them of bedtime’s beauty and calm. This personalized story sparks imagination and creates the perfect, soothing end to the day.',
    thumbnail:'/welcome/book-previews/preview1.png',
    img:{
      desktop:'/welcome/book-previews/preview_good_night.png',
      mobile:'/welcome/book-previews/preview_good_night_mobile.png'
    }
  },
  {
    tl:'Santa',
    desc:'Celebrate the magic of kindness and Christmas with a personalized letter from Santa! His warm words show how your joy and kindness create holiday magic. A cherished keepsake to treasure year after year!',
    thumbnail:'/welcome/book-previews/preview2.png',
    img:{
      desktop:'/welcome/book-previews/preview_santas_letter.png',
      mobile:'/welcome/book-previews/preview_santas_letter_mobile.png'
    }
  },
  {
    tl:'Name\'s melody',
    desc:'Celebrate your baby’s name with Name’s Melody! Each letter comes to life through music, weaving a unique rhythm just for them. Open this enchanting story and discover their special melody!',
    thumbnail:'/welcome/book-previews/preview3.png',
    img:{
      desktop:'/welcome/book-previews/preview_melody.png',
      mobile:'/welcome/book-previews/preview_melody_mobile.png'
    }
  },
  {
    tl:'Birthday Book',
    desc:'In a whimsical forest, the animals are preparing a magical birthday just for you! As they gather surprises, they discover what makes you truly special. Inspired by their findings, they send special guests to celebrate. What wonders await? Open the book and step into your birthday adventure!',
    thumbnail:'/welcome/book-previews/preview4.png',
    img:{
      desktop:'/welcome/book-previews/preview_birthday.png',
      mobile:'/welcome/book-previews/preview_birthday_book_mobile.png'
    }
  },
  {
    tl:'Bravery',
    desc:'Help your little one explore bravery through everyday moments, this heartfelt story shows that courage isn’t about being fearless but facing challenges in your own way. With warmth and reassurance, it inspires confidence and resilience, making it a cherished part of growing up.',
    thumbnail:'/welcome/book-previews/preview5.png',
    img:{
      desktop:'/welcome/book-previews/preview_bravery.png',
      mobile:'/welcome/book-previews/preview_bravery_mobile.png'
    }
  }
];

export default function Previews() {
  return (
    <Container cssClass="bg-white">
      <ContainerTitle cssClass="mb-16 md:mb-0">
        Get A Sneak Peek:<br/>
        Preview Of Some Dreamaze Books!
      </ContainerTitle>

      <div className="py-16 gap-6 justify-center hidden md:flex">
        {PREVIEWS.map(({thumbnail})=>
         <div key={thumbnail} className="relative aspect-square w-18 h-18 hover:scale-120 transition-transform">
          <DreamzeImage src={thumbnail} alt="Preivew" />
         </div>
        )}
      </div>

      
      <div className="max-w-7xl mx-auto px-3">
        {PREVIEWS.map(({tl,desc,img:{desktop,mobile}},idx)=>
          <article key={idx} className="text-[#222222]">
            <h3 className="font-bold text-[28px] text-center">{tl}</h3>
            <ContainerDesc>
              {desc}
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