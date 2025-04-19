import FAQ from "./FAQ";

const FAQs = [
  {
    tl:'How can I support Dreamaze on Kickstarter?',
    ans: (<>Back us on Kickstarter – backing on Day One unlocks the best price! We also highly recommend joining our VIP Facebook Group so you won’t miss our launch and can claim a <span className="font-bold">FREE giveaway gift</span>.</>),
    show:true
  },
  {
    tl:'What happens after I register?',
    ans: <>
      <span><span className="font-bold">Join Our VIP Facebook Group</span> – Get exclusive updates and behind-the-scenes stories.</span><br/>
      <span><span className="font-bold">Sign Up on Kickstarter</span> – Lock in the biggest early bird discount.</span><br/>
      <span><span className="font-bold">Back Us on Launch Day</span> – Choose your reward when our campaign goes live.</span><br/>
      <span><span className="font-bold">Customize Your Book</span> – After the campaign, personalize it on our website to make it truly yours.</span><br/>
      <span><span className="font-bold">We’ll Start Production</span> – Once confirmed, we’ll create your personalized book.</span><br/>
      <span><span className="font-bold">Shipping & Delivery</span> – Your book will be printed, packed, and delivered to your door.</span><br/>
      <span><span className="font-bold">Enjoy & Share</span> – Experience the magic and spread the joy with your loved ones!</span>
    </>
  },
  {
    tl:'When will my book be delivered if I back you on Kickstarter?',
    ans: 'Kickstarter backers will receive their books as part of the first production run, with delivery estimated within 4-6 weeks of the campaign ending.'
  },
  {
    tl:'Can I make changes to my personalization after ordering?',
    ans: 'Yes, as long as the book hasn’t entered production.'
  },
  {
    tl:'Do you ship internationally?',
    ans: 'Yes, we ship worldwide!'
  },
  {
    tl:'What makes Dreamaze books unique?',
    ans: 'Every Dreamaze book is one of a kind. Our stories are 100% original, brought to life with hand-drawn illustrations and heartfelt storytelling. You personalize it with a name and unique details, making it truly yours. With a touch of AI magic, your photo blends seamlessly into the story, creating a keepsake as unique as you are.'
  },

  {
    tl:'Can I personalize more than one character?',
    ans: 'Yes! We offer books featuring families and friends, with options for 2-3 characters. We\'re still expanding our collection—reserve now and let us know what you’d love to see.'
  },

  {
    tl:'What age group are these books for?',
    ans: 'Our books are designed for all ages, from newborns to grandparents—a keepsake to treasure for a lifetime.'
  },
  {
    tl:'What can I personalize?',
    ans: 'Personalization varies by book, but every story allows you to customize the name, gender, and appearance of the main character. Depending on the story, you can also add unique details to make the book even more special.'
  },
];

export default function FAQWelcome() {
  return (
    <FAQ FAQs={FAQs} />
  )
}