"use client";
import {useState} from "react";
import Image from 'next/image'

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

  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setResponseMessage(data.msg);
    } catch (error) {
      console.error("Error subscribing email:", error);
    }
  };

  return (
    <main className="min-h-screen bg-white">
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
              {['Perfect for all age','Worldwide shipping','Eco friendly baby safe'].map((world)=>
                (<h4 key={world} className=''>{world}</h4>)
              )}
            </div>
            <div className=''>
              <p className='py-4'>At Dreamaze, professional writers weave heartfelt, inspiring stories, and talented illustrators bring to life enchanting worlds of magic and wonder. With a touch of AI magic, we create seamless, one-of-a-kind personalized books, crafted just for you. Here, every reader is truly seen, valud, and joyfulling celebrated.</p>
              
              <form className="flex justify-between gap-4" onSubmit={handleSubmit}>
                <input required type="email" name="email" placeholder='example@gmail.com' className='w-1/2 p-1' />
                <button className='bg-landing-page-btn text-white p-1 uppercase w-1/2'>reserve launch invite</button>
              </form>
              {responseMessage && <p className="text-green-600 bg-green-100 p-4 rounded-md mt-4">{responseMessage}</p>}
            </div>
          </div>
        </div>
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