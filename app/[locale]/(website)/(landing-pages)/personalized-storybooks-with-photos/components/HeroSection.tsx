import { PERSONALIZED_STORYBOOKS } from "@/constants/cdn";
import { Link } from "@/i18n/routing";

const avatars = [
  { type: "img", src: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1" },
  { type: "letter", label: "A", bg: "#7C3AED" },
  { type: "img", src: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1" },
  { type: "letter", label: "J", bg: "#D97706" },
  { type: "img", src: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1" },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#F59E0B">
          <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78z" />
        </svg>
      ))}
    </div>
  );
}

function AvatarStack() {
  return (
    <div className="flex items-center">
      {avatars.map((a, i) => (
        <div
          key={i}
          className="w-9 h-9 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
          style={{ marginLeft: i === 0 ? 0 : "-10px", backgroundColor: a.type === "letter" ? a.bg : undefined, zIndex: avatars.length - i }}
        >
          {a.type === "img" ? (
            <img src={a.src} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{a.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function FeatureIcon({ type }: { type: "child" | "book" | "heart" }) {
  if (type === "child") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="8" r="4" />
        <path d="M8 22c0-3.31 2.69-6 6-6s6 2.69 6 6" />
        <path d="M10 10c-.5.8-.5 2 .5 2.5M18 10c.5.8.5 2-.5 2.5" />
        <path d="M12 13.5c.5.5 1.5.5 2 0" />
      </svg>
    );
  }
  if (type === "book") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="20" height="20" rx="2" />
        <line x1="14" y1="4" x2="14" y2="24" />
        <line x1="8" y1="9" x2="12" y2="9" />
        <line x1="8" y1="13" x2="12" y2="13" />
        <line x1="16" y1="9" x2="20" y2="9" />
        <line x1="16" y1="13" x2="20" y2="13" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 22s-9-5.5-9-12a5 5 0 0110 0 5 5 0 0110 0c0 6.5-9 12-9 12z" />
      <path d="M10 10c0-1.1.9-2 2-2" />
    </svg>
  );
}

function FeatureCards() {
  return (
    <div className="bg-[#F5F0EB] rounded-2xl flex divide-x divide-[#E0D8D0]">
      {[
        { icon: "child" as const, label: "Your child", sub: "the hero" },
        { icon: "book" as const, label: " Artist-drawn", sub: "storybook" },
        { icon: "heart" as const, label: "Made to", sub: "treasure" },
      ].map((f) => (
        <div key={f.icon} className="flex-1 flex flex-col items-center gap-2 py-5 px-2">
          <FeatureIcon type={f.icon} />
          <div className="text-center leading-snug text-sm text-gray-800 font-medium">
            <div>{f.label}</div>
            <div>{f.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <div className="font-sans antialiased">
      {/* ── MOBILE ── */}
      <div className="md:hidden min-h-screen flex flex-col bg-[#F5F0EB]">
        {/* Hero image */}
        <div className="relative w-full" style={{ paddingBottom: "100%" }}>
          <img
            src={PERSONALIZED_STORYBOOKS("hero-mobile.webp")}
            alt="Child reading a personalized storybook"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Gradient overlay for text readability */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-[#F5F0EB] via-transparent to-transparent" style={{ backgroundImage: "linear-gradient(to top, #F5F0EB 0%, #F5F0EB 8%, rgba(245,240,235,0.55) 35%, transparent 60%)" }} /> */}

          {/* Headline over image */}
          <div className="absolute bottom-6 left-5 right-5">
            <h1 className="text-4xl font-extrabold text-blue-600 leading-tight">
              Make Your Child<br />the Hero.
            </h1>
          </div>
        </div>

        {/* Content below image */}
        <div className="flex flex-col gap-5 px-5 pt-5 pb-8">
          {/* Social proof */}
          <div className="flex items-center gap-3">
            <AvatarStack />
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">Loved by 10,000+ famillies</p>
              <StarRating />
            </div>
          </div>

          {/* Feature cards */}
          <FeatureCards />

          {/* CTA */}
          <Link href="/books" className="w-full cursor-pointer bg-gray-900 hover:bg-gray-800 active:scale-[0.98] transition-all text-white text-base font-medium rounded-xl py-4 flex items-center justify-center gap-3">
            Create my preview
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block relative min-h-screen bg-[#F5F0EB] overflow-hidden">
        {/* Full-bleed hero image on the right */}
        <div className="absolute inset-0">
          <img
            src={PERSONALIZED_STORYBOOKS("hero-desktop.webp")}
            alt="Child reading a personalized storybook"
            className="w-full h-full object-cover object-center"
          />
          {/* <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, #F5F0EB 0%, #F5F0EB 28%, rgba(245,240,235,0.85) 42%, rgba(245,240,235,0.3) 58%, transparent 72%)" }}
          /> */}
          {/* <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, #F5F0EB 0%, transparent 25%)" }}
          /> */}
        </div>

        {/* Left content */}
        <div className="relative z-10 flex flex-col justify-center min-h-screen px-12 lg:px-20 pt-20 pb-12 max-w-[620px]">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-blue-600 leading-tight mb-7">
            Where your child becomes the hero of their own story
          </h1>

          {/* Social proof */}
          <div className="flex items-center gap-3 mb-8">
            <AvatarStack />
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">Loved by 10,000+ famillies</p>
              <StarRating />
            </div>
          </div>

          {/* CTA */}
          <Link href="/books" className="cursor-pointer self-start bg-gray-900 hover:bg-gray-800 active:scale-[0.98] transition-all text-white text-sm font-medium rounded-xl px-7 py-3.5 flex items-center gap-3 mb-10">
            Create my preview
            <span className="text-base">→</span>
          </Link>

          {/* Feature cards */}
          <div className="w-full max-w-[480px]">
            <FeatureCards />
          </div>
        </div>

      </div>
    </div>
  );
}
