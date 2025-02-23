import { AnimatedSection } from "@/app/components/AnimatedSection";
import EmailForm from "./EmailForm";

export default function HeroBanner() {
  return (
    <div className="md:flex md:items-center md:bg-[url(/landing-page/desktop-cover.png)] bg-cover md:px-10 md:aspect-[2/1]">
      <AnimatedSection>
      <div className="md:container bg-[#F5E3E3] md:bg-transparent">
        <div className="gap-8 md:w-3/5 pt-20 md:pt-0 mb-5 bg-[url(/landing-page/cover.png)] bg-cover md:bg-none h-screen md:h-auto">
          {/* Hero Content */}
          <h1 className="text-3xl md:text-6xl font-bold text-black p-4 md:p-0">
          The Ultimate Personalized Books to Truly See Your Child
          </h1>
        </div>

        <div className='p-4 md:p-0 md:w-3/5 font-light'>
          <p>Imagine the joy on your child&apos;s face when they see themselves as the hero of their very own story. At Dreamaze, we create magical, personalized storybooks that inspire imagination, celebrate individuality, and strengthen family bonds.</p>
          <p className="mb-8">We&apos;re launching on Kickstarter soon—stay tuned!</p>

          <div className="text-center md:text-left flex flex-col gap-3 mb-4">
            <div className="flex flex-col md:flex-row gap-1 items-center">
              <h3 className="font-bold text-xl">Limited Spots Available</h3>
              <span className="hidden md:block font-light">—</span>
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
  )
}