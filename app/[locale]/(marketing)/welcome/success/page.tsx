import Image from 'next/image';
import Link from "next/link";

export default function Thankyou() {

  return (
    <main className="bg-white">
      <Link href={'/'} className="block max-w-7xl mx-auto mb-5">
        <Image className="" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={168} height={56} />
      </Link>
      
      <div className='bg-[#F5E3E3] flex justify-center items-center h-screen relative bg-[url(/welcome/success/logo-app.png)] bg-no-repeat md:bg-none'>
        <div className='bg-white p-10 md:px-[88px] md:pt-12 md:pb-16 text-[#222222] max-w-sm md:max-w-4xl mx-auto relative z-10'>
          <div className='relative'>
            <h1 className='font-bold text-[25px] md:text-[40px] text-center bg-no-repeat [background-size:130px] bg-[150px_25px] md:bg-[330px_40px] md:[background-size:250px] bg-[url(/welcome/success/underline.png)]'>Congrats! You&rsquo;re a VIP!</h1>
            <Image src="/welcome/success/star.png" alt='Star' width={54} height={51} className='absolute -top-5 -right-5 md:right-25' />
          </div>
          <p className='text-xl font-light mt-6 mb-3'>Thank you so much for reserving your spot! You’re locked in to receive the first-day best discount and VIP-only perks when you back our project on Kickstarter!</p>
          <p className='text-xl font-light mb-6'>Stay tuned – you’ll receive an email from us soon with all the details about the launch.</p>
          <div className='flex justify-center items-center gap-3'>
            <Image alt='Facebook' src={'/welcome/success/facebook.svg'} width={18} height={18} />
            <p className='font-bold text-xl text-[#012CCE]'>Stay Updated in the VIP Group</p>
          </div>
        </div>
        <Image src="/welcome/success/logo.png" alt='Logo' width={1390} height={135} className='absolute bottom-10 hidden md:block z-0' />
        {/* <Image src="/welcome/success/logo-app.png" alt='Logo' width={144} height={1461} className='absolute left-0 md:hidden top-0 z-0' /> */}
      </div>

    </main>
  )
}