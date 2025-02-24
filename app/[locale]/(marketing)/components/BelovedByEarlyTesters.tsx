import { AnimatedSection } from "@/app/components/AnimatedSection";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";
import Image from "next/image";

export default function BelovedByEarlyTesters() {
  return (
    <AnimatedSection className="bg-[url(/welcome/beloved-by-early-testers/bg.png)] bg-cover">
      <Container>
        <ContainerTitle cssClass="mb-32 flex items-center justify-center gap-3">
          <span><span className="text-[#022CCE]">Beloved</span> By Early Testers</span>
          <Image src="/welcome/beloved-by-early-testers/like.png" alt="Like" width={64} height={64} />
        </ContainerTitle>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[{
          desc: "My daughter wants me to read this book to her all the time! It’s the first time she has ever been the hero of a story, and she loves showing it to everyone.",
          tl: "LIli‘s mother",
          img: '/welcome/beloved-by-early-testers/lili-mother.png',
          cssClass: 'bg-[#FFF2F2]'
        },
        {
          desc: "Seeing my own child as the hero of the story is such a wonderful idea! I love how this book captures precious moments—I’ll treasure it as a keepsake of all their milestones.",
          tl: "Mirabelle’s father",
          img: '/welcome/beloved-by-early-testers/mirabelle-father.png',
          cssClass: 'bg-[#FFFBF3]'
        },
        {
          desc: "This is the perfect gift for my grandson! The story is heartwarming, the illustrations are beautiful, and most importantly, my little cutie looks amazing in the book. I can’t wait to create one for all of my grandkids！",
          tl: "Aaron‘s grandma",
          img: '/welcome/beloved-by-early-testers/aaron-grandma.png',
          cssClass: 'bg-[#F2F9FF]'
        }].map(({tl, desc, img, cssClass}) => 
          <div className={`relative ${cssClass}`} key={tl}>
            <Image src={img} alt={tl} width={120} height={120} className="absolute mx-auto -top-14 left-0 right-0" />
            <div className="p-9">
              <h3 className="font-bold text-[#222222] text-[28px] text-center mt-10 mb-4">{tl}</h3>
              <Image src={'/welcome/beloved-by-early-testers/star.png'} alt="Rating" width={168} height={24} className="mx-auto mb-4" />
              <ContainerDesc cssClass="text-left">
                {desc}
              </ContainerDesc>
            </div>
          </div>
        )}
      </div>
      </Container>
    </AnimatedSection>
  )
}