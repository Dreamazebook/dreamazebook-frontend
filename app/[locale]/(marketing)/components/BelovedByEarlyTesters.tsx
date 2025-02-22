import { AnimatedSection } from "@/app/components/AnimatedSection";
import DreamzeImage from "@/app/components/DreamzeImage";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";

export default function BelovedByEarlyTesters() {
  return (
    <AnimatedSection className="">
      <Container>
        <ContainerTitle cssClass="mb-16">
          <span className="text-[#022CCE]">Beloved</span> By Early Testers
        </ContainerTitle>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[{
          desc: "My daughter wants me to read this book to her all the time! It's the first time she has ever been the hero of a story, and she loves showing it to everyone.",
          tl: "Ashley‘s mother",
          img: '/welcome/beloved-by-early-testers/ashley.png',
          cssClass: 'bg-[#FFF2F2]'
        },
        {
          desc: "Seeing my own child as the hero of the story is such a wonderful idea! I love how this book captures precious moments—I'll treasure it as a keepsake of all their milestones.",
          tl: "Luna‘s mother",
          img: '/welcome/beloved-by-early-testers/luna.png',
          cssClass: 'bg-[#FFFBF3]'
        },
        {
          desc: "This is the perfect gift for my grandson! The story is heartwarming, the illustrations are beautiful, and most importantly, my little cutie looks amazing in the book. I can't wait to create one for all of my grandkids！",
          tl: "Olivia‘s grandma",
          img: '/welcome/beloved-by-early-testers/olivia.png',
          cssClass: 'bg-[#F2F9FF]'
        }].map(({tl, desc, img, cssClass}) => 
          <div className={`relative ${cssClass}`} key={tl}>
            <div className="relative mx-auto w-[120px] h-[120px]">
              <DreamzeImage src={img} alt={tl} cssClass="rounded-lg" />
            </div>
            <div className="p-8">
              <h3 className="font-bold text-[#222222] text-[28px] text-center">{tl}</h3>
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