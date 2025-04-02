import { AnimatedSection } from "@/app/components/AnimatedSection";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";
import Image from "next/image";
import { BELOVED_AMELIA, BELOVED_AMELIA_BG, BELOVED_AMELIA_BG_APP, BELOVED_BG, BELOVED_ELIJA, BELOVED_ELIJA_BG, BELOVED_ELIJA_BG_APP, BELOVED_ETHAN, BELOVED_ETHAN_BG, BELOVED_ETHAN_BG_APP, BELOVED_LIKE, BELOVED_START } from "@/constants/cdn";

export default function BelovedByEarlyTesters() {
  return (
    <AnimatedSection style={{'backgroundImage':`url(${BELOVED_BG})`}} className="bg-cover">
      <Container>
        <ContainerTitle cssClass="mb-32 flex items-center justify-center gap-3">
          <span><span className="text-[#022CCE]">Beloved</span> By Early Testers</span>
          <Image src={BELOVED_LIKE} alt="Like" width={64} height={64} />
        </ContainerTitle>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 px-2.5 md:px-0 gap-24 md:gap-12">
        {[{
          desc: "The moment I saw the melody book with my son’s face in it, I was truly moved. Seeing the instruments come together, carrying the unique blessing behind his name, felt so personal and magical. It’s such a beautiful and meaningful gift!",
          tl: "Elija’s Mom",
          img: BELOVED_ELIJA,
          style: {'--elija-app':`url(${BELOVED_ELIJA_BG_APP})`,'--elija':`url(${BELOVED_ELIJA_BG})`},
          cssClass: 'bg-(image:--elija-app) md:bg-(image:--elija)'
        },
        {
          desc: "Seeing my own child as the hero of the story is such a wonderful idea! We love how this book captures precious moments—we’ll treasure it as a keepsake of all his milestones.",
          tl: "Ethan’s Dad",
          img: BELOVED_ETHAN,
          style: {'--ethan-app':`url(${BELOVED_ETHAN_BG_APP})`,'--ethan':`url(${BELOVED_ETHAN_BG})`},
          cssClass: 'bg-(image:--ethan-app) md:bg-(image:--ethan)'
        },
        {
          desc: "This is the perfect gift for my granddaughter! The story is heartwarming, the illustrations are beautiful, and most importantly, my little cutie looks amazing in the book. I can’t wait to create one for all of my grandkids！",
          tl: "Amelia’s grandma",
          img: BELOVED_AMELIA,
          style: {'--amelia-app':`url(${BELOVED_AMELIA_BG_APP})`,'--amelia':`url(${BELOVED_AMELIA_BG})`},
          cssClass: 'bg-(image:--amelia-app) md:bg-(image:--amelia)'
        }].map(({tl, desc, img, style, cssClass}) => 
          <article style={style as React.CSSProperties} className={`relative bg-cover ${cssClass}`} key={tl}>
            <Image src={img} alt={tl} width={120} height={120} className="absolute mx-auto -top-14 left-0 right-0" />
            <div className="p-9">
              <h3 className="font-bold text-[#222222] text-[28px] text-center mt-10 mb-4">{tl}</h3>
              <Image src={BELOVED_START} alt="Rating" width={168} height={24} className="mx-auto mb-4" />
              <ContainerDesc cssClass="text-left">
                {desc}
              </ContainerDesc>
            </div>
          </article>
        )}
      </div>
      </Container>
    </AnimatedSection>
  )
}