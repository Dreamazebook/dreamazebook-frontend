import Image from "next/image";
import { DREAMAZEBOOK_LOGO, VIP_PERK_FIRST_PICK, VIP_PERK_SAVE_40, VIP_PERK_UNLOCK_GIFT } from "@/constants/cdn";

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_28EaEW472grs7DQ7wP28800';

const LAUNCH_PERKS = [
  {
    tl: 'Save €18–€143 ',
    desc: `Exclusive savings for VIPs only`,
    icon:VIP_PERK_SAVE_40
  },
  {
    tl: 'Limited Original-Design Gift',
    desc: 'Like a hand-crafted bookmark, gift box, or unique keepsake.',
    icon:VIP_PERK_UNLOCK_GIFT
  },
  {
    tl: 'Back Early, Ship Early',
    desc: 'Enjoy early delivery on your order',
    icon:VIP_PERK_FIRST_PICK
  },
]

const BENEFITS = [
  {
    title: '100% Refund Guarantee',
    desc: 'Cancel anytime before production for a full refund',
  },
  {
    title: 'Transparent Updates',
    desc: "We'll keep you informed with regular updates throughout the campaign.",
  },
  {
    title: 'Secure Checkout',
    desc: 'All transactions are processed securely and comply with applicable payment regulations.',
  },
]

export default function Preorder() {
  return (
    <main 
     style={{'--hero-bg' : `url(/welcome/preorder/hero.png)`} as React.CSSProperties} 
     className="bg-white relative w-[430px] mx-auto">
      <Image className="absolute top-0 left-4 md:left-10 z-10" src={DREAMAZEBOOK_LOGO} alt="Logo" width={168} height={56} />


      <div className="w-full mx-auto text-center py-40 bg-(image:--hero-bg) bg-cover bg-no-repeat bg-center">
        <h1 className="text-[32px] font-bold">Just €1 For VIP Perks</h1>
        <h2 className="text-[32px] font-bold mb-5">Save Up To 40% & More</h2>
        <div className="space-y-[16px] bg-white/50 p-[24px] mx-[24px]">
        {LAUNCH_PERKS.map((perk)=>
          <article key={perk.tl} className="">
            <div className="flex items-center justify-center gap-1">
              <Image src={perk.icon} width={23} height={23} alt="Icon" />
              <h3 className="text-[16px] font-bold text-[#012DCE]">{perk.tl}</h3>
            </div>
            <p className="text-[16px] font-light text-[#222222]" >{perk.desc}</p>
          </article>
        )}


        <a href={STRIPE_PAYMENT_LINK} className="block bg-[#FFC023] text-white py-3 px-6 rounded mt-8 w-full mx-auto text-[16px] font-bold hover:bg-[#001e9c] transition-colors duration-200">Get My €1 VIP Access</a>
        </div>

      </div>


      <div className="flex flex-col items-center justify-center px-4 my-[64px]">
        <div className="text-center space-y-8">
          <h1 className="text-[32px] font-bold leading-tight">
            A Small Step Today,<br />A Big Gift Tomorrow
          </h1>

          <div className="space-y-3">
            <p className="text-[16px]">
              Just <span className="font-bold text-blue-600">€1 today</span> to lock in your VIP discount
            </p>
            <p className="text-[16px] text-gray-800">
              Books start from <span className="font-bold">€27</span>
            </p>
          </div>

          <div className="pt-[32px]">
            <img
              src="/welcome/preorder/big-gift.png"
              alt="Personalized children's books with Christmas decorations"
              className="w-full rounded"
            />
          </div>
        </div>
      </div>


      <div className="w-full text-center space-y-[44px] p-[24px]">
        {BENEFITS.map((b, idx) => (
          <div key={b.title} className="space-y-1">
            {idx === 0 ? (
              <h1 className="text-[26px] font-bold">{b.title}</h1>
            ) : (
              <h2 className="text-[26px] font-bold">{b.title}</h2>
            )}
            <p className="text-[16px] font-light">{b.desc}</p>
          </div>
        ))}

        <a href={STRIPE_PAYMENT_LINK} className="w-full block bg-[#FFC023] hover:bg-[#001e9c] font-bold text-[16px] py-3 px-6 transition-colors">
          Get My €1 VIP Access
        </a>
      </div>

    </main>
  );
}