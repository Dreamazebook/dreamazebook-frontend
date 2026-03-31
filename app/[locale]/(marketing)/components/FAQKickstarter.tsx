import { KICKSTARTER_URL } from "@/constants/links";
import FAQ from "./FAQ";
import Button from "@/app/components/Button";

const FAQs = [
  {
    tl:'Why Kickstarter?',
    ans: (<>We’re a small startup. Kickstarter works like a pre-order platform — with your support, we can finalize our website and bring Dreamaze to families sooner.<br/>
 As a thank you, all books are offered at special launch prices you’ll never see again.</>),
    show:true
  },
  {
    tl:'How to place an order?',
    ans: <ul role="list" className="list-disc marker:text-sky-400">
      <li>Click <span className="font-bold">“Back this project”</span></li>
      <li>Choose your reward (the bundle you want)</li>
      <li>Hit <span className="font-bold">“Pledge”</span> (this is your order)</li>
      <li>
        Pay by card — just like any online shop<br/>
        <span className="italic">💡 You won’t be charged until the project reaches its funding goal.</span>
      </li>
    </ul>
  },
  {
    tl:'How and when can I choose the book?',
    ans: <>
      <p>Right now, you only need to choose the <span className="font-bold">book format and bundle</span> to lock the best price.</p>
      <p>After the campaign ends in October, you’ll be invited to our website.</p>
      <p>Simply <span className="font-bold">log in with your Kickstarter purchase email — there you’ll see your order details and choose any of the 5 books, then personalize it with your child’s photo and name.</span></p>
    </>
  },
  {
    tl:'How do I personalize the book?',
    ans: <>
      <p>When you log in to our website after the campaign, it’s just 3 simple steps:</p>
      <ul>
        <li>- Write your child’s name</li>
        <li>- Choose features (skin tone, hairstyle, etc.)</li>
        <li>- Upload a photo → preview sample pages instantly</li>
        <li>✨ Personalization options vary by book, but every book lets you: add your child’s <span className="font-bold">name</span>, upload their <span className="font-bold">photo</span>, write a dedication message on the first page</li>
        <li>(Some books include even more custom options!)</li>
      </ul>
    </>
  },
  {
    tl:'When will I receive it?',
    ans: <>
      <p>After personalization:</p>
      <ul>
        <li>Production: 2–4 business days</li>
        <li>Shipping: around 10 days</li>
        <li> 📦 Most backers will receive their books in <span className="font-bold">November–December</span>, right in time for the holidays.</li>
      </ul>
    </>
  },
  {
    tl:'Is it safe with Kickstarter?',
    ans: <>
      <p>Yes! Kickstarter is a trusted crowdfunding platform.</p>
      <p> 💳 Your card <span className="font-bold">won’t be charged right away</span> — pledging is simply a way to show your support.</p>
      <p> Only if our project reaches its funding goal at the end of the campaign will your payment be processed.</p>
    </>
  },

  {
    tl:'What if the project doesn’t reach its goal?',
    ans: <p>If our campaign doesn’t succeed, your card will not be charged.<br/>
        We’ll still launch our website later, but more slowly.<br/>
        That’s why your support now truly makes a difference 💛.</p>
  },

  {
    tl:'Where do you ship & how much is shipping?',
    ans: <p>
      📦 We ship worldwide 🌍<br/>
      💲 Shipping fee: around $10–15<br/>
      💛 First 20 backers get FREE shipping<br/>
    </p>
  },
];

export default function FAQKickstarter() {
  return (<>
    <FAQ FAQs={FAQs} bg="pb-0" />
    <div className="mt-10 max-w-[334px] mx-auto">
      <Button url={KICKSTARTER_URL} tl={'Count me in – I’m backing this project!'} />
    </div>
    </>
  )
}