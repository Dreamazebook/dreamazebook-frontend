import ShippingEstimator from './ShippingEstimator';

export default function DeliveryInformation() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6 text-black">Delivery Information</h1>
        
        <h2 className="text-3xl font-bold mt-8 mb-4 text-black">How long will it take to receive my order?</h2>
        <p className="mb-4 leading-relaxed text-gray-800">
          We ship worldwide 🌍. To meet different needs, we usually offer 2–3 shipping options for you to choose from.
        </p>
        
        <p className="mb-4 leading-relaxed text-gray-800">
          To see the delivery times for your location, simply select your country from the destination options below. 
          Please note these are estimated times only – your exact delivery estimate will be shown during checkout.
        </p>
        
        <p className="mb-4 leading-relaxed text-gray-800">
          Every Dreamaze book is made especially for your loved one, and beautiful things take a little more time ✨.
        </p>
        
        <p className="mb-4 leading-relaxed text-gray-800">
          If you've already placed an order and have questions about shipping, feel free to reach us at{' '}
          <a href="mailto:hello@dreamazebook.com" className="text-blue-600 underline hover:text-blue-800">hello@dreamazebook.com</a> – we're here to help.
        </p>

        <div className="mt-8">
          {/* Shipping estimator client component */}
          <ShippingEstimator />
        </div>
      </div>
  );
}
