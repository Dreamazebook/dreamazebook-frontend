'use client';
import { useState } from "react";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";

interface Faq {
  tl:string,
  ans:string,
  show?:boolean
}

interface FAQProps {
  FAQs: Faq[]
  bg?: string
}

export default function FAQ({FAQs, bg}:FAQProps) {
  const [faqs, setFaqs] = useState(FAQs);
  const handleFaqClick = (idx:number) => {
    const newFAQs = [...FAQs];
    newFAQs.forEach((faq)=>{
      faq.show = false;
    })
    newFAQs[idx].show = true;
    setFaqs(newFAQs);
  }
  return (
    <Container cssClass={bg}>
      <ContainerTitle cssClassmb-16>FAQ</ContainerTitle>
      <div className="max-w-7xl mx-auto px-5">
        {faqs.map(({tl,ans,show},idx)=>
          <div key={tl} className="py-8 border-b border-black/20">
            <div className="flex justify-between items-center cursor-pointer" onClick={()=>handleFaqClick(idx)}>
              <h3 className="text-xl font-bold">{tl}</h3>
              <span className="cursor-pointer hover:scale-105 transition-transform">
                {show?
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 12H22.5" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                :
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 12H22.5" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22.5V1.5" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                }
              </span>
            </div>
            <p className={`font-light text-[#222222] ml-7 ${show?'block':'hidden'}`}>{ans}</p>
          </div>
        )}
      </div>
    </Container>
  )
}
