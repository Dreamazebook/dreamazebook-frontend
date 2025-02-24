"use client";
import {useEffect} from "react";
import Image from 'next/image'
import Growth from "../components/Growth";
import PromotionBanner from "../components/PromotionBanner";
import ReserveSection from "../components/ReserveSection";
import TheOnlyBook from "../components/TheOnlyBook";
import EffortlessGifting from "../components/DeeplyMeaningful";
import SuperStrongEmotionalConnection from "./components/SuperStrongEmotionalConnection";
import ExpertlyCrafted from "../components/ExpertlyCrafted";
import FAQWelcome from "../components/FAQWelcome";
import {AnimatedSection} from "@/app/components/AnimatedSection";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import { AboutUs } from "../components/AboutUs";
import BelovedByEarlyTesters from "../components/BelovedByEarlyTesters";


export default function LandingPage() {

  // Add useEffect to handle tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const confirmNavigation = window.confirm('Are you sure you want to leave? You will be redirected to a specific link.');

      if (confirmNavigation) {
        window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSehhcKV1PW221dtmrw5hQVo2oD5i98gdSmV_IhKUmc5URjKFw/viewform?embedded=true';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <main className="bg-white relative">
      <Image className="absolute top-0 left-10" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={168} height={56} />
      <HeroBanner />
      

      <AnimatedSection>
        <PromotionBanner />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/early-access-app.png)] md:bg-[url(/welcome/reserve-banner/early-access.png)]"} title={"Early Access"} desc={'Be the first to explore and even help shape our personalized books.'} />
      </AnimatedSection>

      <AnimatedSection>
        <TheOnlyBook />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"bg-white"} title={"Make It Extra Special"} desc={'Create a magical story starring your little one.'} />
      </AnimatedSection>

      <AnimatedSection>
        <SuperStrongEmotionalConnection />
      </AnimatedSection>
      

      <AnimatedSection>
        <ExpertlyCrafted />
      </AnimatedSection>
      
      <AnimatedSection>
        <EffortlessGifting />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"bg-[#F5E3E3]"} title={"40% VIP Discount"} desc="Reserve now and secure our biggest deal before it's gone!" />
      </AnimatedSection>

      <AboutUs />

      <BelovedByEarlyTesters/>

      <AnimatedSection>
        <Growth />
      </AnimatedSection>

      <AnimatedSection>
        <FAQWelcome />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/40-vip-discount-app.png)] md:bg-[url(/welcome/reserve-banner/40-vip-discount.png)]"} title={"40% VIP Discount"} desc="Reserve now and secure our biggest deal before it's gone!" />
      </AnimatedSection>

      <Footer />
    </main>
  )
}