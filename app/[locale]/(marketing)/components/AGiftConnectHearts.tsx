import DreamzeImage from "@/app/components/DreamzeImage";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";
import { A_GIFT_CONNECT_HEARTS, THE_ONLY_BOOK, THE_ONLY_BOOK_FEATURE, THE_ONLY_BOOK_FEATURE_APP } from "@/constants/cdn";

export default function AGiftConnectHearts() {
  return (
    <Container cssClass="">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <ContainerTitle cssClass="mb-6">
          A Gift That Connects Hearts
        </ContainerTitle>
        <ContainerDesc cssClass="mb-3 md:mb-6">
          You can even add a personal dedication inside the book — making it a keepsake filled with love.
        </ContainerDesc>

        <div className="w-full relative aspect-[2/1]">
          <DreamzeImage src={A_GIFT_CONNECT_HEARTS} alt="Face swap" unoptimized={true} />
        </div>

        <div className="w-full relative aspect-[764/611] mt-3 md:mt-6">
          <DreamzeImage cssClass="md:hidden" src={THE_ONLY_BOOK_FEATURE_APP} alt="" />
          <DreamzeImage cssClass="hidden md:block" src={THE_ONLY_BOOK_FEATURE} alt="" />
        </div>

      </div>
    </Container>
  );
}