"use client";
import {useEffect, useState} from "react";
import Image from 'next/image'
import FAQ from "../components/FAQ";
import Growth from "../components/Growth";
import PromotionBanner from "../components/PromotionBanner";
import ReserveSection from "../components/ReserveSection";
import TheOnlyBook from "../components/TheOnlyBook";
import DreamzeImage from "@/app/components/DreamzeImage";
import EffortlessGifting from "../components/EffortlessGifting";

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
          The Ultimate Personalized Books to Truly See Your Child
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
            <div className=''>
              
              {!showButtons && 
              <form className="space-y-3" onSubmit={handleSubmit}>
                <input 
                  required 
                  type="email" 
                  name="email" 
                  placeholder='example@gmail.com' 
                  className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
                  aria-label="Email address"
                />
                <button 
                  disabled={isLoading}
                  className='bg-landing-page-btn text-white px-4 py-2 rounded uppercase w-full disabled:opacity-50 hover:opacity-90 transition-opacity flex justify-center items-center'
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

      <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/early-access.png)]"} title={"Early Access"} desc={'Be the first to explore and even help shape our personalized books.'} />

      <TheOnlyBook />

      <ReserveSection cssClass={"bg-white"} title={"Make It Extra Special"} desc={'Create a magical story starring your little one.'} />

      {/* Super Strong Emotional Connection Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-5xl font-bold text-center mb-8">Super Strong<br/><span className="text-blue-500">Emotional</span> Connection</h2>
        <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl mx-auto">
          Reading a story where you and your child are the heroes strengthens bonds and creates cherished memories. These shared moments become treasures that last a lifetime.
        </p>
      </div>

      {/* Effortless Gifting Section */}
      <div className="bg-pink-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8">Expertly Crafted<br/>And <span className="text-blue-500">Beautifully</span> Illustrated</h2>
          <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl mx-auto">
          Every book is thoughtfully written by professional educators and features exclusive hand-drawn art It’s a one-of-a-kind keepsake made with care and love.
          </p>
          
          <div className="max-w-4xl relative aspect-[4/1] mx-auto">
            <DreamzeImage src="/welcome/reserve-banner/early-access.png" alt="Dreamazebook" cssClass="transition-opacity animation-opacity z-10" />
            <DreamzeImage src="/welcome/reserve-banner/40-vip-discount.png" alt="Dreamazebook" />
          </div>
        </div>
      </div>
      
      <EffortlessGifting />

      <ReserveSection cssClass={"bg-pink-50"} title={"40% VIP Discount"} desc="Reserve now and secure our biggest deal before it’s gone!" />

      {/* About Us Section */}
      <div className="bg-blue-50 py-16 bg-[url(/welcome/about-us-bg.png)] bg-cover h-screen flex items-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8">About Us</h2>
          <p className="text-lg max-w-2xl mx-auto text-center text-gray-700 mb-8">
            The heart of Dreamaze is simple: <b>everyone deserves to be the hero of their own story.</b> As a mother I witnessed the pure joy on my daughter’s face when she saw herself in a book—a unique experience she had never had before. We believe personalized books should go beyond pieced-together avatars to create immersive experiences where you or your loved ones are the true protagonists.
          </p>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-pink-50 mx-auto px-4 py-20">
        <h2 className="text-5xl font-bold text-center mb-8"><span className="text-blue-500">Beloved</span> By Early Testers</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            tl: "My daughter wants me to read this book to her all the time! It’s the first time she has ever been the hero of a story, and she loves showing it to everyone.",
            desc: "LIli‘s mother",
            img: '/welcome/beloved-by-early-testers/lIli-mother.png'
          },
          {
            tl: "Seeing my own child as the hero of the story is such a wonderful idea! I love how this book captures precious moments—I’ll treasure it as a keepsake of all their milestones.",
            desc: "Absalom’s father",
            img: '/welcome/beloved-by-early-testers/absalom-father.png'
          },
          {
            tl: "This is the perfect gift for my grandson! The story is heartwarming, the illustrations are beautiful, and most importantly, my little cutie looks amazing in the book. I can’t wait to create one for all of my grandkids！",
            desc: "Aaron‘s grandma",
            img: '/welcome/beloved-by-early-testers/aaron-grandma.png'
          }].map(({tl, desc, img}) => 
            <div className="text-center bg-white p-5" key={tl}>
              <p className="text-gray-600">{tl}</p>
              <div className="flex justify-center gap-1 items-center mt-4">
                <Image src={img} height={48} width={48} alt={desc} />
                <p className="text-gray-800 font-semibold">{desc}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Growth />

      <FAQ />

      <ReserveSection cssClass={"text-white bg-[url(/welcome/reserve-banner/40-vip-discount.png)]"} title={"40% VIP Discount"} desc="Reserve now and secure our biggest deal before it’s gone!" />

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