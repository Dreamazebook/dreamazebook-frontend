import { AnimatedSection } from "@/app/components/AnimatedSection";
import EmailForm from "./EmailForm";
import DreamzeImage from "@/app/components/DreamzeImage";
import { APP_HERO_COVER, DESKTOP_HERO_COVER, EMAIL_AVATARS } from "@/constants/cdn";

export default function HeroBanner() {
  return (
    <div style={{'--desktop-bg' : `url(${DESKTOP_HERO_COVER})`} as React.CSSProperties} className="md:flex md:items-center md:bg-(image:--desktop-bg) bg-cover md:px-10 md:aspect-[2/1]">
      <AnimatedSection>
      <div className="md:container bg-[#F5E3E3] md:bg-transparent">
        <div style={{'--app-bg' : `url(${APP_HERO_COVER})`} as React.CSSProperties} className="gap-8 md:w-4/5 pt-20 md:pt-0 mb-5 bg-(image:--app-bg) bg-cover md:bg-none h-screen md:h-auto">
          {/* Hero Content */}
          <h1 className="text-3xl md:text-6xl font-bold text-black p-4 md:p-0">
          The Ultimate Personalized Books to Truly See Your Child
          </h1>
        </div>

        <div className='p-4 md:p-0 md:w-4/5 font-light'>
          <p>Imagine the joy on your child&apos;s face when they see themselves as the hero of their very own story. At Dreamaze, we create magical, personalized storybooks that inspire imagination, celebrate individuality, and strengthen family bonds.</p>
          <p className="mb-8">We&apos;re launching on Kickstarter soon—stay tuned!</p>

          <div className="text-center md:text-left flex flex-col gap-3 mb-4">
            <div className="flex flex-col md:flex-row gap-1 items-center">
              <h3 className="font-bold text-xl">Reserve a Gift That Will Last a Lifetime</h3>
              <span className="hidden md:block font-light">—</span>
              <p className="">Spots are limited! Be among the first to create a one-of-a-kind book</p>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="relative w-[114px] md:w-[156px] aspect-[19/4]">
                <DreamzeImage src={EMAIL_AVATARS} alt="Email Subscribers" />
              </div>
              <p className="text-[#222222]">800+ people have reserved</p>
            </div>
          </div>

          <div className="max-w-lg">
            <EmailForm btnText="Get Launch Updates" redirectUrl={'/en/welcome/success-1'} />
          </div>

        </div>
      </div>
      </AnimatedSection>
    </div>
  )
}