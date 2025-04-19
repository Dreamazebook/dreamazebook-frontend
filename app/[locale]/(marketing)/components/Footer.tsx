import { AnimatedSection } from "@/app/components/AnimatedSection";
import DreamzeImage from "@/app/components/DreamzeImage";
import { DREAMAZEBOOK_LOGO, FOOTER } from "@/constants/cdn";
import Image from 'next/image';

export default function Footer() {
  return (
    <AnimatedSection className="bg-[#F5E3E3]">
      <div className="relative container mx-auto aspect-[7/2]">
        <DreamzeImage src={FOOTER} alt="Footer"/>
      </div>
      <Image className="mx-auto md:w-[200px] md:h-[70px]" src={DREAMAZEBOOK_LOGO} alt="Logo" width={100} height={35} />
    </AnimatedSection>
  )
}