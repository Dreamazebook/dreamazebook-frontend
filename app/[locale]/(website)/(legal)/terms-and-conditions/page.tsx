import { HELLO_EMAIL } from '@/constants/text';

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-black mb-6">User Generated Content (UGC) Terms</h1>
        <p className="text-gray-800 leading-relaxed mb-4">
          By replying to our request with <strong className="font-semibold">#YESDREAMAZEBOOK</strong>, or by submitting your photos, videos, 
          reviews, or posts to us in any other way, you agree to the following terms:
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. License You Give Us</h2>
        <p className="text-gray-800 leading-relaxed mb-4">
          You grant [BRAND] a worldwide, royalty-free, non-exclusive, perpetual license to use, copy, modify, 
          reproduce, publish, and distribute your content across all media (including our website, social channels, 
          emails, and advertising).
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Use of Your Name & Likeness</h2>
        <p className="text-gray-800 leading-relaxed mb-4">
          You agree that we may use your name, username, profile image, likeness, and any other information you 
          provide alongside the content.
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Your Promises to Us</h2>
        <p className="text-gray-800 leading-relaxed mb-4">By giving us content, you confirm that:</p>
        <ul className="list-disc ml-8 text-gray-800 leading-relaxed mb-4">
          <li className="mb-2">You created the content or have full rights and permission to share it.</li>
          <li className="mb-2">You are at least 18 years old, or a parent/guardian if the content shows minors.</li>
          <li className="mb-2">The content does not infringe anyone else's rights or break any laws.</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. No Compensation</h2>
        <p className="text-gray-800 leading-relaxed mb-4">
          You understand that you will not be paid for our use of your content, unless we agree otherwise in writing.
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Removal</h2>
        <p className="text-gray-800 leading-relaxed mb-4">
          If at any time you want us to stop using your content, email{' '}
          <a href={`mailto:${HELLO_EMAIL}`} className="text-blue-600 underline hover:text-blue-800">{HELLO_EMAIL}</a> and we'll remove it from our active 
          marketing channels where reasonably possible.
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. Our Rights</h2>
        <p className="text-gray-800 leading-relaxed mb-4">
          We are not obliged to use your content, and we may remove it at any time at our discretion.
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. Changes</h2>
        <p className="text-gray-800 leading-relaxed mb-4">
          We may update these terms at any time. Please check back for the latest version before granting consent.
        </p>
      </div>
    </div>
  );
}
