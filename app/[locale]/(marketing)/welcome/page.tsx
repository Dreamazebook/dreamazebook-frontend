"use client";
import { useEffect } from "react";
import { useIsMobile } from "../../../hooks/useInMobile";

import Image from "next/image";
import Growth from "../components/Growth";
import PromotionBanner from "../components/PromotionBanner";
import ReserveSection from "../components/ReserveSection";
import TheOnlyBook from "../components/TheOnlyBook";
import EffortlessGifting from "../components/EffortlessGifting";
import SuperStrongEmotionalConnection from "./components/SuperStrongEmotionalConnection";
import ExpertlyCrafted from "../components/ExpertlyCrafted";
import FAQWelcome from "../components/FAQWelcome";
import EmailForm from "../components/EmailForm";
import { AnimatedSection } from "@/app/components/AnimatedSection";
import DreamzeImage from "@/app/components/DreamzeImage";

export default function LandingPage() {
  const isMobile = useIsMobile();
  // Add useEffect to handle tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const confirmNavigation = window.confirm(
        "Are you sure you want to leave? You will be redirected to a specific link."
      );

      if (confirmNavigation) {
        window.location.href =
          "https://docs.google.com/forms/d/e/1FAIpQLSehhcKV1PW221dtmrw5hQVo2oD5i98gdSmV_IhKUmc5URjKFw/viewform?embedded=true";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <main className="bg-white relative w-screen h-screen">
      <div className="max-w-[1440px] relative">
        {/* Hero Section */}

        <div className="w-screen relative">
          <Image
            src={
              isMobile
                ? "/landing-page/cover.jpg"
                : "/landing-page/desktop-cover.jpg"
            }
            alt="dreamaze hero"
            width={1920}
            height={1080}
            className="w-full h-auto"
          />
          <div className="absolute top-0 left-10 md:left-20 flex flex-col gap-10 md:gap-4 xl:gap-6">
            <Image
              src={"/logo_rectangle.jpg"}
              alt="dreamaze logo"
              width={112}
              height={56}
              className="md:left-1/14 xl:w-[168px]"
            />
            <h1 className="text-3xl sm:text-5xl lg:text-4xl xl:text-5xl leading-8 sm:leading-14 lg:leading-12 xl:leading-16 font-bold text-black whitespace-pre-wrap">
              {isMobile
                ? "The Ultimate\nPersonalized Books\nto Truly\nSee Your Child"
                : "The Ultimate Personalized Books\nto Truly See Your Child"}
            </h1>
            {!isMobile && (
              <>
                <div className="w-2/3 sm:w-1/2 text-xs lg:text-md xl:text-sm flex flex-col gap-2">
                  <h6 className="font-light">
                    Imagine the joy on your child&apos;s face when they see
                    themselves as the hero of their very own story. At Dreamaze,
                    we create magical, personalized storybooks that inspire
                    imagination, celebrate individuality, and strengthen family
                    bonds.
                  </h6>
                  <h3>
                    <span className="font-bold">Limited Spots Available </span>
                    <span className="font-light">
                      - Once they&apos;re gone, they&apos;re gone! Don&apos;t
                      miss out!
                    </span>
                  </h3>
                  <p className="font-light">800+ people have reserved</p>
                </div>
                <div className="md:w-1/2 max-w-lg">
                  <EmailForm />
                </div>
              </>
            )}
          </div>
        </div>

        {/* <AnimatedSection>
          <PromotionBanner />
        </AnimatedSection>

        <AnimatedSection>
          <ReserveSection
            cssClass={
              "text-white bg-[url(/welcome/reserve-banner/early-access.png)]"
            }
            title={"Early Access"}
            desc={
              "Be the first to explore and even help shape our personalized books."
            }
          />
        </AnimatedSection>

        <AnimatedSection>
          <TheOnlyBook />
        </AnimatedSection>

        <AnimatedSection>
          <ReserveSection
            cssClass={"bg-white"}
            title={"Make It Extra Special"}
            desc={"Create a magical story starring your little one."}
          />
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
          <ReserveSection
            cssClass={"bg-pink-50"}
            title={"40% VIP Discount"}
            desc="Reserve now and secure our biggest deal before it's gone!"
          />
        </AnimatedSection>

        <AnimatedSection className="bg-blue-50 py-16 bg-[url(/welcome/about-us-bg.png)] bg-cover h-screen flex items-center">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-bold text-center mb-8">About Us</h2>
            <p className="text-lg max-w-3xl mx-auto text-center text-[#222222] mb-8 font-light">
              The heart of Dreamaze is simple:{" "}
              <b>everyone deserves to be the hero of their own story.</b> <br />
              As a mother <br />I witnessed the pure joy on my daughter&apos;s
              face when she saw herself in a book—a unique experience she had
              never had before. We believe personalized books should go beyond
              pieced-together avatars to create immersive experiences where you
              or your loved ones are the true protagonists.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection className="bg-pink-50 mx-auto px-4 py-20">
          <h2 className="text-5xl font-bold text-center mb-8">
            <span className="text-blue-500">Beloved</span> By Early Testers
          </h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                desc: "My daughter wants me to read this book to her all the time! It's the first time she has ever been the hero of a story, and she loves showing it to everyone.",
                tl: "Ashley‘s mother",
                img: "/welcome/beloved-by-early-testers/ashley.png",
              },
              {
                desc: "Seeing my own child as the hero of the story is such a wonderful idea! I love how this book captures precious moments—I'll treasure it as a keepsake of all their milestones.",
                tl: "Luna‘s mother",
                img: "/welcome/beloved-by-early-testers/luna.png",
              },
              {
                desc: "This is the perfect gift for my grandson! The story is heartwarming, the illustrations are beautiful, and most importantly, my little cutie looks amazing in the book. I can't wait to create one for all of my grandkids！",
                tl: "Olivia‘s grandma",
                img: "/welcome/beloved-by-early-testers/olivia.png",
              },
            ].map(({ tl, desc, img }) => (
              <div className="bg-white" key={tl}>
                <div className="w-full relative aspect-square">
                  <DreamzeImage src={img} alt={tl} />
                  <p className="text-white font-bold text-2xl absolute z-10 bottom-0 w-full p-6 left-0">
                    {tl}
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-[#222222] font-light">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <Growth />
        </AnimatedSection>

        <AnimatedSection>
          <FAQWelcome />
        </AnimatedSection>

        <AnimatedSection>
          <ReserveSection
            cssClass={
              "text-white bg-[url(/welcome/reserve-banner/40-vip-discount.png)]"
            }
            title={"40% VIP Discount"}
            desc="Reserve now and secure our biggest deal before it's gone!"
          />
        </AnimatedSection>

        <AnimatedSection className="bg-pink-100 p-10">
          <p className="text-blue-700 text-center text-2xl font-bold">
            See Yourself in A Personalised Amazing Dream
          </p>
          <Image
            className="mx-auto"
            src={"/welcome/dreamaze-logo.png"}
            alt="Logo"
            width={200}
            height={70}
          />
        </AnimatedSection> */}
      </div>
    </main>
  );
}
