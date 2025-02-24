import { useState } from "react";
import EmailForm from "./EmailForm"

interface ReserveSectionProps {
  title: string
  desc: string
  cssClass?: string,
  btnText?: string,
}

export default function ReserveSection({title,desc,cssClass,btnText}:ReserveSectionProps) {
  const [show, setShow] = useState(true);
  const handleCallBack = () => {
    setShow(false);
  }
  
  return (
    <section className={`py-16 px-5 text-center bg-no-repeat bg-cover ${cssClass}`}>
      {show&&
      <>
        <h2 className="text-2xl md:text-[40px] font-bold">{title}</h2>
        <p className="text-[20px] font-light">{desc}</p>
      </>
      }
      <div className="max-w-lg mx-auto mt-6">
        <EmailForm btnText={btnText} handleCallBack={handleCallBack} />
      </div>
    </section>
  )
}