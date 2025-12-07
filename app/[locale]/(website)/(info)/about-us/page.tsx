'use client';

import { ABOUT_IMAGE } from '@/constants/cdn'
import { BOOKS_URL, SURVEY_URL } from '@/constants/links'
import { Link } from '@/i18n/routing'
import InfiniteScrollLogo from '../../components/home/InfiniteScrollLogo'
import { AnimatedSection } from '../../../../components/AnimatedSection'

const SAFT_AND_FRIENDLY = [
  {
    title: 'Non-toxic Inks',
    img: ABOUT_IMAGE('non-toxic-inks.png')
  },
  {
    title:'Gentle Paper',
    img:ABOUT_IMAGE('gentle-paper.png')
  },
  {
    title:'Durable Formats',
    img:ABOUT_IMAGE('durable-formats.png')
  },
  {
    title:'Child-safe Materials',
    img:ABOUT_IMAGE('child-safe-materials.png')
  }


]

export default function AboutUsPage() {
  return (
    <main className="text-[#222222] space-y-20 text-[14px] md:text-[16px]">

      <AnimatedSection>
        <section
          style={{
            '--hero-image': `url(${ABOUT_IMAGE('hero.png')})`,
            '--hero-image-mobile': `url(${ABOUT_IMAGE('hero-mobile.png')})`,
          } as React.CSSProperties}
          className="max-w-5xl p-4 md:p-20 bg-(image:--hero-image-mobile) md:bg-(image:--hero-image) bg-no-repeat bg-center bg-cover mx-auto flex flex-col justify-end md:justify-center h-[80vh] md:h-[440px]">
          <div>
            <h1 className="text-[28px] md:text-[40px] font-medium lg:w-[70%]">At Dreamaze, we create storybooks where your child truly sees themselves as the hero.</h1>
            <p className=" mt-5 md:mt-10">
              For little readers, being seen changes everything—<br />
              • feelings are understood<br />
              • imagination grows<br />
              • confidence begins to bloom<br />
            </p>
          </div>
        </section>
      </AnimatedSection>


      <AnimatedSection>
        <section className="max-w-5xl mx-auto p-4 md:p-0">
          <h2 className="text-[28px] md:text-[40px] font-medium text-center mb-10">Where It All Began</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <p className=''>
              <span className="font-medium">The idea began with my daughter.</span><br />
              I once gave her a personalized book with a character that almost looked like her, and our family photo printed on the first page. <br />
              She lit up instantly—pointing again and again, "That's Mama, Papa, and me!" That joy was so pure.<br />
              But as we kept reading, her excitement slowly faded.<br />
              The avatar wasn't truly her—and she felt it.<br />
              In that moment, I realized something deeply true about children:<br />
              <span className="font-medium">they know when something really reflects them… and when it doesn't.</span><br/><br/>
              
              <span className="hidden md:block">
              As a teacher for more than 10 years, I had seen the same longing in countless children
              to be understood, to feel noticed, to make sense of big emotions and brave little moments.
              Stories can be their safe place for all of that.
              Children needed one more kind of book: not just a book with their name, not an avatar that's "close enough," but a story where they can truly see themselves— and share that journey with the people they love.<br />
              <span className="font-medium">And so, Dreamaze was born.</span>
              </span>
            </p>
            <img src={ABOUT_IMAGE('where-it-all-began.png')} className="w-full" alt="Where it all began" />
          </div>
          <p className='mt-4 md:hidden'>
            As a teacher for more than 10 years, I had seen the same longing in countless children
            to be understood, to feel noticed, to make sense of big emotions and brave little moments.
            Stories can be their safe place for all of that.
            Children needed one more kind of book: not just a book with their name, not an avatar that's "close enough," but a story where they can truly see themselves— and share that journey with the people they love.<br />
            <span className="font-medium">And so, Dreamaze was born.</span>
          </p>
        </section>
      </AnimatedSection>


      <AnimatedSection>
        <section className="max-w-5xl mx-auto p-4 md:p-0">
          <h2 className='text-center text-[36px] md:text-[60px] text-primary font-semibold mb-20'>Made by Educators & Artists,<br className="hidden md:block"/>Crafted for Your Child</h2>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
            <img src={ABOUT_IMAGE('dreamaze-stories.png')} alt="Dreamaze Stories" className="w-full md:w-1/2" />
            <div className="w-full md:w-1/2 space-y-4">
              <h3 className="text-[28px] md:text-[40px] text-center font-semibold md:text-left">Dreamaze Stories:
                From Sketch to Life</h3>
              <p className=''>
                Every Dreamaze story begins with a simple question—<br />
                <span className="font-semibold" >how can we help a child feel seen, encouraged, and celebrated?</span><br /><br/>

                Our stories are shaped with educator-led insights and brought to life by award-winning illustrators—
                each page blending learning, emotion, and artistry.<br />So your child doesn't just read the story…<br/>
                <span className='font-semibold'>they step into it</span><br />
                and see themselves as the hero.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <InfiniteScrollLogo />


      <AnimatedSection>
        <section className="max-w-xl mx-auto p-4 md:p-0 flex flex-col justify-center">
          <div className='text-center'>
            <h2 className="font-semibold text-[24px] md:text-[40px] md:font-bold mb-8">Co-creating With Our Families</h2>
            <p className='text-left md:text-center'>Dreamaze is still young, but we've already heard so much inspiring feedback.<br />
              To make our books even more personal, we'd love you to co-create with us.<br /> <br />
              <span className="font-semibold">Your ideas help us understand what matters most to real families—<br />
                Together, we can create stories every child truly sees themselves in..</span>
            </p>
            <Link className="bg-[#222] mx-auto md:w-[360px] mt-5 block text-[16px] p-2 rounded text-[#FCF2F2]" href={SURVEY_URL}>Submit Your Idea</Link>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="bg-[#FCF2F2] p-4 pb-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[24px] md:text-[40px] font-semibold text-center my-10">Safe and Friendly for Little Hands</h2>
            <p className="md:text-center">
              At Dreamaze, your child's safety always comes first.<br/>
We use non-toxic inks and gentle paper designed for young eyes,<br/>
 every page is vibrant, soft, and safe.<br/><br/>
Our books come in three durable formats, each tested to withstand eager hands and everyday use.  Sturdy, lasting, and designed with care— <br/>
<span className="font-semibold">ready for little hands to explore, again and again.</span>
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 w-[200px] md:w-[660px] mx-auto">
              {SAFT_AND_FRIENDLY.map((item)=>
              <li className="flex items-center gap-4">
                <img className="w-[36px] h-[36px] md:w-[64px] md:h-[64px]" src={item.img} alt={item.title} />
                <span>{item.title}</span>
              </li>
              )}
            </ul>
            <Link className="bg-[#222] md:w-[360px] mx-auto text-center mt-5 block text-[16px] p-2 rounded text-[#FCF2F2]" href={BOOKS_URL}>Explore Our Books</Link>
          </div>
        </section>
      </AnimatedSection>

    </main>
  )
}