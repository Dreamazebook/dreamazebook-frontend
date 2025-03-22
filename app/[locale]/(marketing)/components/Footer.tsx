import { AnimatedSection } from "@/app/components/AnimatedSection";
import DreamzeImage from "@/app/components/DreamzeImage";
import Image from 'next/image';

export default function Footer() {
  return (
    <AnimatedSection className="bg-[#F5E3E3]">
      <div className="relative container mx-auto aspect-[7/2]">
        <DreamzeImage src={'/welcome/footer.png'} alt="Footer"/>
      </div>
      <Image className="mx-auto" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={200} height={70} />
    </AnimatedSection>
  )
}