// import Image from "next/image";
import { RESERVE_HEADER_BG_FULL } from "@/constants/cdn"

// const LAUNCH_PERKS = [
//   {
//     tl: 'Save 40%',
//     desc: `Our biggest discount ever — <span className="font-bold">VIPs only.</span>`,
//     icon:VIP_PERK_SAVE_40
//   },
//   {
//     tl: 'Limited Edition Gift',
//     desc: 'An artsy surprise — a bookmark, a gift box, or something special.',
//     icon:VIP_PERK_UNLOCK_GIFT
//   },
//   {
//     tl: '1-Hour Early Access',
//     desc: 'Shop early & ship early — VIPs don’t wait.',
//     icon:VIP_PERK_FIRST_PICK
//   },
// ]

export default function VIPLauchPerks() {
  return (
    <div
      style={{'--desktop-bg' : `url(${RESERVE_HEADER_BG_FULL})`,'--app-bg' : `url(${RESERVE_HEADER_BG_FULL})`} as React.CSSProperties} 
      className="text-center bg-[#F5E3E3] aspect-[430/427] pt-5">
      <div className="w-full mx-auto bg-(image:--app-bg) bg-cover bg-no-repeat bg-center aspect-[430/427]">
        {/* <h1 className="text-[26px] font-bold">VIP Launch Perks</h1>
        <h2 className="text-[32px] font-bold mb-5">Just $1 to Unlock</h2>
        <div className="space-y-4 ">
        {LAUNCH_PERKS.map((perk)=>
          <article key={perk.tl} className="w-[260px] mx-auto">
            <div className="flex items-center justify-center gap-3">
              <Image src={perk.icon} width={23} height={23} alt="Icon" />
              <h3 className="text-[16px] font-bold text-[#012DCE]">{perk.tl}</h3>
            </div>
            <p className="text-[14px] font-light text-[#222222]" dangerouslySetInnerHTML={{__html:perk.desc}}></p>
          </article>
        )}
        </div> */}
      </div>
    </div>
  )
}