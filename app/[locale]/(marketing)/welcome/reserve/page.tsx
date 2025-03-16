'use client';
import FAQReserve from "../../components/FAQReserve";
import { useEffect, useState } from "react";
import Popup from "../../components/Popup";
import Button from "@/app/components/Button";
import Previews from "../components/Previews";
import BookCovers from "../components/BookCovers";
import Footer from "../../components/Footer";
import { ContainerDesc } from "../../components/ContainerDesc";
import { ContainerTitle } from "../../components/ContainerTitle";
import Image from 'next/image';
import DreamzeImage from "@/app/components/DreamzeImage";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import { sendRequest } from "@/utils/hubspot";


const NEXT_PUBLIC_STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK

const PRICES = [
  {
     tl: 'Softcover',
     id: 'softcover',
     discount: '$35',
     price: '$59',
     desc: 'Light yet durable, this softcover edition offers a flexible and travel-friendly option'
  },
  {
    headerStyle:'bg-linear-to-r from-[#FF638A] from-20% to-[#FF2566] to-[100%] text-transparent bg-clip-text',
     header: 'Creator\'s Recommendation',
     headerImg: '/welcome/product-book/creator-recommendation.png',
     tl: 'Hardcover',
     id: 'hardcover',
     discount: '$45',
     price: '$75',
     desc: 'Premium hardcover with a smooth matte finish, designed for lasting reading and enjoyment.'
  },
  {
    headerStyle:'bg-linear-to-r from-[#FF638A] from-20% via-[#FF8383] via-46% via-[#867BFF] via-75% to-[#FF2566] to-[100%] text-transparent bg-clip-text',
     header: 'Most People\'s Choice',
     headerImg: '/welcome/product-book/most-people-choice.png',
     tl: 'Premium Lay-Flat Hardcover',
     id: 'lay-flat',
     discount: '$58',
     price: '$97',
     desc: 'Luxurious layflat design with seamless panoramic spreads—perfect for a lifelong keepsake gift.'
  },
];

export default function Reserve() {
  const [curBookCover, setCurBookCover] = useState(PRICES[1].id);
  const [showPopup, setShowPopup] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Empty useEffect - previously contained beforeunload event handler
    // that was commented out. Keeping the hook for potential future use.
  }, []);

  const handleCoverClick = async (tl: string) => {
    setCurBookCover(tl);
    await sendRequest({
      url: '/api/hubspot',
      method: 'PATCH',
      body: {
        selected_cover: tl,
        contactId: searchParams.get('contactId') || '',
      },
    });
  }

  const handlePayClick = async () => {
    await sendRequest({
      url: '/api/hubspot',
      method: 'PATCH',
      body: {
        prepaid_status: 'clicked',
        contactId: searchParams.get('contactId') || '',
      }
    })
  }


  return (
    <main className="bg-[#F8F8F8]">
      <Link href={'/'} className="block max-w-7xl mx-auto mb-5">
        <Image className="" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={168} height={56} />
      </Link>
      {showPopup &&
      <Popup
        handleCancel={setShowPopup}
        tl="Unlock a Premium Gift for You!"
        desc="Just a few quick questions will help us make your personalized book even more special and perfectly match your expectations. 💖"
        surveyTxt="Yes, serve a survey!"
        surveyLink="https://docs.google.com/forms/d/1w_H7VXx98p5dFTz9nkFOL0GNyozIZAoA6rPm63ZWMgY/viewform?edit_requested=true"
        cancelTxt="It’s OK, you’ll nail it!"
      />}

      <div className="container mx-auto lg:flex">
        <div className="lg:w-1/2">
          <BookCovers curbook={curBookCover} />
        </div>

        <div className="p-6 lg:p-20 w-full lg:w-1/2 text-[#222222] lg:sticky top-0 lg:h-screen overflow-y-auto">
          <ContainerTitle cssClass="text-left">Reserve Your Special Discount</ContainerTitle>
          <ContainerDesc cssClass="text-left my-4">Choose your preferred format and reserve the lowest price ever.</ContainerDesc>
          
          <div className="my-5 md:my-9 flex flex-col gap-3">
          {PRICES.map(({price,discount,tl,desc,header,headerImg,id}) => (
            <article onClick={()=>handleCoverClick(id)} key={id} className={`transition-all overflow-hidden rounded border ${curBookCover===id?'border-[#022CCE]':'border-transparent'}`}>
              {headerImg && 
                <div className="from-[#FFE5E5] to-[#FFF4F4] bg-linear-to-r">
                {/* <h2 className={`font-semibold text-xl px-6 py-3 ${headerStyle}`}>{header}</h2> */}
                <Image className="" src={headerImg} alt={header} width={340} height={72} />
                </div>
              }
              <div className={`${curBookCover === id ? 'bg-[#FFFBF3]' : 'bg-white'} px-6 pt-3 pb-4 transition-all`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl transition-all ${curBookCover==id?'font-bold':'font-light'}`}>{tl}</h2>
                  <div className="flex items-center gap-4">
                    <span className={`${curBookCover==id?'text-black':'text-[#012CCE]'} font-bold transition-all`}>{discount}</span>
                    <span className="line-through text-[#999999]">{price}</span>
                  </div>
                </div>
                <span className="mt-3 text-xl font-light text-[#999999]">{desc}</span>
              </div>
            </article>
          ))}
          </div>

          <Button tl={'Reserve Discount for $1'} url={NEXT_PUBLIC_STRIPE_PAYMENT_LINK} handleClick={handlePayClick} />
          <button onClick={()=>setShowPopup(true)} className="cursor-pointer w-full p-3 text-center mt-3">No thanks</button>
        </div>

      </div>

      <FAQReserve />

      <Previews />

      <section className="pt-6 pb-6 bg-white">
        <div className="container flex flex-col md:flex-row justify-center mx-auto gap-5 items-center">
          <p className="text-[#222222] font-light text-sm md:text-[28px] text-center">“More magical stories are coming<br/>
          Join as a VIP and help spark ideas for our next books”</p>
          <div className="relative w-[160px] aspect-[133/100] mx-auto md:mx-0">
            <DreamzeImage src="/welcome/more-magic.webp" alt="More Magic" />
          </div>
        </div>
      </section>

      <Footer />

    </main>
  )
}