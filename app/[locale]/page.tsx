import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function HomePage() {
  const t = useTranslations('HomePage');
  
  return (
    <main className="min-h-screen">
      <section className="flex flex-col bg-black p-10">
        <h1 className="text-4xl font-bold text-white">{t('empower')}</h1>
        <div className="relative w-full h-[145px]">
          <Image src="/home-page/hero-cover.png" alt="hero-cover" className="object-cover" fill />
        </div>
      </section>

      <section className="p-10">
        <h2 className="text-2xl text-center">How Dreamaze Work</h2>
        <p className="text-gray-600 text-center">You may have countless books-stories about other people or characters but at Dreamaze we believe everyone deserves to be the star of their own storyOpen your one-of-a-kind Dreamaze book and unlock a world of limitless possibilities</p>
      </section>

      <section className="p-10"> 
        <h2 className="text-4xl text-center font-bold pb-5" style={{color: 'rgba(1, 44, 206, 1)'}}>See Yourself in Personalized Amazing Dream</h2>
        <p className="text-center">to create moments of surprise and belonging where you see yourself in a world of infinite possibilities.</p>
      </section>

      <section className="">
        <h2 className="text-2xl text-center pb-8 border-b border-black">Our Books</h2>
        <section className='flex flex-wrap'>
          {[1,2,3,4,5].map((item, index) => (
            <article key={index} className="w-1/2 md:w-1/2 lg:w-1/3 p-4">
              <div className="relative w-full h-[91px]">
                <Image src="/home-page/hero-cover.png" alt="hero-cover" className="object-cover" fill />
              </div>
              <h3 className="text-xl font-bold">Where Are You? Save the Multiverse!</h3>
              <p className="text-gray-600">A search-and-find adventure for 1–3 kids</p>
              <button className="bg-black text-white px-4 py-2 rounded-md w-full">Personalize</button>
            </article>
          ))}
        </section>
      </section>

      <section className="p-5 bg-black text-white md:flex md:flex-row">
        <section className="md:w-1/2">
          <h2 className="text-2xl pb-6 text-center">Our first group of leading stars-and counting</h2>
          <p className="">Already, our first group of stars has stepped into the spotlight, discovering the Imagic of seeing themselves as the heroes of their own personalized stories. Our books unlock endless possibilities, allowing young minds to explore, dream, and create unforgettable memories. We can&apos;t wait for you to join the journey-discover the joy of becoming the lead in your own story.</p>
        </section>
        <section className="relative w-full md:w-1/2 h-[267px]">
          <Image src="/home-page/first-group.png" alt="hero-cover" className="object-cover" fill />
        </section>
      </section>

      <section className="p-5">
        <h2 className="text-2xl pb-6 text-center">Side-line Range Of Products</h2>
        <section className="flex flex-col md:flex-row">
          <div className='p-4'>
            <h3>Personalized stickers</h3>
            <a>View More</a>
            <div>Image</div>
          </div>

          <div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4'>
                <h3>Gift package</h3>
                <a>View More</a>
                <div>Image</div>
              </div>
              <div className='p-4'>
                <h3>Envelopes and writting paper</h3>
                <a>View More</a>
                <div>Image</div>
              </div>
            </div>

            <div className='p-4 flex'>
              <div className='p-4'>
                <h3>Postcard</h3>
                <a>View More</a>
              </div>
              <div className='p-4'>
                <div>Image</div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}