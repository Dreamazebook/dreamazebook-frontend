import DreamzeImage from "@/app/components/DreamzeImage";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";
import { THE_ONLY_BOOK, THE_ONLY_BOOK_FEATURE, THE_ONLY_BOOK_FEATURE_APP, THE_ONLY_BOOK_GIF } from "@/constants/cdn";

export default function TheOnlyBook() {
  return (
    <Container cssClass="">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <ContainerTitle cssClass="mb-6">
          A Gift That Connects Hearts
        </ContainerTitle>
        <ContainerDesc cssClass="mb-3 md:mb-6">
          You can even add a personal dedication inside the book — making it a keepsake filled with love.
        </ContainerDesc>
        {/* <p className="font-bold text-[#222222] text-[16px] md:text-xl mb-8 md:mb-16 flex items-center gap-4 justify-center">
          <span>Dreamazebook is the best choice!</span>
          <Image src={STAR} width={18} height={18} className="md:w-[36px] md:h-[36px]" alt="Star" />
        </p> */}

        <video className="w-full hidden md:block" autoPlay loop muted src={THE_ONLY_BOOK} />
        <div className="md:hidden w-full relative aspect-[2/1]">
          <DreamzeImage src={THE_ONLY_BOOK_GIF} alt="Face swap" unoptimized={true} />
        </div>

        <div className="w-full relative aspect-[764/611] mt-3 md:mt-6">
          <DreamzeImage cssClass="md:hidden" src={THE_ONLY_BOOK_FEATURE_APP} alt="" />
          <DreamzeImage cssClass="hidden md:block" src={THE_ONLY_BOOK_FEATURE} alt="" />
        </div>

        {/* <div className="flex flex-col md:flex-row gap-3 md:gap-6 mt-3 md:mt-6">
          <div className="w-full md:w-2/3 relative aspect-square">
            <DreamzeImage src={THE_ONLY_BOOK_ISABELLA} alt="Lucas" />
          </div>
          <div className="w-full md:w-1/3 flex gap-4 flex-row md:flex-col">
            <div className="w-1/2 md:w-full relative aspect-square">
              <DreamzeImage src={THE_ONLY_BOOK_MELODY} alt="Melody" />
            </div>
            <div className="w-1/2 md:w-full relative aspect-square">
              <DreamzeImage src={THE_ONLY_BOOK_MIA} alt="Mia" />
            </div>
          </div>
        </div> */}

      </div>
    </Container>
  );
}