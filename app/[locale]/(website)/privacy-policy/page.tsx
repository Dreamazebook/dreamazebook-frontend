
export default function PrivacyPolicy() {
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
        <h1>Privacy Policy</h1>
        <p><strong>Effective date: 30/10/2025</strong></p>
        <p>
          Company: [Your Brand Name] ("we", "our", "us")
        </p>
        <p>
          We care about your privacy. This Privacy Policy explains what information we collect, how we use it, 
          how long we keep it, and the rights you have.
        </p>
        
        <hr />
        
        <h2>1. Information We Collect</h2>
        <p>When you use our website and services, we may collect the following information:</p>
        <ul>
          <li>
            <strong>Personal information:</strong> name, email address, shipping and billing details, payment 
            information (processed securely by third-party providers).
          </li>
          <li>
            <strong>Child personalization details:</strong> child's first name, age, gender, or other traits you 
            provide to personalize the book.
          </li>
          <li>
            <strong>Photos:</strong> images you upload to create a preview or personalize a product.
          </li>
          <li>
            <strong>Technical data:</strong> device type, browser, IP address, cookies, and browsing activity on 
            our site.
          </li>
        </ul>
        
        <hr />
        
        <h2>2. How We Use Your Information</h2>
        <p>We use your information only to:</p>
        <ul>
          <li>Provide and deliver personalized products (e.g., generating previews and printing books).</li>
          <li>Process and fulfill your orders.</li>
          <li>Communicate with you about your purchase, promotions, or service updates.</li>
          <li>Improve our products, services, and website performance.</li>
          <li>Comply with legal obligations (tax, accounting, fraud prevention).</li>
        </ul>
        <p><strong>We do not sell your personal information.</strong></p>
        
        <hr />
        
        <h2>3. Photos and Preview Data</h2>
        <p>
          Because our books are personalized, we may ask you to upload photos and provide personalization details.
        </p>
        <ul>
          <li>
            <strong>Temporary uploads (previews not saved by you):</strong> deleted within 24 hours.
          </li>
          <li>
            <strong>Saved previews / orders:</strong> stored securely for up to 24 months, then permanently deleted.
          </li>
          <li>
            If you delete your account or request erasure, we will remove all related data sooner, except where 
            retention is required by law (e.g., tax or payment records).
          </li>
        </ul>
        <p>
          This retention period is designed to comply with GDPR (EU/UK), CCPA/CPRA (California) and other data 
          protection frameworks, which require that personal data be kept no longer than necessary for the purpose 
          for which it was collected.
        </p>
        
        <hr />
        
        <h2>4. Sharing of Information</h2>
        <p>We only share your information with trusted partners, including:</p>
        <ul>
          <li>Printing and fulfillment providers (to produce and deliver your book).</li>
          <li>Payment processors (for secure payment handling).</li>
          <li>
            Analytics and marketing providers (for site performance and communication, subject to cookie preferences).
          </li>
        </ul>
        <p>All partners are bound by contractual data protection obligations.</p>
        
        <hr />
        
        <h2>5. Security</h2>
        <p>
          We use appropriate technical and organizational measures to protect your personal data, including 
          encryption, secure servers, and restricted access.
        </p>
        
        <hr />
        
        <h2>6. Your Rights</h2>
        <p>
          Depending on your location (EU/UK, US, or other regions), you have the right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Withdraw consent at any time (this will not affect processing already carried out).</li>
          <li>Opt out of marketing communications.</li>
          <li>File a complaint with your local data protection authority.</li>
        </ul>
        <p>
          You can exercise your rights by emailing{' '}
          <a href="mailto:hello@dreamazebook.com">hello@dreamazebook.com</a>.
        </p>
        
        <hr />
        
        <h2>7. Children's Privacy</h2>
        <p>
          Our products are designed for parents and gift buyers. We only collect children's details (name, age, 
          gender, photo) when provided by an adult user for personalization. We do not knowingly collect information 
          directly from children.
        </p>
        
        <hr />
        
        <h2>8. International Data Transfers</h2>
        <p>
          If you are outside [your country of incorporation], your data may be transferred to and processed in other 
          countries where our service providers are located. These transfers comply with applicable laws and 
          safeguards (e.g., EU Standard Contractual Clauses).
        </p>
        
        <hr />
        
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with the 
          revised effective date.
        </p>
        
        <hr />
        
        <h2>10. Contact Us</h2>
        <p>
          If you have any questions or requests regarding this Privacy Policy, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:hello@dreamazebook.com">hello@dreamazebook.com</a>
          <br />
          <strong>Address:</strong> 32 rue de Paris, 92100, Boulogne-Billancourt
        </p>
      </div>
    </div>
  );
}