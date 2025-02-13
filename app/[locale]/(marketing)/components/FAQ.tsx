import { useState } from "react";

const FAQs = [
  {
    tl:'01 How can I support Dreamaze on Kickstarter?',
    ans: 'Reserve your spot with just $1 to unlock the best discount and VIP access. Sign up now, and we’ll guide you through the next steps via email!',
    show:true
  },
  {
    tl:'02  What happens after I register?',
    ans: 'Reserve your spot with just $1 to unlock the best discount and VIP access. Sign up now, and we’ll guide you through the next steps via email!'
  },
  {
    tl:'03  When will my book be delivered if I back you on Kickstarter?',
    ans: 'Reserve your spot with just $1 to unlock the best discount and VIP access. Sign up now, and we’ll guide you through the next steps via email!'
  },
  {
    tl:'04  Can I make changes to my personalization after ordering?',
    ans: 'Reserve your spot with just $1 to unlock the best discount and VIP access. Sign up now, and we’ll guide you through the next steps via email!'
  },
];
export default function FAQ() {
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
    <section className="bg-gray-100 py-16">
    <h2 className="text-4xl text-center mb-10">FAQ</h2>
    <div className="max-w-2xl mx-auto px-5">
      {faqs.map(({tl,ans,show},idx)=>
        <div key={tl} className="mb-4 pb-3 border-b border-black/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">{tl}</h3>
            <span onClick={()=>handleFaqClick(idx)} className="cursor-pointer">{show?'-':'+'}</span>
          </div>
          <p className={`font-thin ml-7 ${show?'block':'hidden'}`}>{ans}</p>
        </div>
      )}
    </div>
    </section>
  )
}
