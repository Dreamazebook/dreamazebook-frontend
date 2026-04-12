import { HOME_STORIES } from '@/constants/cdn';
import { useEffect, useRef, useState } from 'react';
import Image from '../common/Image';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  image: string;
  bookImage?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Children are more expressive when they see themselves in a book. This helps support language development and confidence. I highly recommend it for parents and educators alike.",
    author: "Anna Peterson",
    role: "Early Childhood Speech Therapist",
    image: HOME_STORIES('anna-peterson.png'),
  },
  {
    id: 2,
    quote: "I bought one for each child. What surprised me most was how personalized each felt — not just name. The pages feel like they understand who my kids are. That's rare and incredibly special.",
    author: "Sophie Bernard",
    role: "Mom of siblings, ages 2 & 6",
    image: HOME_STORIES('sophie-bernard.png'),
    bookImage: "/book-preview.jpg"
  }
];

export default function StoriesFromRealFamilies() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play when in viewport, pause when out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        // First try muted (browsers allow muted autoplay)
        video.muted = true;
        await video.play();
        
        // Then try to unmute after playing starts
        setTimeout(() => {
          video.muted = false;
          video.volume = 0.5;
        }, 100);
      } catch (err) {
        console.error('Muted auto-play failed, trying with volume:', err);
        // Fallback: try with volume if muted fails
        try {
          video.muted = false;
          video.volume = 0.5;
          await video.play();
        } catch (err2) {
          console.error('All auto-play attempts failed (user interaction required):', err2);
        }
      }
    };

    // Intersection Observer for viewport detection
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        if (entry.isIntersecting) {
          attemptPlay();
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.5 // Play when 50% of video is visible
      }
    );

    observer.observe(containerRef.current || video);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused || video.ended) {
      // Set volume and play the video
      video.volume = 0.5;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
        }).catch(err => {
          console.error('Play failed:', err);
        });
      }
    } else {
      // Pause the video
      video.pause();
    }
  };



  return (
    <div className="bg-white py-[64px] md:py-[88px] px-[24px]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
            Stories from Real Families
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Seeing themselves in the story makes all the difference.
          </p>
        </div>

        {/* Grid Layout for all screen sizes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8 relative">
          <div className="bg-[#F8F8F8] rounded p-6 sm:p-8 lg:p-10 relative md:col-span-2">
            <Image alt='Quuote' src={HOME_STORIES('top-quote.png')} className="w-10 h-10 lg:w-12 lg:h-12 absolute -top-5 left-4" />
            <p className="text-[#222] text-[16px] md:text-[18px] font-medium leading-relaxed mb-6 lg:mb-8">
              {testimonials[0].quote}
            </p>
            <div className="flex items-center gap-3 lg:gap-4">
              <Image src={testimonials[0].image} alt={testimonials[0].author} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover flex-shrink-0" />
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

          <div className="bg-[#F8F8F8] rounded p-10 relative lg:row-span-2 md:col-span-3">
            <div 
              ref={containerRef}
              className="aspect-square lg:aspect-auto rounded md:w-[536px] mx-auto mb-6 lg:mb-8 overflow-hidden relative cursor-pointer group"
              onClick={handleVideoClick}
            >
              <video
                ref={videoRef}
                src={HOME_STORIES('video.mp4')}
                loop
                playsInline
                controls
                muted
                disablePictureInPicture
                x-webkit-airplay="deny"
                preload="metadata"
                className="w-full h-full object-cover"
              />
              
              {/* Play/Pause overlay button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoClick();
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              {/* Play/Pause hint */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {isPlaying ? 'Click to pause' : 'Click to play'}
              </div>
            </div>
            <p className="text-[#222] text-[16px] md:text-[18px] font-medium leading-relaxed mb-6 lg:mb-8">
              As a mom, I've read lots of books my kids, but nothing has ever made my son light up quite like this when he saw his own face in the story. He disrupts and then he started acting out. It was seriously the sweetest thing I had ever seen. I almost cried. It just made him feel so seen. And as a mom, that just meant everything to me.
            </p>
            <div className="flex items-center justify-center gap-3 lg:gap-4">
              <Image src={HOME_STORIES('mckynlee.webp')} alt="McKynlee.M" className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#222] text-[14px] md:text-[18px]">
                  McKynlee.M
                </p>
                <p className="text-[#999] text-[14px] md:text-[18px]">
                  Mom of a 3-year-old boy
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded p-6 sm:p-8 lg:p-10 relative md:col-span-2 md:col-start-1">
            <div className="aspect-[3/2] sm:aspect-[4/3] mx-auto lg:h-48 rounded bg-gray-200 mb-6 overflow-hidden flex items-center justify-center">
              <Image
                src={HOME_STORIES('book_pic.webp')}
                alt="Personalized children's book"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[#222] text-[16px] md:text-[18px] font-medium leading-relaxed mb-6 lg:mb-8">
              {testimonials[1].quote}
            </p>
            <div className="flex items-center gap-3 lg:gap-4">
              <Image src={testimonials[1].image} alt={testimonials[1].author} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover" />
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

          <Image alt='quote' src={HOME_STORIES('bottom-quote.png')} className="absolute -bottom-4 right-4 lg:right-8 w-12 h-12" />
        </div>
      </div>
    </div>
  );
}