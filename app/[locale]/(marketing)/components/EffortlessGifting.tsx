import DreamzeImage from "@/app/components/DreamzeImage";

export default function EffortlessGifting() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-8">Effortless Gifting<br/> With <span className="text-blue-500">Maximum</span> Impact</h2>
        <p className="text-lg text-center text-gray-700 mb-10 max-w-4xl mx-auto font-light">
          Create the perfect personalized storybook with just a few clicks—choose a design, upload a photo, and you’re done. It’s a thoughtful gift without the hassle.
        </p>
        
        <div className="container mx-auto flex flex-col gap-4">
          <div className="w-full relative aspect-square">
            <DreamzeImage src="/welcome/effortless-gifting/main.png" alt="Lucas" />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2 flex flex-col gap-4">
              <div className="relative aspect-square w-full">
                <DreamzeImage src="/welcome/effortless-gifting/melody.png" alt="Lucas" />
              </div>
              <div className="relative aspect-square w-full">
                <DreamzeImage src="/welcome/effortless-gifting/dreamaze.png" alt="Lucas" />
              </div>
            </div>
            <div className="w-1/2 relative">
              <DreamzeImage src="/welcome/effortless-gifting/dore.png" alt="Lucas" />
            </div>
          </div>
        </div>

      </div>
      

      {/* Easy Steps Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-16">Easy 3 Steps to Get Your Book</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {tl:'01 Personalize It',desc:"Add the hero's name, upload a photo, and make a few fun choices—it's that easy!"},
            {tl:'02 Preview & Confirm',desc:"Take a peek at your book and give it a thumbs-up."},
            {tl:'03 Receive & Enjoy',desc:"Sit back and get ready for a one-of-a-kind gift to arrive at your door!"}
          ].map(({tl,desc})=>
          <div key={tl} className="text-center">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">{tl}</h3>
            <p className="text-[#000000] font-light">{desc}</p>
          </div>
          )}
        </div>
      </div>

    </div>
  )
}