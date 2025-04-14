"use client";
import React from "react";
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

  return (
    <main className="bg-white relative">
      <Image className="absolute top-0 left-4 md:left-10 z-10" src={DREAMAZEBOOK_LOGO} alt="Logo" width={168} height={56} />
      <HeroBanner />

      <AnimatedSection>
        <PromotionBanner />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection redirectUrl={'/en/welcome/success-2'} style={{'--early-access-app':`url(${EARLY_ACCESS_APP})`,'--early-access':`url(${EARLY_ACCESS})`} as React.CSSProperties} cssClass={"text-white bg-(image:--early-access-app) md:bg-(image:--early-access)"} title={"For Families Who Believe in Magic Moments"} btnText={'Join Early & Be Part of the Magic'} desc={'Join a community that cherishes creativity and connection.<br/> Leave your email to be the first to bring this magic to life when we launch on Kickstarter.'} />
      </AnimatedSection>

      <AnimatedSection>
        <TheOnlyBook />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection redirectUrl={'/en/welcome/success-3'} cssClass={"bg-white"} title={"Let Your Child Shine as the Hero"} desc={'Submit your email to receive updates and exclusive early bird perks'} btnText="Unlock Early Access & Perks!" />
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
        <ReserveSection redirectUrl={'/en/welcome/success-4'} cssClass={""} desc="Leave your email now to unlock behind-the-scenes peeks into our creation process — from sketch to storybook." btnText="Sign Up& Shape the Story With Us" />
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
          redirectUrl={'/en/welcome/success-5'}
          style={{'--vip-discount-app':`url(${VIP_DISCOUNT_APP})`,'--vip-discount':`url(${VIP_DISCOUNT})`} as React.CSSProperties}
          //cssClass={"text-white bg-(image:--vip-discount-app) md:bg-(image:--vip-discount)"}
          title={"Your Smartest Save Yet!"}
          desc="Be among the first to reserve and lock in our exclusive 40% VIP discount <br/> a once-only offer to reward early supporters who know a good thing when they see it."
          btnText="Reserve Early & Save Big" />
      </AnimatedSection>

      <Footer />
    </main>
  )
}