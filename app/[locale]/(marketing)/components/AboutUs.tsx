import { AnimatedSection } from "@/app/components/AnimatedSection";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";
import Image from "next/image";

export const AboutUs = () => {
  return (
    <AnimatedSection className="bg-blue-50 py-16 bg-[url(/welcome/about-us/about-us-bg.png)] bg-cover h-screen flex items-center">
    <div className="container mx-auto px-4">
      <ContainerTitle cssClass="mb-6">About Us</ContainerTitle>
      <ContainerDesc cssClass="">
        The heart of Dreamaze is simple:<br/>
        <b>everyone deserves to be the hero of their own story.</b><br/>
        As a mother I witnessed the pure joy on my daughter&apos;s face when she saw herself in a book—a unique experience she had never had before.<br/>
        We believe personalized books should go beyond pieced-together avatars to create immersive experiences where<br/>
        <b>you or your loved ones are the true protagonists.</b>
      </ContainerDesc>
      <Image src='/welcome/about-us/logo.png' className="mx-auto mt-6" alt="Logo" width={200} height={70} />
    </div>
    </AnimatedSection>
  );
};