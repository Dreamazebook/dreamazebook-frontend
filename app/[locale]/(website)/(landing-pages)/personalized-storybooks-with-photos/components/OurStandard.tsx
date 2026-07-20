import { PERSONALIZED_STORYBOOKS } from "@/constants/cdn";

const features = [
  {
    id: 1,
    title: "Story first",
    description: "A thoughtful story world, planned with warmth and flow.",
    imageAlt: "Story storyboard on a tablet",
    src: PERSONALIZED_STORYBOOKS('ourstandard-1.webp'),
  },
  {
    id: 2,
    title: "Artist-drawn illustrations",
    description: "Gentle scenes shaped page by page, not generated in pieces.",
    imageAlt: "Father and daughter reading together",
    src: PERSONALIZED_STORYBOOKS('ourstandard-2.webp'),
  },
  {
    id: 3,
    title: "Photo woven in",
    description: "Your child becomes the heart of the story",
    imageAlt: "Photo to illustration transformation",
    src: PERSONALIZED_STORYBOOKS('ourstandard-3.webp'),
  },
  {
    id: 4,
    title: "Made to keep",
    description: "A beautiful keepsake to read, gift, and treasure for years.",
    imageAlt: "Personalized book cover",
    src: PERSONALIZED_STORYBOOKS('ourstandard-4.webp'),
  },
];

// Dashed arrow SVG for desktop
function DashedArrow() {
  return (
    <svg
      className="absolute top-[88px] left-[60px] right-0 w-[calc(100%-120px)] h-20 pointer-events-none"
      viewBox="0 0 900 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 60 C200 60, 300 10, 450 20 S700 50, 900 15"
        stroke="#a5b4fc"
        strokeWidth="2.5"
        strokeDasharray="10 8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M880 8 L900 15 L878 22"
        stroke="#a5b4fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function OurStandard() {
  return (
    <section className="w-full font-sans">
      {/* ── MOBILE ── */}
      <div className="md:hidden bg-[#fdf9f6] px-5 py-10">
        <h2 className="text-[1.65rem] font-bold text-gray-900 text-center leading-tight mb-10">
          Our standard
          <br />
          for a truly personalized book
        </h2>

        <div className="flex flex-col gap-10">
          {features.map((f) => (
            <div key={f.id} className="flex flex-col gap-4">
              <img
                src={f.src}
                alt={f.imageAlt}
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
              <div className="text-center px-2">
                <p className="font-bold text-gray-900 text-base mb-1">{f.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-[#fdf9f6] via-[#f5f0fb] to-[#fdf6ee] min-h-[660px]">
        {/* Background watermark mountain-like shape */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <svg
            className="absolute bottom-0 left-0 w-full opacity-[0.07]"
            viewBox="0 0 1440 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0 300 L360 80 L720 200 L1080 40 L1440 160 L1440 300 Z" fill="#7c6fa0" />
          </svg>
        </div>

        <div className="relative max-w-[1280px] mx-auto px-12 pt-14 pb-16">
          {/* Header */}
          <h2 className="text-[2.6rem] font-bold text-gray-900 leading-tight mb-3 max-w-xl">
            Stories shaped by artists' hands
          </h2>
          <p className="text-gray-500 text-base mb-16 max-w-lg">
            Before your child becomes the hero, we create a world worth stepping into.
          </p>

          {/* Dashed arc arrow */}
          <div className="relative">
            <DashedArrow />

            {/* Cards row */}
            <div className="grid grid-cols-4 gap-5 relative z-10">
              {features.map((f, i) => (
                <div
                  key={f.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
                  style={{
                    marginTop: i === 0 ? "48px" : i === 1 ? "16px" : i === 2 ? "32px" : "0px",
                  }}
                >
                  <img
                    src={f.src}
                    alt={f.imageAlt}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="px-5 py-5 text-center flex-1 flex flex-col justify-center">
                    <p className="font-bold text-gray-900 text-base mb-2">{f.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
