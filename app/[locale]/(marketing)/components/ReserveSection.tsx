import React, { useState } from "react";
import EmailForm from "./EmailForm"

interface ReserveSectionProps {
  title: string | TrustedHTML
  desc: string | TrustedHTML
  style?: React.CSSProperties
  cssClass?: string,
  btnText?: string,
  redirectUrl?: string,
}

export default function ReserveSection({title,desc,style,cssClass,btnText,redirectUrl}:ReserveSectionProps) {
  const [show, setShow] = useState(true);
  const handleCallBack = () => {
    setShow(false);
  }
  
  return (
    <section style={style} className={`py-16 px-5 text-center bg-no-repeat bg-cover ${cssClass}`}>
      {show&&
      <>
        <h2 className="text-2xl md:text-[40px] font-bold" dangerouslySetInnerHTML={{__html: title}}></h2>
        <p className="text-[20px] font-light" dangerouslySetInnerHTML={{__html:desc}}></p>
      </>
      }
      <div className="max-w-lg mx-auto mt-6">
        <EmailForm btnText={btnText} handleCallBack={handleCallBack} redirectUrl={redirectUrl} />
      </div>
    </section>
  )
}