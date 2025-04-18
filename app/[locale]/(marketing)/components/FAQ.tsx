'use client';
import { ReactElement, useState } from "react";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";

interface Faq {
  tl:string,
  ans:string | ReactElement,
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
    newFAQs.forEach((faq, i)=>{
      if (i === idx) {
        faq.show = !faq.show;
      } else {
        faq.show = false;
      }
    })
    newFAQs[idx].show = true;
    setFaqs(newFAQs);
  }
  return (
    <Container cssClass={bg}>
      <ContainerTitle >FAQ</ContainerTitle>
      <div className="max-w-7xl mx-auto px-5">
        {faqs.map(({tl,ans,show},idx)=>
          <div key={tl} className="py-[18px] border-b border-black/20 flex">
            <div className="text-[18px] md:text-[28px] font-bold mr-3">0{idx+1}</div>
            <div className="flex-1">
              <div className="flex justify-between cursor-pointer mb-4" onClick={()=>handleFaqClick(idx)}>
                <h3 className="text-[18px] md:text-[28px] font-bold">{tl}</h3>
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
              <p className={`font-light text-[#222222] text-[16px] md:text-[20px] transition-all overflow-hidden ${show?'h-(calc-size(auto))':'h-0'}`}>{ans}</p>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
