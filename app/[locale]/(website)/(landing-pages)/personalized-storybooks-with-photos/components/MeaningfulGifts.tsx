const steps = [
  {
    number: "1",
    title: "Choose a story they'll love",
    description: "Browse and pick the perfect book.",
  },
  {
    number: "2",
    title: "Personalize with care",
    description: "Add a photo and a few personal details.",
  },
  {
    number: "3",
    title: "See a free, private preview",
    description: "Watch their story come to life.",
  },
  {
    number: "4",
    title: "Make it truly theirs",
    description: "Add special touches they'll treasure forever.",
  },
];

export default function MeaningfulGifts() {
  return (
    <section
      style={{ backgroundColor: "#F7F5F0" }}
      className="w-full flex items-center justify-center px-6 py-16"
    >
      <div className="w-full max-w-8xl">
        <h1
          className="text-4xl sm:text-5xl font-black text-center leading-tight mb-12"
        >
          Meaningful gifts made in minutes
        </h1>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <li key={step.number} className="flex items-start gap-5">
              <div
                className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  border: "2px solid #1a1a1a",
                  marginTop: "2px",
                }}
              >
                <span>
                  {step.number}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h2
                  className="text-lg sm:text-xl font-bold leading-snug"
                  style={{ color: "#1a1a1a" }}
                >
                  {step.title}
                </h2>
                <p
                  className="text-base sm:text-lg leading-relaxed"
                  style={{ color: "#7a7772" }}
                >
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
