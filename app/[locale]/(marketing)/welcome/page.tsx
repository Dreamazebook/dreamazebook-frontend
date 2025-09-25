"use client";
import React from "react";
import Image from 'next/image'
// import Growth from "../components/Growth";
// import PromotionBanner from "../components/PromotionBanner";
// import ReserveSection from "../components/ReserveSection";
// import TheOnlyBook from "../components/TheOnlyBook";
// import EffortlessGifting from "../components/DeeplyMeaningful";
// import SuperStrongEmotionalConnection from "./components/SuperStrongEmotionalConnection";
// import ExpertlyCrafted from "../components/ExpertlyCrafted";
// import FAQWelcome from "../components/FAQWelcome";
import {AnimatedSection} from "@/app/components/AnimatedSection";
// import HeroBanner from "../components/HeroBanner";
// import { AboutUs } from "../components/AboutUs";
// import BelovedByEarlyTesters from "../components/BelovedByEarlyTesters";
import { DREAMAZEBOOK_LOGO } from "@/constants/cdn";
import CountdownBanner from "../components/CountdownBanner";
import TestimonialSlider from "./components/TestimonialSlider";
import AGiftConnectHearts from "../components/AGiftConnectHearts";


export default function LandingPage() {

  return (
    <main className="bg-white relative">
      <Image className="absolute top-0 left-4 md:left-10 z-10" src={DREAMAZEBOOK_LOGO} alt="Logo" width={168} height={56} />

      <CountdownBanner />

      <AnimatedSection>
        <AGiftConnectHearts />
      </AnimatedSection>

      <AnimatedSection>
      <TestimonialSlider />
      </AnimatedSection>

      {/* <AnimatedSection>
        <FAQWelcome />
      </AnimatedSection> */}
      
      {/* <HeroBanner />

      <AnimatedSection>
        <PromotionBanner />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection btnId="email_submit_mid" redirectUrl={'/en/welcome/success'} cssClass={"bg-[#F5E3E3]"} title={"Let Your Child Shine as the Hero"} desc={'Submit your email to receive updates and exclusive early bird perks'} btnText="Unlock Early Access & Perks!" />
      </AnimatedSection>

      <AnimatedSection>
        <EffortlessGifting />
      </AnimatedSection>

      <AnimatedSection>
        <SuperStrongEmotionalConnection />
      </AnimatedSection>

      <AnimatedSection>
        <ExpertlyCrafted />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection btnId="email_submit_3rd" redirectUrl={'/en/welcome/success'} cssClass={""} desc="Leave your email now to unlock behind-the-scenes peeks into our creation process — from sketch to storybook." btnText="Sign Up& Shape the Story With Us" />
      </AnimatedSection>

      <AboutUs />

      <BelovedByEarlyTesters/>

      <AnimatedSection>
        <Growth />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection
          btnId="email_submit_footer"
          redirectUrl={'/en/welcome/success'}
          style={{'--vip-discount-app':`url(${VIP_DISCOUNT_APP})`,'--vip-discount':`url(${VIP_DISCOUNT})`} as React.CSSProperties}
          //cssClass={"text-white bg-(image:--vip-discount-app) md:bg-(image:--vip-discount)"}
          title={"Your Smartest Save Yet!"}
          desc="Be among the first to reserve and lock in our exclusive 40% VIP discount <br/> a once-only offer to reward early supporters who know a good thing when they see it."
          btnText="Reserve Early & Save Big" />
      </AnimatedSection>

      <Footer /> */}
    </main>
  )
}