"use client";
import {useEffect, useState} from "react";
import Image from 'next/image'

function PromotionBanner() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Why Sign Up <span className="text-orange-600">Today?</span>
        </h1>
        
        <div className="mt-8 max-w-2xl mx-auto">
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-full 
            transform transition-all duration-200 hover:scale-105">
            Reserve Now - 40% Off
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {/* First Access Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">First Access</h3>
          <p className="text-gray-600">Be the first to explore and even influence our personalized books.</p>
          <span className="inline-block mt-4 text-sm text-orange-600 font-medium">Exclusive Preview →</span>
        </div>

        {/* Discount Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Lock In 40% Off</h3>
          <p className="text-gray-600">Early sign-ups get an exclusive VIP discount before it disappears!</p>
          <div className="mt-3 flex items-center">
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">Limited Time</span>
          </div>
        </div>

        {/* Gift Package Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4l14-5M5 12l14 5" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Limited Gift Package</h3>
          <p className="text-gray-600">Reserve now before this exclusive bonus with their first order!</p>
          <div className="mt-4 flex items-center text-sm text-purple-600 font-medium">
            <span>Free Gift Included</span>
          </div>
        </div>
      </div>
    </div>
  )
};

const ReserveSection = ({title}:any) => {
  return (
    <section className="bg-pink-100 p-20">
      <h2 className="text-center text-4xl">{title}</h2>
      <div className="flex justify-center items-center mt-3 gap-3">
        <input placeholder="example@gmail.com" className="rounded p-2 bg-white" />
        <button className="bg-blue-600 text-white p-2 rounded uppercase">Reserve</button>
      </div>
    </section>
  )
}

interface ChildName {
  name: string;
  image: string;
  called: string;
}

const CHILD_NAMES: ChildName[] = [
  { name: 'Alex', image: '/landing-page/alex.png', called: 'Himself' },
  { name: 'Olivia', image: '/landing-page/olivia.png', called: 'Herself' },
  { name: 'Ashley', image: '/landing-page/ashley.png', called: 'Himself' },
  { name: 'Maria', image: '/landing-page/maria.png', called: 'Herself' },
];

export default function LandingPage() {

  // Add useEffect to handle tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log(e);
      e.preventDefault();
      e.returnValue = ''
      window.open('https://forms.google.com', '_blank');
      return '';
    };
    window.open('https://forms.google.com', '_blank');

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setResponseMessage('');
    const form = event.currentTarget;
    const emailInput = (form.elements.namedItem('email') as HTMLInputElement).value;

    try {
      const response = await fetch(
        "/api/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email: emailInput})
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        setIsError(true);
        setResponseMessage(data.msg);
        return;
      }

      setResponseMessage(data.msg);
      setShowButtons(true);
    } catch (error) {
      console.error("Error subscribing email:", error);
      setIsError(true);
      setResponseMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white">
      <div className='relative md:p-10'>
        <div className='hidden md:block absolute top-0 left-0 w-full h-full -z-1'>
          <Image
            src="/landing-page/desktop-cover.png"
            alt="Happy child reading a personalized book"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-8 z-1 relative md:w-3/5">
          {/* Hero Content */}
          <h1 className="text-4xl font-bold text-black px-4">
            The Ultimate Personalized Books That Let Your Loved Ones See Themselves As The Heroes
          </h1>
          <div className="relative w-full h-[500px] md:hidden">
            <Image
              src="/landing-page/cover.png"
              alt="Happy child reading a personalized book"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className='bg-landing-page p-4 md:bg-transparent z-1 relative md:w-3/5'>
          <div className='md:flex md:flex-col-reverse'>
            <div className='flex justify-between md:mt-20'>
              {['Perfect for all ages', 'Worldwide shipping', 'Eco friendly & baby safe'].map((feature) => (
                <h4 key={feature} className='text-sm md:text-base font-medium'>{feature}</h4>
              ))}
            </div>
            <div className=''>
              <p className='py-4'>
                At Dreamaze, professional writers weave heartfelt, inspiring stories, and talented illustrators bring to life enchanting worlds of magic and wonder. With a touch of AI magic, we create seamless, one-of-a-kind personalized books, crafted just for you. Here, every reader is truly seen, valued, and joyfully celebrated.
              </p>
              
              {!showButtons && 
              <form className="flex justify-between gap-4" onSubmit={handleSubmit}>
                <input 
                  required 
                  type="email" 
                  name="email" 
                  placeholder='example@gmail.com' 
                  className='w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
                  aria-label="Email address"
                />
                <button 
                  disabled={isLoading}
                  className='bg-landing-page-btn text-white px-4 py-2 rounded uppercase w-1/2 disabled:opacity-50 hover:opacity-90 transition-opacity flex justify-center items-center'
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'reserve launch invite'
                  )}
                </button>
              </form>}


              {responseMessage && (
                <div>
                  <p className={`p-4 rounded-md ${
                    isError 
                      ? 'text-red-600 bg-red-100' 
                      : 'text-green-600 bg-green-100'
                  }`}>
                    {responseMessage}
                  </p>
                  
                  {showButtons && !isError && (
                    <div className="flex gap-4 mt-4">
                      <a
                        href="https://app.hubspot.com/payments/purchase/hscs_WUZTsI2Lke1ZkFGqH3oyWtaxKn8ZpxaFyQOOKXWcpGuK0SUIz8mswZKYJyXriPHe?referrer=PAYMENT_LINK"
                        className="text-center bg-blue-600 text-white px-4 py-2 rounded w-1/2 hover:bg-blue-700 transition-colors"
                      >
                        Reserve for $1
                      </a>
                      <a
                        href="https://forms.google.com" // Replace with your actual Google Form URL
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded w-1/2 text-center hover:bg-gray-300 transition-colors"
                      >
                        No thanks
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PromotionBanner />

      <ReserveSection title={"Reserve Now and Save 40%"} />

      {/* The Only Book Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8 leading-15">The Only Book<br/>Where You Are <span className="text-blue-500">Truly Seen</span></h2>
          <p className="text-lg text-center text-gray-700 mb-8">
            If you want to personalize a book that truly reflects your loved ones, not generic avatars but their real name, image, and uniqueness, Dreamazebook is the best choice!
          </p>
        </div>
      </div>

      <ReserveSection title={"See Yourself in the Story—Reserve Now!"} />

      {/* Super Strong Emotional Connection Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-5xl font-bold text-center mb-8">Super Strong<br/><span className="text-blue-500">Emotional</span> Connection</h2>
        <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl mx-auto">
          Reading a story where you and your child are the heroes strengthens bonds and creates cherished memories. These shared moments become treasures that last a lifetime.
        </p>
      </div>

      {/* Effortless Gifting Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8">Effortless Gifting<br/> With Maximum Impact</h2>
          <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl mx-auto">
            Create the perfect personalized storybook with just a few clicks—choose a design, upload a photo, and you're done. It's a thoughtful gift without the hassle.
          </p>
        </div>
      </div>

      {/* Easy Steps Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Easy 3 Steps to Get Your Book</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">01 Personalize It</h3>
            <p className="text-gray-600">Add the hero's name, upload a photo, and make a few fun choices—it's that easy!</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">02 Preview & Confirm</h3>
            <p className="text-gray-600">Take a peek at your book and give it a thumbs-up.</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">03 Receive & Enjoy</h3>
            <p className="text-gray-600">Sit back and get ready for a one-of-a-kind gift to arrive at your door!</p>
          </div>
        </div>
      </div>

      <ReserveSection title={"Reserve and Choose Your Personalized Keepsake!"} />

      {/* About Us Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
          <p className="text-lg text-center text-gray-700 mb-8">
            The heart of Dreamaze is simple: everyone deserves to be the hero of their own story. As a mother, I witnessed the pure joy on my daughter's face when she saw herself in a book—a unique experience she had never had before. We believe personalized books should go beyond pieced-together avatars to create immersive experiences where you or your loved ones are the true protagonists.
          </p>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Beloved By Early Testers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-gray-600 italic">"My daughter wants me to read this book to her all the time! It's the first time she has ever been the hero of a story, and she loves showing it to everyone."</p>
            <p className="text-gray-800 font-semibold mt-4">— Lily's mother</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 italic">"Seeing my own child as the hero of the story is such a wonderful idea! I love how this book captures precious moments—I'll treasure it as a keepsake of all their milestones."</p>
            <p className="text-gray-800 font-semibold mt-4">— Absalom’s father</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 italic">"This is the perfect gift for my grandson! The story is heartwarming, the illustrations are beautiful, and most importantly, my little cutie looks amazing in the book. I can't wait to create one for all of my grandkids."</p>
            <p className="text-gray-800 font-semibold mt-4">— Aaron's grandma</p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-blue-900 text-white py-8 text-center">
        <p className="text-lg">Reserve Now and Save 40%!</p>
        <button className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold mt-4 hover:bg-blue-100 transition duration-300">
          Reserve Now
        </button>
      </div>

      <h2 className='hidden md:block text-center bg-landing-page p-4 text-2xl font-bold'>See Yourself in Personalised Amazing Dream</h2>

      {/* Book Showcase Section */}
      <div className="grid grid-cols-1 md:grid-cols-4">
        {CHILD_NAMES.map(({ name, image, called }, index) => (
          <div key={name} className={`bg-white flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse bg-landing-page'}`}>
            <div className="relative w-1/2 md:w-full aspect-square">
              <Image
                src={image}
                alt={`Book preview ${name}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="w-1/2 p-4 flex justify-center items-center md:hidden">
              <h3 className="text-xl text-blue-900 font-semibold text-center">{name} See {called} In Amazing Dream</h3>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}