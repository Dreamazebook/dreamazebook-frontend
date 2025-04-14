import Button from '@/app/components/Button';
import { DREAMAZEBOOK_LOGO, SUCCESS_LOGO, SUCCESS_LOGO_APP, SUCCESS_STAR, SUCCESS_UNDERLINE } from '@/constants/cdn';
import Image from 'next/image';
import Link from "next/link";
import React from 'react';

export default function Thankyou() {

  return (
    <main className="bg-white">
      <Link href={'/'} className="block max-w-7xl mx-auto mb-5">
        <Image className="" src={DREAMAZEBOOK_LOGO} alt="Logo" width={168} height={56} />
      </Link>
      
      <div style={{'--success-logo-app':`url(${SUCCESS_LOGO_APP})`} as React.CSSProperties} className='bg-[#F5E3E3] flex justify-center items-center h-screen relative bg-(image:--success-logo-app) bg-no-repeat md:bg-none'>
        <div className='bg-white p-10 md:px-[88px] md:pt-12 md:pb-16 text-[#222222] max-w-sm md:max-w-4xl mx-auto relative z-10 text-center'>
          <h2 className='font-bold text-[25px] md:text-[40px]'>Congrats!</h2>
          <div className='relative'>
            <h2 style={{'--success-underline':`url(${SUCCESS_UNDERLINE})`} as React.CSSProperties} className='font-bold text-[25px] md:text-[40px] bg-no-repeat [background-size:130px] bg-[150px_25px] md:bg-[330px_40px] md:[background-size:250px] bg-(image:--success-underline)'>
            You’re Now Part of the Story
            </h2>
            <Image src={SUCCESS_STAR} alt='Star' width={54} height={51} className='absolute -top-5 -right-5 md:right-25' />
          </div>
          <p className='text-xl font-light mt-6 mb-3'>We’re so excited to have you here — let’s start the journey together.</p>
          <p className='text-xl font-light mb-3'>Join our Facebook group to get a <b>FREE</b> printable coloring book for your child.</p>

          <div className='flex justify-center'>
          <Button tl='Grab the Free Coloring Fun' className='w-[426px]' url='https://www.facebook.com/groups/632313426083796/' />
          </div>

          <p className='text-xl font-light mt-12 mb-3'>Follow us on                             to get launch alerts</p>
          <p className='text-xl font-light mb-4'>don’t miss our big first-day sale!</p>
          
          
          <div className='flex justify-center'>
          <Button tl='Notify Me for the Big Deal' className='w-[426px]' url='https://www.kickstarter.com/projects/dreamazebook/dreamaze-personalized-books-to-truly-see-your-loved-ones' />
          </div>

          {/* <a href='https://www.facebook.com/groups/632313426083796/' target='_blank' className='flex justify-center items-center gap-3'>
            <Image alt='Facebook' src={SUCCESS_FACEBOOK} width={18} height={18} />
            <span className='font-bold text-xl text-[#012CCE]'>Dreamaze Book Facebook Club</span>
          </a> */}

        </div>
        <Image src={SUCCESS_LOGO} alt='Logo' width={1390} height={135} className='absolute bottom-10 hidden md:block z-0' />
        {/* <Image src="/welcome/success/logo-app.png" alt='Logo' width={144} height={1461} className='absolute left-0 md:hidden top-0 z-0' /> */}
      </div>

    </main>
  )
}