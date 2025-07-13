'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutStep from './components/CheckoutStep';
import ShippingForm from './components/ShippingForm';
import BillingAddressForm from './components/BillingAddressForm';
import DeliveryOptions from './components/DeliveryOptions';
import ReviewAndPay from './components/ReviewAndPay';
import OrderSummary from './components/OrderSummary';
import { CartItem, ShippingErrors, BillingErrors, DeliveryOption, PaymentOption } from './components/types';

export default function CheckoutPage() {
  const router = useRouter();

  // Mock cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "The Dream Maze",
      format: "Hardcover",
      box: "Special Edition Box",
      image: "/images/book-cover.jpg",
      price: 29.99,
      quantity: 1
    },
    {
      id: 2,
      name: "The Dream Maze",
      format: "E-book",
      image: "/images/ebook-cover.jpg",
      price: 14.99,
      quantity: 1
    }
  ]);

  // Step visibility state
  const [openStep, setOpenStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Shipping information state
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [zip, setZip] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [errors, setErrors] = useState<ShippingErrors>({});

  // Billing address state
  const [needsBillingAddress, setNeedsBillingAddress] = useState<boolean>(false);
  const [billingEmail, setBillingEmail] = useState<string>('');
  const [billingFirstName, setBillingFirstName] = useState<string>('');
  const [billingLastName, setBillingLastName] = useState<string>('');
  const [billingAddress, setBillingAddress] = useState<string>('');
  const [billingCity, setBillingCity] = useState<string>('');
  const [billingZip, setBillingZip] = useState<string>('');
  const [billingCountry, setBillingCountry] = useState<string>('');
  const [billingState, setBillingState] = useState<string>('');
  const [billingErrors, setBillingErrors] = useState<BillingErrors>({});

  // Delivery options state
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption>('Standard');

  // Payment state
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption>(null);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');

  // Toggle step visibility
  const toggleStep = (stepNumber: number) => {
    if (openStep === stepNumber) {
      return; // Don't close the current open step
    }
    
    // Only allow opening completed steps or the next step
    if (completedSteps.includes(stepNumber) || stepNumber === openStep + 1) {
      setOpenStep(stepNumber);
    }
  };

  // Validate shipping information
  const validateShippingInfo = () => {
    const newErrors: ShippingErrors = {};
    
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";
    
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!address) newErrors.address = "Address is required";
    if (!city) newErrors.city = "City is required";
    if (!zip) newErrors.zip = "ZIP code is required";
    if (!country) newErrors.country = "Country is required";
    if (!state) newErrors.state = "State is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate billing information
  const validateBillingInfo = () => {
    if (!needsBillingAddress) return true;
    
    const newErrors: BillingErrors = {};
    
    if (!billingEmail) newErrors.billingEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(billingEmail)) newErrors.billingEmail = "Invalid email address";
    
    if (!billingFirstName) newErrors.billingFirstName = "First name is required";
    if (!billingLastName) newErrors.billingLastName = "Last name is required";
    if (!billingAddress) newErrors.billingAddress = "Address is required";
    
    setBillingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next from shipping step
  const handleNextFromShipping = () => {
    if (validateShippingInfo() && validateBillingInfo()) {
      setCompletedSteps([...completedSteps, 1]);
      setOpenStep(2);
    }
  };

  // Handle next from delivery step
  const handleNextFromDelivery = () => {
    setCompletedSteps([...completedSteps, 2]);
    setOpenStep(3);
  };

  // Handle place order
  const handlePlaceOrder = () => {
    // In a real application, you would submit the order to your backend here
    console.log("Order placed!");
    router.push('/order-confirmation');
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {/* Step 1: Shipping Information */}
            <CheckoutStep
              stepNumber={1}
              title="Shipping Information"
              isOpen={openStep === 1}
              isCompleted={completedSteps.includes(1)}
              onToggle={() => toggleStep(1)}
              canOpen={true}
            >
              <ShippingForm
                email={email}
                setEmail={setEmail}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                address={address}
                setAddress={setAddress}
                city={city}
                setCity={setCity}
                zip={zip}
                setZip={setZip}
                country={country}
                setCountry={setCountry}
                state={state}
                setState={setState}
                errors={errors}
                setErrors={setErrors}
                needsBillingAddress={needsBillingAddress}
                setNeedsBillingAddress={setNeedsBillingAddress}
                handleNextFromShipping={handleNextFromShipping}
              />
              
              {needsBillingAddress && (
                <BillingAddressForm
                  billingEmail={billingEmail}
                  setBillingEmail={setBillingEmail}
                  billingFirstName={billingFirstName}
                  setBillingFirstName={setBillingFirstName}
                  billingLastName={billingLastName}
                  setBillingLastName={setBillingLastName}
                  billingAddress={billingAddress}
                  setBillingAddress={setBillingAddress}
                  billingCity={billingCity}
                  setBillingCity={setBillingCity}
                  billingZip={billingZip}
                  setBillingZip={setBillingZip}
                  billingCountry={billingCountry}
                  setBillingCountry={setBillingCountry}
                  billingState={billingState}
                  setBillingState={setBillingState}
                  billingErrors={billingErrors}
                  setBillingErrors={setBillingErrors}
                />
              )}
            </CheckoutStep>
            
            {/* Step 2: Delivery Options */}
            <CheckoutStep
              stepNumber={2}
              title="Delivery Options"
              isOpen={openStep === 2}
              isCompleted={completedSteps.includes(2)}
              onToggle={() => toggleStep(2)}
              canOpen={completedSteps.includes(1)}
            >
              <DeliveryOptions
                selectedDeliveryOption={selectedDeliveryOption}
                setSelectedDeliveryOption={setSelectedDeliveryOption}
                handleNextFromDelivery={handleNextFromDelivery}
              />
            </CheckoutStep>
            
            {/* Step 3: Review and Pay */}
            <CheckoutStep
              stepNumber={3}
              title="Review and Pay"
              isOpen={openStep === 3}
              isCompleted={completedSteps.includes(3)}
              onToggle={() => toggleStep(3)}
              canOpen={completedSteps.includes(2)}
            >
              <ReviewAndPay
                selectedPaymentOption={selectedPaymentOption}
                setSelectedPaymentOption={setSelectedPaymentOption}
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                cardName={cardName}
                setCardName={setCardName}
                cardExpiry={cardExpiry}
                setCardExpiry={setCardExpiry}
                cardCvc={cardCvc}
                setCardCvc={setCardCvc}
                handlePlaceOrder={handlePlaceOrder}
              />
            </CheckoutStep>
          </div>
          
          {/* Right column - Order summary */}
          <div className="lg:w-1/3">
            <OrderSummary
              cartItems={cartItems}
              selectedDeliveryOption={selectedDeliveryOption}
            />
          </div>
        </div>
      </div>
    </div>
  );
}