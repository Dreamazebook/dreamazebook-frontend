export default function TermsAndConditions() {
  return (
    <div className="prose prose-lg max-w-4xl mx-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        .terms-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #000000;
        }
        .terms-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #000000;
        }
        .terms-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #000000;
        }
        .terms-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #222222;
        }
        .terms-content ul, .terms-content ol {
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        .terms-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .terms-content a {
          color: #0066cc;
          text-decoration: underline;
        }
        .terms-content a:hover {
          color: #004499;
        }
        .terms-content strong {
          font-weight: 600;
        }
        .terms-content hr {
          border: 0;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
      ` }} />
      
      <div className="terms-content">
        <h1>User Generated Content (UGC) Terms</h1>
        <p>
          By replying to our request with <strong>#YESDREAMAZEBOOK</strong>, or by submitting your photos, videos, 
          reviews, or posts to us in any other way, you agree to the following terms:
        </p>
        
        <h2>1. License You Give Us</h2>
        <p>
          You grant [BRAND] a worldwide, royalty-free, non-exclusive, perpetual license to use, copy, modify, 
          reproduce, publish, and distribute your content across all media (including our website, social channels, 
          emails, and advertising).
        </p>
        
        <h2>2. Use of Your Name & Likeness</h2>
        <p>
          You agree that we may use your name, username, profile image, likeness, and any other information you 
          provide alongside the content.
        </p>
        
        <h2>3. Your Promises to Us</h2>
        <p>By giving us content, you confirm that:</p>
        <ul>
          <li>You created the content or have full rights and permission to share it.</li>
          <li>You are at least 18 years old, or a parent/guardian if the content shows minors.</li>
          <li>The content does not infringe anyone else's rights or break any laws.</li>
        </ul>
        
        <h2>4. No Compensation</h2>
        <p>
          You understand that you will not be paid for our use of your content, unless we agree otherwise in writing.
        </p>
        
        <h2>5. Removal</h2>
        <p>
          If at any time you want us to stop using your content, email{' '}
          <a href="mailto:hello@dreamazebook.com">hello@dreamazebook.com</a> and we'll remove it from our active 
          marketing channels where reasonably possible.
        </p>
        
        <h2>6. Our Rights</h2>
        <p>
          We are not obliged to use your content, and we may remove it at any time at our discretion.
        </p>
        
        <h2>7. Changes</h2>
        <p>
          We may update these terms at any time. Please check back for the latest version before granting consent.
        </p>
      </div>
    </div>
  );
}
