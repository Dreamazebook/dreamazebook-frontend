import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";
import { DEEPLY_MEANINGFUL_STEP, DEEPLY_MEANINGFUL_STEP_VIDEO, DEEPLY_MEANINGFULL_BG } from "@/constants/cdn";
import { useRef } from "react";

export default function EffortlessGifting() {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <Container cssClass="bg-[#F8F8F8]">
      <div className="container mx-auto px-4">
        <ContainerTitle cssClass="mb-6">
          Deeply Meaningful <br/> Yet <span className="text-[#022CCE]">Surprisingly</span> Simple
        </ContainerTitle>
        <ContainerDesc cssClass="mb-16">
        With just a few clicks, create a gift no one else has
        </ContainerDesc>

        <div className="w-full bg-cover py-3" style={{backgroundImage:`url(${DEEPLY_MEANINGFULL_BG})`}}>
        <video 
          ref={videoRef}
          className="mx-auto w-[130px] md:w-[310px]" 
          loop 
          controls 
          src={DEEPLY_MEANINGFUL_STEP_VIDEO} 
          poster={DEEPLY_MEANINGFUL_STEP}
          onPlay={() => {
            if (videoRef.current) {
              videoRef.current.requestFullscreen().catch(err => {
                console.error('full screen error:', err);
              });
            }
          }}
        />
        </div>
        
        {/* <div className="max-w-5xl mx-auto md:flex hidden flex-col gap-6 mb-32">
          <div className="flex gap-6">
            <div className="w-1/3 relative aspect-[4/3]">
              <DreamzeImage src={DEEPLY_MEANINGFUL_MELODY} alt="Lucas" />
            </div>
            <div className="w-1/3 relative aspect-[4/3]">
              <DreamzeImage src={DEEPLY_MEANINGFUL_JAMES} alt="Lucas" />
            </div>
            <div className="w-1/3 relative aspect-[4/3]">
              <DreamzeImage src={DEEPLY_MEANINGFUL_DREAMAZE} alt="Lucas" />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-2/3 relative aspect-[4/3]">
              <DreamzeImage src={DEEPLY_MEANINGFUL_MAIN} alt="Lucas" />
            </div>
            <div className="w-1/3 relative aspect-[1/2]">
              <DreamzeImage src={DEEPLY_MEANINGFUL_DORE} alt="Lucas" />
            </div>
          </div>

        </div>

        <div className="max-w-5xl mx-auto flex md:hidden flex-col gap-6 mb-32">
          <div className="w-full relative aspect-square">
            <DreamzeImage src={DEEPLY_MEANINGFUL_MAIN} alt="Lucas" />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2 flex flex-col gap-4">
              <div className="relative aspect-[4/3] w-full">
                <DreamzeImage src={DEEPLY_MEANINGFUL_MELODY} alt="Lucas" />
              </div>
              <div className="relative aspect-[4/3] w-full">
                <DreamzeImage src={DEEPLY_MEANINGFUL_DREAMAZE} alt="Lucas" />
              </div>
            </div>
            <div className="w-1/2 relative">
              <DreamzeImage src={DEEPLY_MEANINGFUL_DORE} alt="Lucas" />
            </div>
          </div>
        </div> */}

      </div>
      

      {/* Easy Steps Section */}
      {/* <div className="container mx-auto px-4">
        <h2 className="text-[28px] text-[#222222] font-bold text-center mb-16">Easy 3 Steps to Get Your Book</h2>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {tl:'01 Personalize It',desc:"Add the hero's name, upload a photo, and make a few fun choices—it's that easy!"},
            {tl:'02 Preview & Confirm',desc:"Take a peek at your book and give it a thumbs-up."},
            {tl:'03 Receive & Enjoy',desc:"Sit back and get ready for a one-of-a-kind gift to arrive at your door!"}
          ].map(({tl,desc})=>
          <div key={tl} className="text-center">
            <h3 className="text-[28px] font-bold mb-4 text-[#022CCE]">{tl}</h3>
            <p className="text-[#000000] text-xl font-light">{desc}</p>
          </div>
          )}
        </div>

      </div> */}

    </Container>
  )
}