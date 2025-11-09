import ShippingEstimator from './ShippingEstimator';

export default function DeliveryInformation() {
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
        <h1>Delivery Information</h1>
        
        <h2>How long will it take to receive my order?</h2>
        <p>
          We ship worldwide 🌍. To meet different needs, we usually offer 2–3 shipping options for you to choose from.
        </p>
        
        <p>
          To see the delivery times for your location, simply select your country from the destination options below. 
          Please note these are estimated times only – your exact delivery estimate will be shown during checkout.
        </p>
        
        <p>
          Every Dreamaze book is made especially for your loved one, and beautiful things take a little more time ✨.
        </p>
        
        <p>
          If you've already placed an order and have questions about shipping, feel free to reach us at{' '}
          <a href="mailto:hello@dreamazebook.com">hello@dreamazebook.com</a> – we're here to help.
        </p>

        <div className="mt-8">
          {/* Shipping estimator client component */}
          <ShippingEstimator />
        </div>
      </div>
    </div>
  );
}
