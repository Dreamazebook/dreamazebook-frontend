import { PERSONALIZED_STORYBOOKS } from "@/constants/cdn";

export default function PersonalizedBookSection() {
  return (
    <section className="w-full bg-white">
      <img src={PERSONALIZED_STORYBOOKS('our-standard-mobile.png')} alt="our-standard-mobile" className="w-full md:hidden" />
      <img src={PERSONALIZED_STORYBOOKS('our-standard-desktop.png')} alt="our-standard-desktop" className="w-full hidden md:block max-w-7xl mx-auto" />
    </section>
  );
}
