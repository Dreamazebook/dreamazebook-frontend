import EmailForm from "./EmailForm";
import { APP_HERO_COVER, DESKTOP_HERO_COVER } from "@/constants/cdn";
import { useState } from "react";

export default function HeroBanner() {
  const [hideForm, setHideForm] = useState(false);
  return (
    <div
      style={{'--desktop-bg' : `url(${DESKTOP_HERO_COVER})`,'--app-bg' : `url(${APP_HERO_COVER})`} as React.CSSProperties} 
      className="md:flex md:items-center bg-(image:--app-bg) md:bg-(image:--desktop-bg) bg-cover md:bg-contain bg-no-repeat md:px-10 md:aspect-[1601/721] h-screen md:h-auto relative">
      <div className="md:max-w-[1024px]">
        <div className="md:w-4/5 pt-20 md:pt-0 mb-5">
          {/* Hero Content */}
          <h1 className="text-4xl md:text-6xl font-bold text-black p-4 md:p-0 capitalize">
          Personalized Books with Your Child as the Star
          </h1>
          <p className="p-4 md:p-0 md:mt-4 w-2/3 md:w-auto">Turn your child’s real face, name, and personality into a one-of-a-kind story—no more generic avatars.</p>
        </div>

        <div className='p-4 m-4 md:m-0 max-w-[528px] bg-white/75 text-center absolute bottom-2 left-1 right-1 md:static'>
          {!hideForm && <h3 className="mb-4 font-bold text-[24px]">Reserve a <span className="text-[#012DCE]">Timeless Gift</span> for Your Child !</h3>}

          <div className="max-w-lg">
            <EmailForm btnText="Sign up and Save 40%" redirectUrl={'/en/welcome/success-1'} handleCallBack={()=>setHideForm(true)} />
          </div>

          {/* {!hideForm &&
          <div className="flex items-center gap-4 justify-center mt-2">
            <div className="relative w-[114px] md:w-[156px] aspect-[19/4]">
              <DreamzeImage src={EMAIL_AVATARS} alt="Email Subscribers" />
            </div>
            <p className="text-[#222222] text-nowrap">800+ people have reserved</p>
          </div>
          } */}
          <p className="font-bold text-[14px] md:text-xl text-[#04CF78] mt-4">launching soon on Kickstarter</p>
        </div>

      </div>
    </div>
  )
}