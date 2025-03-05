import Image from 'next/image';
import Link from "next/link";

export default function Thankyou() {

  return (
    <main className="bg-white">
      <Link href={'/'} className="block max-w-7xl mx-auto mb-5">
        <Image className="" src={'/welcome/dreamaze-logo.png'} alt="Logo" width={168} height={56} />
      </Link>
      
      <div className='bg-[#F5E3E3] flex justify-center items-center h-screen'>
        <div className='bg-white px-[88px] pt-12 pb-16 text-[#222222] max-w-4xl mx-auto'>
          <h1 className='font-bold text-[40px] text-center'>Congrats! You&rsquo;re a VIP!</h1>
          <p className='text-xl font-light mt-6 mb-3'>Thank you so much for reserving your spot! You’re locked in to receive the first-day best discount and VIP-only perks when you back our project on Kickstarter!</p>
          <p className='text-xl font-light mb-6'>Stay tuned – you’ll receive an email from us soon with all the details about the launch.</p>
          <div className='flex justify-center items-center'>
            <p className='font-bold text-xl text-[#012CCE]'>Stay Updated in the VIP Group</p>
          </div>
        </div>
      </div>

    </main>
  )
}