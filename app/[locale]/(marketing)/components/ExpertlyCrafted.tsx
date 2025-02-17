import DreamzeImage from "@/app/components/DreamzeImage";

export default function ExpertlyCrafted() {
  return (
    <div className="bg-pink-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-8">Expertly Crafted<br/>And <span className="text-blue-500">Beautifully</span> Illustrated</h2>
        <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl mx-auto">
        Every book is thoughtfully written by professional educators and features exclusive hand-drawn art It’s a one-of-a-kind keepsake made with care and love.
        </p>
        
        <div className="max-w-4xl relative aspect-[4/1] mx-auto">
          <DreamzeImage src="/welcome/expertly-crafted/draft.png" alt="Dreamazebook" cssClass="transition-opacity animation-opacity z-10 hover:hidden hover:animation-none" />
          <DreamzeImage src="/welcome/expertly-crafted/done.png" alt="Dreamazebook" />
        </div>

        <video className="w-full mt-5" src="/welcome/expertly-crafted/video.mp4" autoPlay controls loop />

      </div>
    </div>
  )
}