import { DREAMAZEBOOK_LOGO } from '@/constants/cdn';
import Image from 'next/image';
import Link from "next/link";

export default function Thankyou() {

  return (
    <main className="bg-white">
      <Link href={'/'} className="block max-w-7xl mx-auto mb-5">
        <Image className="" src={DREAMAZEBOOK_LOGO} alt="Logo" width={168} height={56} />
      </Link>
      
      <div className='bg-[#F5E3E3] flex justify-center items-center h-screen relative bg-[url(/welcome/success/logo-app.png)] bg-no-repeat md:bg-none'>
        <div className='bg-white p-10 md:px-[88px] md:pt-12 md:pb-16 text-[#222222] max-w-sm md:max-w-4xl mx-auto relative z-10'>
          <h2 className='font-bold text-[25px] md:text-[40px] text-center'>Thank you</h2>
          <div className='relative'>
            <h2 className='font-bold text-[25px] md:text-[40px] text-center bg-no-repeat [background-size:130px] bg-[150px_25px] md:bg-[330px_40px] md:[background-size:250px] bg-[url(/welcome/success/underline.png)]'>
            for joining our mailing list!
            </h2>
            <Image src={"/welcome/success/star.png"} alt='Star' width={54} height={51} className='absolute -top-5 -right-5 md:right-25' />
          </div>
          <p className='text-xl font-light mt-6 mb-3'>Exciting things are on the way!</p>
          <p className='text-xl font-light mb-3'>Want sneak peeks, early news, and even vote for upcoming designs?</p>
          <p className='text-xl font-light mb-6'>We’re preparing behind-the-scenes stories, special updates, and surprises just for our insiders.</p>
          <p className='text-xl font-bold mb-6'>Join the Dreamaze Facebook Group and be part of the magic!</p>
          <a href='https://www.facebook.com/groups/632313426083796/' target='_blank' className='flex justify-center items-center gap-3'>
            <Image alt='Facebook' src={'/welcome/success/facebook.svg'} width={18} height={18} />
            <span className='font-bold text-xl text-[#012CCE]'>Dreamaze Book Facebook Club</span>
          </a>
        </div>
        <Image src="/welcome/success/logo.png" alt='Logo' width={1390} height={135} className='absolute bottom-10 hidden md:block z-0' />
        {/* <Image src="/welcome/success/logo-app.png" alt='Logo' width={144} height={1461} className='absolute left-0 md:hidden top-0 z-0' /> */}
      </div>

    </main>
  )
}