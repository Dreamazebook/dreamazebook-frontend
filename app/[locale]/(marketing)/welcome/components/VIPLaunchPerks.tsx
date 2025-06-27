import DreamzeImage from "@/app/components/DreamzeImage"

const LAUNCH_PERKS = [
  {
    tl: 'Save 40%',
    desc: 'Our biggest discount ever —VIPs only.'
  },
  {
    tl: 'Limited Edition Gift',
    desc: 'An artsy surprise — a bookmark, a gift box, or something special.'
  },
  {
    tl: '1-Hour Early Access',
    desc: 'Shop early & ship early — VIPs don’t wait.'
  },
]

export default function VIPLauchPerks() {
  return (
    <div className="text-center bg-[#F5E3E3] p-6">
      <h1 className="text-[26px] font-bold">VIP Launch Perks</h1>
      <h2 className="text-[32px] font-bold mb-5">Just $1 to Unlock</h2>
      
      <div className="space-y-4 w-[255] mx-auto">
      {LAUNCH_PERKS.map((perk)=>
        <article>
          <h3 className="text-[16px] font-bold text-[#012DCE]">{perk.tl}</h3>
          <p className="text-[14px] font-light text-[#222222]">{perk.desc}</p>
        </article>
      )}
      </div>
    </div>
  )
}