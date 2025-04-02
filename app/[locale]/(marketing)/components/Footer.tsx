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
      <Image className="mx-auto" src={DREAMAZEBOOK_LOGO} alt="Logo" width={200} height={70} />
    </AnimatedSection>
  )
}