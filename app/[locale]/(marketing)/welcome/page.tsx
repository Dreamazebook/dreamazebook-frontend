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
      <Image className="absolute top-0 left-10" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={168} height={56} />
      <HeroBanner />

      <AnimatedSection>
        <ReserveSection cssClass={"bg-white"} title={"Reserve a Gift That Will Last a Lifetime"} desc={'Spots are limited! Be among the first to create a one-of-a-kind book that captures their world, their way. Reserve now and be ready to surprise them!'} btnText="Reserve Now & Get Launch Updates" />
      </AnimatedSection>
      

      <AnimatedSection>
        <PromotionBanner />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/early-access-app.png)] md:bg-[url(/welcome/reserve-banner/early-access.png)]"} title={"For Families Who Believe in Magic Moments"} btnText={'Join Early & Be Part of the Magic'} desc={'Join a community that cherishes creativity and connection. Leave your email to be the first to bring this magic to life when we launch on Kickstarter.'} />
      </AnimatedSection>

      <AnimatedSection>
        <TheOnlyBook />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"bg-white"} title={"Let Them Be the Hero for the First Time"} desc={'See their eyes light up when they discover they’re the star. Be sure to submit your email to receive project updates and get notified the moment we go live.'} btnText="Reserve Now & Get Early Access" />
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
        <ReserveSection cssClass={"bg-[#F5E3E3]"} title={"Support Original Art That Inspires Wonder"} desc="Behind every page is a talented artist bringing stories to life. By reserving now, you help support creativity, craftsmanship, and meaningful storytelling." btnText="Reserve Now & Support Artists" />
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
        <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/40-vip-discount-app.png)] md:bg-[url(/welcome/reserve-banner/40-vip-discount.png)]"} title={"Your Smartest Save Yet!"} desc="Be among the first to reserve and lock in our exclusive 40% VIP discount — a once-only offer to reward early supporters who know a good thing when they see it." btnText="Reserve Early & Save Big" />
      </AnimatedSection>

      <Footer />
    </main>
  )
}