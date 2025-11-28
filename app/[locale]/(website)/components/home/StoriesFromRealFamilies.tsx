import { HOME_STORIES } from '@/constants/cdn';
import { FaQuoteRight as Quote } from 'react-icons/fa';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  image?: string;
  bookImage?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "My daughter instantly recognized herself on the first page. She literally gasped and said, 'That's ME!' We've read it every night since. It's more than a book — it made her feel seen.",
    author: "Emily Carter",
    role: "Mom of a 3-year-old girl",
    image: "/avatar1.jpg"
  },
  {
    id: 2,
    quote: "I bought one for each child. What surprised me most was how personalized each felt — not just the name. The pages feel like they understand who my kids are. That's rare and incredibly special.",
    author: "Sophie Bernard",
    role: "Mom of siblings, ages 2 & 6",
    image: "/avatar2.jpg",
    bookImage: "/book-preview.jpg"
  }
];

export default function StoriesFromRealFamilies() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
            Stories from Real Families
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Seeing themselves in the story makes all the difference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative">
          <Quote className="absolute -top-4 left-4 lg:left-8 w-12 h-12 lg:w-16 lg:h-16 text-blue-600 opacity-20" />

          <div className="bg-[#F8F8F8] rounded p-6 sm:p-8 lg:p-10 relative">
            <Quote className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600 mb-4 lg:mb-6" />
            <p className="text-[#222] text-[16px] md:text-[18px] leading-relaxed mb-6 lg:mb-8">
              {testimonials[0].quote}
            </p>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#222] text-[14px] md:text-[18px]">
                  {testimonials[0].author}
                </p>
                <p className="text-[#999] text-[14px] md:text-[18px]">
                  {testimonials[0].role}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded p-6 relative lg:row-span-2">
            <div className="aspect-[4/3] lg:aspect-auto lg:h-[400px] xl:h-[480px] rounded-xl bg-gray-200 mb-6 lg:mb-8 overflow-hidden">
              <video
                src={HOME_STORIES('video.mp4')}
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[#222] text-[16px] md:text-[18px] leading-relaxed mb-6 lg:mb-8">
              My daughter instantly recognized herself on the first page. She literally gasped and said, 'That's ME!' We've read it every night since. It's more than a book — it made her feel seen.
            </p>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#222] text-[14px] md:text-[18px]">
                  Emily Carter
                </p>
                <p className="text-[#999] text-[14px] md:text-[18px]">
                  Mom of a 3-year-old girl
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded p-6 sm:p-8 lg:p-10 relative">
            <div className="aspect-[3/2] sm:aspect-[4/3] lg:h-48 rounded-xl bg-gray-200 mb-6 overflow-hidden flex items-center justify-center">
              <img
                src={HOME_STORIES('book_pic.webp')}
                alt="Personalized children's book"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[#222] text-[16px] md:text-[18px] leading-relaxed mb-6 lg:mb-8">
              {testimonials[1].quote}
            </p>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#222] text-[14px] md:text-[18px]">
                  {testimonials[1].author}
                </p>
                <p className="text-[#999] text-[14px] md:text-[18px]">
                  {testimonials[1].role}
                </p>
              </div>
            </div>
          </div>

          <Quote className="absolute -bottom-4 right-4 lg:right-8 w-12 h-12 lg:w-16 lg:h-16 text-blue-600 opacity-20 rotate-180" />
        </div>
      </div>
    </div>
  );
}
