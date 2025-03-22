import FAQ from "./FAQ";

const FAQs = [
  {
    tl:'01 What is the reservation deposit?',
    ans: 'By leaving a $1 deposit, you reserve the right to purchase this product at a discount when we launch. This is a binding agreement between you and Dreamaze Book. You retain the right to a refund until the product is delivered.',
    show:true
  },
  {
    tl:'02 When can I get my product?',
    ans: 'During the Prelaunch, you’ll enjoy the lowest-ever exclusive price when you reserve. Please note, this is not a full purchase, and you have the option to cancel or proceed with the purchase later. The product launch and delivery timelines are somewhat unpredictable, but we will provide estimates where possible. If you don’t receive the product within 2 years, you’ll receive a full automatic refund.'
  },
  {
    tl:'03 How can I claim a refund? ',
    ans: 'Claiming a refund is easy. Just email hello@dreamazebook.com from the email you used to reserve the discount. Remember to mention which product you’d like to get a refund for. We’ll process it on the same day, no questions asked!'
  },
  {
    tl:'04 Where can I get more information about this product?',
    ans: 'For any questions regarding Dreamaze Book, feel free to email us at hello@dreamazebook.com. You can also search for Dreamaze Book on our Kickstarter page for more details.'
  },
];

export default function FAQWelcome() {
  return (
    <FAQ FAQs={FAQs} bg="bg-[#FCF2F2]" />
  )
}