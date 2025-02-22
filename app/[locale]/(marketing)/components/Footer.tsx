import { AnimatedSection } from "@/app/components/AnimatedSection";
import Image from 'next/image';

export default function Footer() {
  return (
    <AnimatedSection className="bg-pink-100 p-10">
      <p className="text-blue-700 text-center text-2xl font-bold">See Yourself in A Personalised Amazing Dream</p>
      <Image className="mx-auto" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={200} height={70} />
    </AnimatedSection>
  )
}