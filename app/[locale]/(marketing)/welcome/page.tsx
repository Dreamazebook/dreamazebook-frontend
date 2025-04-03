"use client";
import React, {useEffect} from "react";
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
import { DREAMAZEBOOK_LOGO, EARLY_ACCESS, EARLY_ACCESS_APP, VIP_DISCOUNT, VIP_DISCOUNT_APP } from "@/constants/cdn";


export default function LandingPage() {

  // Add useEffect to handle tab close
  useEffect(() => {
    // const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    //   e.preventDefault();
    //   const confirmNavigation = window.confirm('Are you sure you want to leave? You will be redirected to a specific link.');

    //   if (confirmNavigation) {
    //     window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSehhcKV1PW221dtmrw5hQVo2oD5i98gdSmV_IhKUmc5URjKFw/viewform?embedded=true';
    //   }
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // };
  }, []);

  return (
    <main className="bg-white relative">
      <Image className="absolute top-0 left-10" src={DREAMAZEBOOK_LOGO} alt="Logo" width={168} height={56} />
      <HeroBanner />

      <AnimatedSection>
        <PromotionBanner />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection style={{'--early-access-app':`url(${EARLY_ACCESS_APP})`,'--early-access':`url(${EARLY_ACCESS})`} as React.CSSProperties} cssClass={"text-white bg-(image:--early-access-app) md:bg-(image:--early-access)"} title={"For Families Who Believe in Magic Moments"} btnText={'Join Early & Be Part of the Magic'} desc={'Join a community that cherishes creativity and connection.<br/> Leave your email to be the first to bring this magic to life when we launch on Kickstarter.'} />
      </AnimatedSection>

      <AnimatedSection>
        <TheOnlyBook />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"bg-white"} title={"Let Them Be the Hero<br/> for the First Time"} desc={'See their eyes light up when they discover they’re the star.<br/>Be sure to submit your email to receive project updates and get notified the moment we go live.'} btnText="Get Early Access" />
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
        <ReserveSection cssClass={"bg-[#F5E3E3]"} title={"Support Original Art<br/> That Inspires Wonder"} desc="Behind every page is a talented artist bringing stories to life.<br/> By reserving now, you help support creativity, craftsmanship, and meaningful storytelling." btnText="Support Artists" />
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
        <ReserveSection
          style={{'--vip-discount-app':`url(${VIP_DISCOUNT_APP})`,'--vip-discount':`url(${VIP_DISCOUNT})`} as React.CSSProperties}
          cssClass={"text-white bg-(image:--vip-discount-app) md:bg-(image:--vip-discount)"}
          title={"Your Smartest Save Yet!"}
          desc="Be among the first to reserve and lock in our exclusive 40% VIP discount <br/> a once-only offer to reward early supporters who know a good thing when they see it."
          btnText="Reserve Early & Save Big" />
      </AnimatedSection>

      <Footer />
    </main>
  )
}