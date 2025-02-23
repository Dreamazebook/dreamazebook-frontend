import DreamzeImage from "@/app/components/DreamzeImage";
import Image from 'next/image';
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { ContainerDesc } from "./ContainerDesc";

export default function TheOnlyBook() {
  return (
    <Container cssClass="bg-blue-50">
      <div className="container mx-auto px-4 text-center">
        <ContainerTitle cssClass="mb-6 leading-15">
          The Only Book<br/>Where You Are <span className="text-[#022CCE]">Truly Seen</span>
        </ContainerTitle>
        <ContainerDesc cssClass="mb-6">
          If you want to personalize a book that truly reflects your loved ones, not generic avatars but their real name, image, and uniqueness
        </ContainerDesc>
        <p className="font-bold text-[#222222] text-xl mb-8 md:mb-16 flex items-center gap-4 justify-center">
          <span>Dreamazebook is the best choice!</span>
          <Image src='/welcome/the-only-book/star.png' width={36} height={36} alt="Star" />
        </p>

        <video autoPlay loop muted src="/welcome/the-only-book/video.mp4" />

        <div className="flex flex-col md:flex-row gap-3 md:gap-6 mt-3 md:mt-6">
          <div className="w-full md:w-2/3 relative aspect-square">
            <DreamzeImage src="/welcome/the-only-book/lucas.png" alt="Lucas" />
          </div>
          <div className="w-full md:w-1/3 flex gap-4 flex-row md:flex-col">
            <div className="w-1/2 md:w-full relative aspect-square">
              <DreamzeImage src="/welcome/the-only-book/melody.png" alt="Melody" />
            </div>
            <div className="w-1/2 md:w-full relative aspect-square">
              <DreamzeImage src="/welcome/the-only-book/mia.png" alt="Mia" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}