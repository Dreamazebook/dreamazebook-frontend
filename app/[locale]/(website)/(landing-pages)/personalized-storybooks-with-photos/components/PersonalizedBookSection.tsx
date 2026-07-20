import { PERSONALIZED_STORYBOOKS } from "@/constants/cdn";

export default function PersonalizedBookSection() {
  return (
    <section className="w-full bg-white font-sans">
      {/* ── MOBILE LAYOUT (default, hidden on md+) ── */}
      <div className="md:hidden px-6 py-12 flex flex-col items-center gap-8">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-900 text-center leading-snug">
          Our standard for{" "}
          <span className="block">a truly personalized book</span>
        </h2>

        {/* Quote card */}
        <div
          className="w-full rounded-2xl px-6 py-5"
          style={{
            background: "#fdf4f4",
            border: "2px dashed #e8c4c4",
          }}
        >
          <p className="text-gray-800 text-lg leading-relaxed mb-3">
            "Seeing yourself in books sends the message: you matter."
          </p>
          <p className="text-right text-gray-500 text-sm">— Christian Robinson</p>
        </div>

        {/* Book image */}
        <div className="w-full flex justify-center">
          <img
            src={PERSONALIZED_STORYBOOKS('personalized-book.webp')}
            alt="Personalized children's book open spread"
            className="w-full max-w-sm object-contain drop-shadow-xl"
            style={{ transform: "rotate(-6deg)" }}
          />
        </div>

        {/* Feature cards */}
        <div
          className="w-full rounded-2xl px-6 py-6 text-center"
          style={{ background: "#fdf0ee" }}
        >
          <p className="font-bold text-gray-900 text-base mb-2">A story worth reading</p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Created by educators, writers, and artists rather than algorithms.
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <div
            className="rounded-2xl px-4 py-6 text-center"
            style={{ background: "#e8eef8" }}
          >
            <p className="font-bold text-gray-900 text-base mb-2 leading-snug">
              Instant recognition
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              When they see themselves, the story becomes theirs.
            </p>
          </div>
          <div
            className="rounded-2xl px-4 py-6 text-center"
            style={{ background: "#fdf4f0" }}
          >
            <p className="font-bold text-gray-900 text-base mb-2 leading-snug">
              From reader to hero
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              A story they don't just read, but belong in
            </p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (md+) ── */}
      <div className="hidden md:block w-full max-w-7xl mx-auto px-10 py-16">
        {/* Top: image left, heading + quote right */}
        <div className="flex items-start gap-0 mb-12">
          {/* Book image — overlaps into bottom row via negative margin trick */}
          <div
            className="shrink-0 w-[420px] relative"
            style={{ marginBottom: "-60px" }}
          >
            <img
              src={PERSONALIZED_STORYBOOKS('personalized-book.webp')}
              alt="Personalized children's book open spread"
              className="w-full object-contain drop-shadow-2xl"
              style={{ transform: "rotate(-8deg)", transformOrigin: "center bottom" }}
            />
          </div>

          {/* Right: heading + quote */}
          <div className="flex-1 pt-4 pl-6 flex flex-col gap-8">
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Our standard for a truly personalized book
            </h2>

            <div
              className="rounded-2xl px-8 py-7"
              style={{
                background: "#fdf4f4",
                border: "2px dashed #e0b8b8",
              }}
            >
              <p className="text-gray-800 text-2xl xl:text-3xl font-medium leading-snug mb-4">
                "Seeing yourself in books sends the message: you matter."
              </p>
              <p className="text-right text-gray-500 text-base">— Christian Robinson</p>
            </div>
          </div>
        </div>

        {/* Bottom: three feature cards */}
        <div className="grid grid-cols-3 gap-5 pl-10">
          <div
            className="rounded-2xl px-7 py-7 text-center"
            style={{ background: "#fdf0ee" }}
          >
            <p className="font-bold text-gray-900 text-base mb-2">A story worth reading</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Created by educators, writers, and artists rather than algorithms.
            </p>
          </div>

          <div
            className="rounded-2xl px-7 py-7 text-center"
            style={{ background: "#e8eef8" }}
          >
            <p className="font-bold text-gray-900 text-base mb-2">Instant recognition</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              When they see themselves, the story becomes theirs.
            </p>
          </div>

          <div
            className="rounded-2xl px-7 py-7 text-center"
            style={{ background: "#fdf8ec" }}
          >
            <p className="font-bold text-gray-900 text-base mb-2">From reader to hero</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              A story they don't just read, but belong in
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
