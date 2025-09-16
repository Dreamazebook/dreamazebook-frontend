import EmailForm from "./EmailForm";
import { COUNTDOWN_BANNER } from "@/constants/cdn";
import { useState } from "react";
import CountdownTimer from "../welcome/components/CountdownTimer";

export default function CountdownBanner() {
  const [hideForm, setHideForm] = useState(false);
  return (
    <div
      style={{'--desktop-bg' : `url(${COUNTDOWN_BANNER})`,'--app-bg' : `url(${COUNTDOWN_BANNER})`} as React.CSSProperties} 
      className="bg-(image:--app-bg) md:bg-(image:--desktop-bg) bg-cover md:bg-contain bg-no-repeat md:px-10 md:aspect-[1601/721] h-screen md:h-auto relative text-[#222]">
      <div className="md:max-w-[1024px] mx-auto flex flex-col justify-center">
        <div className="pt-20 md:pt-0 mb-5">
          {/* Hero Content */}
          <h1 className="text-4xl md:text-6xl p-4 md:p-0 capitalize text-center">
          Your Child<br/><span className="font-bold">The Star Of The Story</span>
          </h1>
          <p className="p-4 md:p-0 md:mt-4 text-center font-light">Ultimate personalized books with your child’s real face & name & uniqueness.</p>
          <CountdownTimer 
            targetDate={new Date('2025-09-23T08:00:00.000Z')} 
            onComplete={()=>{}}
          />
        </div>

        <div className='p-4 max-w-[528px] bg-white/75 text-center absolute bottom-1 left-1 right-1 mx-auto md:static'>
          {!hideForm && <h3 className="mb-4 font-bold text-[24px]"> Day 1 Exclusive<br/>300 Spots • 40% OFF</h3>}

          <div className="max-w-lg">
            <EmailForm btnId="email_submit_header" btnText="Sign Up & Don't Miss Out" redirectUrl={'/en/welcome/success'} handleCallBack={()=>setHideForm(true)} />
          </div>
        </div>

      </div>
    </div>
  )
}