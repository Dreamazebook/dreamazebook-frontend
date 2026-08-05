import { PERSONALIZED_STORYBOOKS } from "@/constants/cdn";

export default function AStoryTheySeeThemselvesIn() {
  return (
    <section>
      <h2 className="self-stretch text-center justify-start text-black text-2xl md:text-4xl font-semibold leading-8 mb-6">A story they see themselves in.</h2>
      <img src={PERSONALIZED_STORYBOOKS('a-story-they-see-mobile.webp')} alt="a-story-they-see-mobile" className="w-full md:hidden" />
      <img src={PERSONALIZED_STORYBOOKS('a-story-they-see-desktop.webp')} alt="a-story-they-see-desktop" className="w-full hidden md:block max-w-7xl mx-auto" />
    </section>
  )
}
