'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { API_ADDRESS_LIST, API_CREATE_STRIPE_PAYMENT, API_ORDER_DETAIL, API_ORDER_UPDATE_ADDRESS, API_ORDER_UPDATE_SHIPPING } from '@/constants/api';
import { Address, EMPTY_ADDRESS } from '@/types/address';
import CheckoutStep from './components/CheckoutStep';
import ShippingForm from './components/ShippingForm';
import BillingAddressForm from './components/BillingAddressForm';
import DeliveryOptions from './components/DeliveryOptions';
import ReviewAndPay from './components/ReviewAndPay';
import OrderSummary from './components/OrderSummary';
import { CartItem, ShippingErrors, BillingErrors, PaymentOption, OrderDetail, OrderDetailResponse, ShippingOption } from './components/types';
import { ApiResponse } from '@/types/api';
import useUserStore from '@/stores/userStore';

export default function CheckoutPage() {
  const {addresses, fetchAddresses, fetchOrderList} = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse>();

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Address list state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Step visibility state
  const [openStep, setOpenStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Shipping information state
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
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
  const updateOrderShippingMethod = async (shippingOption: ShippingOption) => {
    const {data,success,code,message} = await api.put<ApiResponse>(`${API_ORDER_UPDATE_SHIPPING}/${orderId}`, {shipping_method: shippingOption.code,shipping_cost:shippingOption.cost});
    if (success) {
      setOrderDetail(data);
    }
  }

  // Payment state
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption>(null);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');

  // Fetch order details if orderId is present
  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const {data,code,message,success} = await api.get<ApiResponse<OrderDetailResponse>>(`${API_ORDER_DETAIL}/${orderId}`);
          // Transform order items to cart items format
          //Todo: remove stripe_client_secret
          if (!data?.order) return;
          setOrderDetail(data);
          if (data.order.shipping_address) {
            setSelectedAddressId(data.order.shipping_address.id);
          }
        } catch (err) { 
          setError('Failed to load order details');
          console.error('Error fetching order details:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [orderId]);

  // Fetch user addresses when component mounts
  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(()=>{
    if (selectedAddressId) {
      const address = addresses.find((address) => address.id === selectedAddressId);
      if (address && (address.id !== orderDetail?.order?.shipping_address?.id)) {
        console.log('update address');
        updateOrderAddress(address);
      }
    }
  },[selectedAddressId])

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
    
    if (!address.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(address.email)) newErrors.email = "Invalid email address";
    
    if (!address.first_name) newErrors.first_name = "First name is required";
    if (!address.last_name) newErrors.last_name = "Last name is required";
    if (!address.street) newErrors.address = "Address is required";
    if (!address.city) newErrors.city = "City is required";
    if (!address.post_code) newErrors.post_code = "Postal code is required";
    if (!address.country) newErrors.country = "Country is required";
    if (!address.state) newErrors.state = "State is required";
    
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

  const updateOrderAddress = async (address: Address) => {
    const {data,code,message,success} = await api.put<ApiResponse>(`${API_ORDER_UPDATE_ADDRESS}/${orderId}`, {shipping_address: address})
    if (success) {
      setOrderDetail(data);
      fetchOrderList();
    }

  }

  // Handle next from shipping step
  const handleNextFromShipping = async() => {
    if (validateShippingInfo() && validateBillingInfo()) {
      let url = API_ADDRESS_LIST;
      let method = api.post;
      if (address?.id) {
        url = API_ADDRESS_LIST + '/' + address.id;
        method = api.put;
      }
      const {data,success,code,message} = await method<ApiResponse>(url, address);
      if (success) {
        setAddress(EMPTY_ADDRESS);
        fetchAddresses({refresh:true});
        setSelectedAddressId(data.id);

        updateOrderAddress(data);
        
      } else {
        alert(message);
        return;
      }
    }
    setCompletedSteps([...completedSteps, 1]);
    setOpenStep(2);
  };

  // Handle next from delivery step
  const handleNextFromDelivery = () => {
    setCompletedSteps([...completedSteps, 2]);
    setOpenStep(3);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>
        
        {isLoading && <div className="text-center py-4">Loading order details...</div>}
        {error && <div className="text-center text-red-500 py-4">{error}</div>}
        
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
                address={address}
                setAddress={setAddress}
                errors={errors}
                setErrors={setErrors}
                needsBillingAddress={needsBillingAddress}
                setNeedsBillingAddress={setNeedsBillingAddress}
                handleNextFromShipping={handleNextFromShipping}
                addressList={addresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
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
            {orderDetail && 
              <DeliveryOptions
                orderDetail={orderDetail?.order}
                updateOrderShippingMethod={updateOrderShippingMethod}
                handleNextFromDelivery={handleNextFromDelivery}
              />
            }
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
              {orderDetail && 
              <ReviewAndPay
                orderDetail={orderDetail}
                // selectedPaymentOption={selectedPaymentOption}
                // setSelectedPaymentOption={setSelectedPaymentOption}
                // cardNumber={cardNumber}
                // setCardNumber={setCardNumber}
                // cardName={cardName}
                // setCardName={setCardName}
                // cardExpiry={cardExpiry}
                // setCardExpiry={setCardExpiry}
                // cardCvc={cardCvc}
                // setCardCvc={setCardCvc}
              />
              }
            </CheckoutStep>
          </div>
          
          {/* Right column - Order summary */}
          <div className="lg:w-1/3">
            <OrderSummary
              orderDetail={orderDetail}
            />
          </div>
        </div>
      </div>
    </div>
  );
}