'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import Loading from '../components/Loading';
import api from '@/utils/api';
import { API_ADDRESS_LIST, API_ORDER_DETAIL, API_ORDER_UPDATE_ADDRESS, API_ORDER_UPDATE_SHIPPING } from '@/constants/api';
import { Address, EMPTY_ADDRESS } from '@/types/address';
import CheckoutStep from './components/CheckoutStep';
import ShippingForm from './components/ShippingForm';
import DeliveryOptions from './components/DeliveryOptions';
import ReviewAndPay from './components/ReviewAndPay';
import OrderSummary from './components/OrderSummary';
import { CartItem, ShippingErrors, BillingErrors, PaymentOption, OrderDetail, OrderDetailResponse, ShippingOption } from './components/types';
import { ApiResponse } from '@/types/api';
import useUserStore from '@/stores/userStore';
import AddressCardListModal from './components/AddressCardListModal';

export default function CheckoutPage() {
  const {addresses, fetchAddresses, fetchOrderList} = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse>();

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Step visibility state
  const [openStep, setOpenStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [showAddressListModal, setShowAddressListModal] = useState<boolean>(false);

  // Shipping information state
  const [shippingAddress, setShippingAddress] = useState<Address>(EMPTY_ADDRESS);
  const [showShippingForm, setShowShippingForm] = useState<boolean>(false);

  // Billing address state
  const [needsBillingAddress, setNeedsBillingAddress] = useState<boolean>(false);

  const [billingAddress, setBillingAddress] = useState<Address>(EMPTY_ADDRESS);

  // Delivery options state
  const updateOrderShippingMethod = async (shippingOption: ShippingOption) => {
    setIsLoading(true);
    const {data,success,code,message} = await api.put<ApiResponse>(`${API_ORDER_UPDATE_SHIPPING}/${orderId}`, {shipping_method: shippingOption.code,shipping_cost:shippingOption.cost});
    if (success) {
      setOrderDetail(data);
    }
    setIsLoading(false);
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
            setShippingAddress(data.order.shipping_address);
          }
          if (data.order.billing_address) {
            setBillingAddress(data.order.billing_address);
          }
          if (data.order.shipping_address?.street !== data.order.billing_address?.street) {
            setNeedsBillingAddress(true);
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

  const handleClickAddress = (address: Address) => {
    setShippingAddress(address);
    updateOrderAddress(address);
    setShowAddressListModal(false);
  }

  const handleEditAddress = (address: Address) => {
    setShippingAddress(address);
    setShowAddressListModal(false);
    setShowShippingForm(true);
  }

  const handleApplyCoupon = async (couponCode: string) => {
  }

  const updateOrderAddress = async (address: Address) => {
    if (orderDetail?.order.shipping_address?.street === address.street) {
      if (needsBillingAddress && orderDetail?.order.billing_address?.street === billingAddress.street) {
        console.log('billing');
        return;
      }
      console.log('shipping');
      return;
    }
    const options = {
      shipping_address: address,
      billing_address: address
    };
    if (needsBillingAddress) {
      options.billing_address = billingAddress;
    }
    setIsLoading(true);
    const {data,code,message,success} = await api.put<ApiResponse>(`${API_ORDER_UPDATE_ADDRESS}/${orderId}`, options);
    if (success) {
      setOrderDetail(data);
      fetchOrderList();
    }
    setIsLoading(false);

  }

  // Handle next from shipping step
  const handleNextFromShipping = async() => {
    if (orderDetail?.order.shipping_address.street === shippingAddress.street) {
      setCompletedSteps([...completedSteps, 1]);
      setOpenStep(2);
      return;
    }
    
    let url = API_ADDRESS_LIST;
    let method = api.post;
    if (shippingAddress?.id) {
      url = API_ADDRESS_LIST + '/' + shippingAddress.id;
      method = api.put;
    }
    setIsLoading(true);
    const {data,success,code,message} = await method<ApiResponse>(url, shippingAddress);
    setIsLoading(false);
    if (success) {
      fetchAddresses({refresh:true});

      updateOrderAddress(data);

      setCompletedSteps([...completedSteps, 1]);
      setOpenStep(2);
      
    } else {
      alert(message);
      return;
    }
  };

  // Handle next from delivery step
  const handleNextFromDelivery = () => {
    setCompletedSteps([...completedSteps, 2]);
    setOpenStep(3);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <Loading isLoading={isLoading} />
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>
        {error && <div className="text-center text-red-500 py-4">{error}</div>}

        {showAddressListModal && <AddressCardListModal handleClickAddress={handleClickAddress} handleEditAddress={handleEditAddress} handleCloseModal={() => setShowAddressListModal(false)} addressList={addresses} />}
        
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
              {orderDetail &&
              <ShippingForm
                orderDetail={orderDetail}
                address={shippingAddress}
                setAddress={setShippingAddress}
                billingAddress={billingAddress}
                setBillingAddress={setBillingAddress}
                needsBillingAddress={needsBillingAddress}
                setNeedsBillingAddress={setNeedsBillingAddress}
                handleNextFromShipping={handleNextFromShipping}
                setShowAddressListModal={setShowAddressListModal}
                showShippingForm={showShippingForm}
                setShowShippingForm={setShowShippingForm}
              />
              }
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
          <div className="lg:w-1/3 relative">
            <OrderSummary
              orderDetail={orderDetail}
              handleApplyCoupon={handleApplyCoupon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}