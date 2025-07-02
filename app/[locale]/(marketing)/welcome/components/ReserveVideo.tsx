import DreamzeImage from "@/app/components/DreamzeImage";
import {
  RESERVE_AVATARS,
  RESERVE_VIDEO,
  RESERVE_VIDEO_BG,
} from "@/constants/cdn";
import { useRef } from "react";

export default function ReserveVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <section className="bg-[#F5F1ED] text-center text-[#222222] p-6">
      <div className="flex items-center justify-center gap-2 mb-5">
        <div className="relative w-[63px] h-[21px]">
          <DreamzeImage src={RESERVE_AVATARS} alt="Avatars" />
        </div>
        <p className="text-[16px] font-light">300+ reserved—going fast！</p>
      </div>

      <h2 className="font-bold text-[21px] mb-3">
        The Book That Holds Their Childhood
      </h2>
      <p className="text-[14px] font-light">
        Crafted with premium materials and made to last, From tiny moments to
        big milestones, It’s more than a story. It’s their story.
      </p>

      <video
        className="w-full mt-6 aspect-[430/290]"
        ref={videoRef}
        muted
        src={RESERVE_VIDEO}
        controls
        poster={RESERVE_VIDEO_BG}
        onPlay={() => {
          if (videoRef.current) {
            videoRef.current.requestFullscreen().catch((err) => {
              console.error("full screen error:", err);
            });
          }
        }}
      />
    </section>
  );
}
