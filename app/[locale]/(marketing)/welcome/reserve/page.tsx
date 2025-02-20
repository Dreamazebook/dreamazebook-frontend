'use client';
import FAQReserve from "../../components/FAQReserve";
import { useState } from "react";
import Popup from "../../components/Popup";
import Button from "@/app/components/Button";
import Previews from "../components/Previews";
import BookCovers from "../components/BookCovers";

const PRICES = [
  {
    bg:'bg-white',
     tl: 'Softcover',
     discount: '$35',
     price: '$59',
     desc: 'Light yet durable, this softcover edition offers a flexible and travel-friendly option'
  },
  {
    headerStyle:'bg-linear-to-r from-[#FF638A] from-20% to-[#FF2566] to-[100%] text-transparent bg-clip-text',
     header: 'Creator\'s Recommendation',
    bg:'bg-[#FFFBF3]',
     tl: 'Hardcover',
     discount: '$45',
     price: '$75',
     desc: 'Premium hardcover with a smooth matte finish, designed for lasting reading and enjoyment.'
  },
  {
    headerStyle:'bg-linear-to-r from-[#FF638A] from-20% via-[#FF8383] via-46% via-[#867BFF] via-75% to-[#FF2566] to-[100%] text-transparent bg-clip-text',
     header: 'Most People\'s Choice',
     bg:'bg-white',
     tl: 'Premium Lay-Flat Hardcover',
     discount: '$58',
     price: '$97',
     desc: 'Luxurious layflat design with seamless panoramic spreads—perfect for a lifelong keepsake gift.'
  },
];

export default function Reserve() {
  const [curPrice, setCurPrice] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  return (
    <main className="bg-[#F8F8F8]">

      {showPopup &&
      <Popup
        handleCancel={setShowPopup}
        tl="Unlock a Premium Gift for You!"
        desc="Just a few quick questions will help us make your personalized book even more special and perfectly match your expectations. 💖"
        surveyTxt="Yes, serve a survey!"
        surveyLink="https://docs.google.com/forms/d/e/1FAIpQLSf_vXsRvJgZGvD-munfborQT39pkdB-Eh3NSi3XcA8MyyqZKA/viewform?embedded=true"
        cancelTxt="It’s OK, you’ll nail it!"
      />}

      <div className="w-full md:flex">
        <div className="md:w-1/2">
          <BookCovers />
        </div>

        <div className="p-6 md:p-20 w-full md:w-1/2">
          <h1 className="text-3xl font-bold">Reserve Your Special Discount</h1>
          <p className="my-4">Choose your preferred format and reserve the lowest price ever.</p>
          
          {PRICES.map(({price,discount,tl,desc,header,headerStyle,bg}) => (
            <article onClick={()=>setCurPrice(tl)} key={tl} className={`mb-3 rounded border ${curPrice===tl?'border-[#012CCE]':'border-transparent'}`}>
              {header && 
                <div className="from-[#FFE5E5] to-[#FFF4F4] bg-linear-to-r">
                <h2 className={`font-semibold py-2 px-4 ${headerStyle}`}>{header}</h2>
                </div>
              }
              <div className={`${bg} p-4`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{tl}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-[#012CCE] font-bold">{discount}</span>
                    <span className="line-through text-[#999999]">{price}</span>
                  </div>
                </div>
                <span className="mt-3 text-xl text-[#999999]">{desc}</span>
              </div>
            </article>
          ))}

          {/* <a href="https://app.hubspot.com/payments/purchase/hscs_Cz0UnuV7mHso8hvrwi3Q1dAL8gOC32F4r4UDwyURd2kbJvopCinbXis9o2aQM245" className="cursor-pointer w-full block text-center bg-blue-700 text-white p-3 rounded-sm uppercase">Reserve Discount for $1</a> */}
          <Button tl={'Reserve Discount for $1'} url="https://app.hubspot.com/payments/ZzxZb6v2p4?referrer=PAYMENT_LINK" />
          <button onClick={()=>setShowPopup(true)} className="cursor-pointer w-full p-3 text-center mt-3">No thanks</button>
        </div>

      </div>

      <FAQReserve />

      <Previews />

    </main>
  )
}