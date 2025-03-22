import FAQ from "./FAQ";

const FAQs = [
  {
    tl:'01 How can I support Dreamaze on Kickstarter?',
    ans: 'Reserve your spot with just $1 to unlock the best discount and VIP access. Sign up now, and we’ll guide you through the next steps via email!',
    show:true
  },
  {
    tl:'02 What happens after I register?',
    ans: 'Reserve Your Spot – Lock in your exclusive discount with just $1.Back Us on Day One – Complete your purchase when we launch on Kickstarter.Personalize Your Book – After the campaign, customize the details to make it truly yours.Production Begins – Once confirmed, we’ll create your personalized book.Shipping & Delivery – Your book will be printed, packaged, and shipped to you.Enjoy & Share – Experience the magic and share the joy with your loved ones!We’ll guide you every step of the way! 💛'
  },
  {
    tl:'03 When will my book be delivered if I back you on Kickstarter?',
    ans: 'Kickstarter backers will receive their books as part of the first production run, with delivery estimated within 4-6 weeks of the campaign ending.'
  },
  {
    tl:'04 Can I make changes to my personalization after ordering?',
    ans: 'Yes, as long as the book hasn’t entered production.'
  },
  {
    tl:'05 Do you ship internationally?',
    ans: 'Yes, we ship worldwide!'
  },
  {
    tl:'06 What makes Dreamaze books unique?',
    ans: 'Every Dreamaze book is one of a kind. Our stories are 100% original, brought to life with hand-drawn illustrations and heartfelt storytelling. You personalize it with a name and unique details, making it truly yours. With a touch of AI magic, your photo blends seamlessly into the story, creating a keepsake as unique as you are.'
  },

  {
    tl:'07 Can I personalize more than one character?',
    ans: 'Yes! We offer books featuring families and friends, with options for 2-3 characters. We\'re still expanding our collection—reserve now and let us know what you’d love to see.'
  },

  {
    tl:'08 What age group are these books for?',
    ans: 'Our books are designed for all ages, from newborns to grandparents—a keepsake to treasure for a lifetime.'
  },
  {
    tl:'09 What can I personalize?',
    ans: 'Personalization varies by book, but every story allows you to customize the name, gender, and appearance of the main character. Depending on the story, you can also add unique details to make the book even more special.'
  },
];

export default function FAQWelcome() {
  return (
    <FAQ FAQs={FAQs} />
  )
}