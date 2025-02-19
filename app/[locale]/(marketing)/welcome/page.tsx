"use client";
import {useEffect} from "react";
import Image from 'next/image'
import Growth from "../components/Growth";
import PromotionBanner from "../components/PromotionBanner";
import ReserveSection from "../components/ReserveSection";
import TheOnlyBook from "../components/TheOnlyBook";
import EffortlessGifting from "../components/EffortlessGifting";
import SuperStrongEmotionalConnection from "./components/SuperStrongEmotionalConnection";
import ExpertlyCrafted from "../components/ExpertlyCrafted";
import FAQWelcome from "../components/FAQWelcome";
import EmailForm from "../components/EmailForm";
import {AnimatedSection} from "@/app/components/AnimatedSection";


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
      <div className="md:flex md:items-center md:bg-[url(/landing-page/desktop-cover.png)] bg-cover md:px-10 md:min-h-[760px]">
        <AnimatedSection>
        <div className="md:container bg-[##f5e3e3] md:bg-transparent md:px-10">
          <div className="gap-8 md:w-3/5 pt-20 md:pt-0 mb-5 bg-[url(/landing-page/cover.png)] bg-cover md:bg-none h-screen md:h-auto ">
            {/* Hero Content */}
            <h1 className="text-4xl md:text-5xl font-bold text-black p-4 md:p-0">
            The Ultimate Personalized Books to Truly See Your Child
            </h1>
          </div>

          <div className='p-4 md:p-0 md:w-3/5'>
            <p>Imagine the joy on your child&apos;s face when they see themselves as the hero of their very own story. At Dreamaze, we create magical, personalized storybooks that inspire imagination, celebrate individuality, and strengthen family bonds.</p>
            <p className="mb-4">We&apos;re launching on Kickstarter soon—stay tuned!</p>

            <div className="text-center md:text-left flex flex-col gap-3 mb-4">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <h3 className="font-bold text-xl">Limited Spots Available</h3>
                <span className="hidden md:block h-[1px] bg-black w-6"></span>
                <p className="">Once they&apos;re gone, they&apos;re gone! Don&apos;t miss out</p>
              </div>
              <p>800+ people have reserved</p>
            </div>

            <div className="max-w-lg">
              <EmailForm />
            </div>

          </div>
        </div>
        </AnimatedSection>
      </div>
      

      <AnimatedSection>
        <PromotionBanner />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/early-access.png)]"} title={"Early Access"} desc={'Be the first to explore and even help shape our personalized books.'} />
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
        <ReserveSection cssClass={"bg-pink-50"} title={"40% VIP Discount"} desc="Reserve now and secure our biggest deal before it's gone!" />
      </AnimatedSection>

      <AnimatedSection className="bg-blue-50 py-16 bg-[url(/welcome/about-us-bg.png)] bg-cover h-screen flex items-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8">About Us</h2>
          <p className="text-lg max-w-2xl mx-auto text-center text-gray-700 mb-8">
            The heart of Dreamaze is simple: <b>everyone deserves to be the hero of their own story.</b> As a mother I witnessed the pure joy on my daughter&apos;s face when she saw herself in a book—a unique experience she had never had before. We believe personalized books should go beyond pieced-together avatars to create immersive experiences where you or your loved ones are the true protagonists.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-pink-50 mx-auto px-4 py-20">
        <h2 className="text-5xl font-bold text-center mb-8"><span className="text-blue-500">Beloved</span> By Early Testers</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            tl: "My daughter wants me to read this book to her all the time! It's the first time she has ever been the hero of a story, and she loves showing it to everyone.",
            desc: "LIli's mother",
            img: '/welcome/beloved-by-early-testers/lIli-mother.png'
          },
          {
            tl: "Seeing my own child as the hero of the story is such a wonderful idea! I love how this book captures precious moments—I'll treasure it as a keepsake of all their milestones.",
            desc: "Absalom's father",
            img: '/welcome/beloved-by-early-testers/absalom-father.png'
          },
          {
            tl: "This is the perfect gift for my grandson! The story is heartwarming, the illustrations are beautiful, and most importantly, my little cutie looks amazing in the book. I can't wait to create one for all of my grandkids！",
            desc: "Aaron's grandma",
            img: '/welcome/beloved-by-early-testers/aaron-grandma.png'
          }].map(({tl, desc, img}) => 
            <div className="text-center bg-white p-5" key={tl}>
              <p className="text-gray-600">{tl}</p>
              <div className="flex justify-center gap-1 items-center mt-4">
                <Image src={img} height={48} width={48} alt={desc} />
                <p className="text-gray-800 font-semibold">{desc}</p>
              </div>
            </div>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <Growth />
      </AnimatedSection>

      <AnimatedSection>
        <FAQWelcome />
      </AnimatedSection>

      <AnimatedSection>
        <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/40-vip-discount.png)]"} title={"40% VIP Discount"} desc="Reserve now and secure our biggest deal before it's gone!" />
      </AnimatedSection>

      <AnimatedSection className="bg-pink-100 p-10">
        <p className="text-blue-700 text-center text-2xl font-bold">See Yourself in A Personalised Amazing Dream</p>
        <Image className="mx-auto" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={200} height={70} />
      </AnimatedSection>
    </main>
  )
}