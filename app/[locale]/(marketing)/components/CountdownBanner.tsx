import Button from "@/app/components/Button";
import { COUNTDOWN_BANNER, VIP_PERK_FIRST_PICK, VIP_PERK_SAVE_40, VIP_PERK_UNLOCK_GIFT } from "@/constants/cdn";
import Image from "next/image";
import { KICKSTARTER_URL } from "@/constants/links";

const SUPPORT_FEATURES = [
  {
    tl:'Save up to 40%',
    desc: 'Our biggest discount ever .',
    label: 'VIP Launch Coupon',
    icon:VIP_PERK_SAVE_40
  },
  {
    tl:'Limited Original-Design Gift',
    desc:'Like a hand-crafted bookmark, gift box, or unique keepsake.',
    label: 'Secret Gift Ticket',
    icon:VIP_PERK_UNLOCK_GIFT
  },
  {
    tl:'Back Early, Ship Early',
    desc:'Rceive before the big holidays.',
    label: 'Priority Access Ticket',
    icon:VIP_PERK_FIRST_PICK
  },
];

export default function CountdownBanner() {
  return (
    <div
      style={{'--desktop-bg' : `url(${COUNTDOWN_BANNER})`,'--app-bg' : `url(${COUNTDOWN_BANNER})`} as React.CSSProperties} 
      className="bg-(image:--app-bg) md:bg-(image:--desktop-bg) bg-cover md:bg-contain bg-no-repeat md:px-10 md:aspect-[1601/721] relative text-[#222]">
      <div className="md:max-w-[1024px] mx-auto flex flex-col justify-center">
        <div className="pt-20 md:pt-0 mb-5">
          {/* Hero Content */}
          <h1 className="text-4xl md:text-6xl p-4 md:p-0 capitalize text-center">
          Your Child<br/><span className="font-bold">The Star Of The Story</span>
          </h1>
          <p className="p-4 md:p-0 md:mt-4 text-center font-light">Ultimate personalized books with your child’s real face & name & uniqueness.</p>
          
          <div className="bg-white p-8 space-y-4 m-4">
            {SUPPORT_FEATURES.map(({tl,desc,icon})=>
            <article key={tl} className="text-center">
              <div className="flex justify-center gap-3 items-center">
                <Image src={icon} width={21} height={21} alt={tl} />
                <h4 className="text-[16px] text-[#012DEC] font-bold">{tl}</h4>
              </div>
              <p className="text-[#222] font-light text-[16px]">{desc}</p>
            </article>
            )}

            <Button url={KICKSTARTER_URL} tl={'I’m ready to support on Kickstarter'} />
          </div>

          <div className="text-center text-[16px] text-black mt-8">
            <p>New to Kickstarter?</p>
            <p>Scroll down to see how it works.</p>
          </div>

        </div>

      </div>
    </div>
  )
}