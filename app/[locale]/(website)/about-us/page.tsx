'use client'

import { useEffect, useRef } from 'react'

export default function AboutUsPage() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const marquee = marqueeRef.current
    if (!marquee) return

    let scrollAmount = 0
    const scrollSpeed = 1

    const scroll = () => {
      scrollAmount += scrollSpeed
      if (scrollAmount >= marquee.scrollWidth / 2) {
        scrollAmount = 0
      }
      marquee.style.transform = `translateX(-${scrollAmount}px)`
    }

    const interval = setInterval(scroll, 20)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                ABOUT US
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              A Book for the Journey of
              <span className="text-amber-600"> Self-Recognition</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Dreamaze, we create storybooks where your child truly sees themselves as the hero.
            </p>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                For young children—who are exploring the connection between themselves and the world—this step of self-recognition changes everything:
              </p>
              <ul className="space-y-3">
                {[
                  'their feelings are seen and comforted',
                  'challenges become lessons in courage',
                  'imagination finds a safe place to grow',
                  'reading becomes a joyful ritual they\'ll return to again and again'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {/* <Check className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" /> */}
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-200 to-blue-200 rounded-3xl blur-2xl opacity-30"></div>
            <img
              src="https://images.unsplash.com/photo-1758874961220-38296d64a674"
              alt="Parent and child reading together"
              className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-3xl blur-2xl opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1758598737528-77505cac475f"
                alt="Mother reading to child"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {/* <Heart className="w-4 h-4" /> */}
                OUR STORY
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                The idea began with my own daughter.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  I once gave her a personalized book where the character looked almost like her, and our family photo was printed on the first page. She lit up instantly, pointing and saying, "That's Mama, Papa, and me!" again and again. But as the story went on, her excitement faded. The avatar wasn't truly her.
                </p>
                <p>
                  As a teacher and education professional for more than 10 years, I knew from countless classroom moments that children long to be seen and understood—when they face separation anxiety, when their imagination overflows, when they stumble and adults don't notice. Books can be a safe space where they make sense of it all.
                </p>
                <p className="font-semibold text-gray-900">
                  That's when I realized: children need one more kind of book—a book where they can truly see themselves.
                </p>
                <p>
                  A book where they can live through challenges, feel encouraged, and share the journey with their loved ones. A bridge to belonging, self-understanding, and joy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {/* <Sparkles className="w-4 h-4" /> */}
              OUR MISSION
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              And so, Dreamaze was born.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              After many trials, we combined heartfelt storytelling with hand-drawn illustrations, adding one essential layer: your child at the center of every page.
            </p>
            <p className="text-xl font-semibold text-gray-900">
              We believe every child deserves to be the hero—and to carry the power of stories into their own life.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <img
                src="https://images.pexels.com/photos/3536630/pexels-photo-3536630.jpeg"
                alt="Parent reading with child"
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1758598737999-e5b659b3d65c"
                alt="Joyful reading moment"
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
              <img
                src="https://images.pexels.com/photos/1741230/pexels-photo-1741230.jpeg"
                alt="Child exploring book"
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {/* <Book className="w-4 h-4" /> */}
                OUR PROCESS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Dreamaze Stories: From Sketch to Life
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Every Dreamaze story begins with an idea—how a child might feel seen, encouraged, or celebrated. Our illustrators start by sketching rough concepts on digital canvas, shaping characters, settings, and details that bring the story to life.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <article className="p-6 space-y-4 bg-white/80 backdrop-blur border-amber-200">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-700">1</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1611770361844-9508d956d389"
                  alt="Sketching process"
                  className="rounded-xl w-full h-48 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900">Sketch</h3>
                <p className="text-gray-600">
                  Rough concepts and initial character designs are created on digital canvas.
                </p>
              </article>

              <article className="p-6 space-y-4 bg-white/80 backdrop-blur border-amber-200">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-700">2</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1605719124118-58056ae4ed2a"
                  alt="Illustration process"
                  className="rounded-xl w-full h-48 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900">Illustrate</h3>
                <p className="text-gray-600">
                  Lines refined, colors layered, emotions added—bringing the world to life.
                </p>
              </article>

              <article className="p-6 space-y-4 bg-white/80 backdrop-blur border-amber-200">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-700">3</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1565843248736-8c41e6db117b"
                  alt="Final book"
                  className="rounded-xl w-full h-48 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900">Personalize</h3>
                <p className="text-gray-600">
                  Your child becomes the hero, creating a world they can truly enter.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="relative">
          <div
            ref={marqueeRef}
            className="flex whitespace-nowrap"
            style={{ willChange: 'transform' }}
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="text-4xl md:text-6xl font-bold text-white mx-8">
                  See yourself in Dreamaze Book
                </span>
                {/* <Sparkles className="w-8 h-8 text-amber-300 mx-8" /> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Co-creation Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {/* <Heart className="w-4 h-4" /> */}
              JOIN US
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Co-creating With Our Families
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Dreamaze is still young, but we've already heard so much inspiring feedback. To make our books even more personal, we'd love you to co-create with us.
            </p>
            <p className="text-xl font-semibold text-gray-900">
              Share your ideas—together we can create stories where every child truly sees themselves.
            </p>
            <button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => window.location.href = '#submit-idea'}
            >
              Submit Your Idea
            </button>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {/* <Shield className="w-4 h-4" /> */}
                QUALITY & SAFETY
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Safe and Friendly for Little Hands
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At Dreamaze, your child's safety always comes first.
              </p>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We use non-toxic inks and paper that's gentle on young eyes—so every page is vibrant and detailed, yet safe for little readers.
                </p>
                <p>
                  Our books come in three durable formats, each tested to withstand eager hands and everyday use. Sturdy, lasting, and designed with care—ready for little hands to explore, again and again.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { label: 'Non-toxic Inks' },
                  { label: 'Gentle Paper' },
                  { label: 'Durable Formats' },
                  { label: 'Child-safe Materials' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      {/* <item.icon className="w-4 h-4 text-emerald-600" /> */}
                    </div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-200 to-emerald-200 rounded-3xl blur-2xl opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1533561304446-88a43deb6229"
                alt="Children's books"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-600 py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Every child deserves to be the hero
          </h2>
          <p className="text-xl text-amber-50 max-w-2xl mx-auto">
            Create a personalized storybook where your child truly sees themselves
          </p>
          <button
            className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
            onClick={() => window.location.href = '/'}
          >
            Start Your Story
          </button>
        </div>
      </section>
    </div>
  )
}
