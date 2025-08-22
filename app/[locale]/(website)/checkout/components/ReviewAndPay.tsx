'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { OrderDetail, OrderDetailResponse } from './types';
import api from '@/utils/api';
import { API_ORDER_STRIPE_PAID } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { useRouter } from '@/i18n/routing';
import DisplayPrice from '../../components/component/DisplayPrice';
import NextStepButton from './NextStepButton';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ReviewAndPayProps {
  orderDetail: OrderDetailResponse;
  handlePlaceOrder?: () => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<{
  orderDetail: OrderDetailResponse;
  onError?: (error: string) => void;
}> = ({ orderDetail, onError }) => {
  const order = orderDetail.order;
  const {shipping_address,total_amount} = order;
  const clientSecret = orderDetail.payment_data?.client_secret;
  const stripe = useStripe();
  const elements = useElements();
  
  const isStripeReady = useMemo(() => stripe && elements, [stripe, elements]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  if (!clientSecret) {
    setMessage('Payment data is incomplete');
    onError?.('Payment data is incomplete');
    return;
  }

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage('');

    const paymentElement = elements.getElement(PaymentElement);

    if (!paymentElement) {
      setMessage('Card element not found');
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.origin + `/order-summary?orderId=${orderDetail.order.id}`,
        receipt_email: shipping_address?.email || undefined,
      },
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      onError?.(error.message || 'Payment failed');
      return;
    }

    switch (paymentIntent?.status) {
      case 'succeeded':
        setMessage('Payment succeeded!');
        try {
          const { success } = await api.post<ApiResponse>(API_ORDER_STRIPE_PAID, {
            order_id: orderDetail.order.id,
            payment_intent_id: orderDetail.order.stripe_payment_intent_id
          });
          if (success) {
            router.push(`/order-summary?orderId=${orderDetail.order.id}`);
          } else {
            setMessage('Failed to update order status');
          }
        } catch (error) {
          setMessage('Failed to process payment');
          onError?.('Failed to process payment');
        }
        break;
      case 'processing':
        setMessage('Payment processing. We will update you when payment is received.');
        break;
      case 'requires_payment_method':
        setMessage('Payment failed. Please try another payment method.');
        break;
      default:
        setMessage('Payment status unknown. Please contact support.');
    }

    setIsLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800"></h3>
          {/* <p className="text-gray-600">Customer: {email}</p> */}
          <p className="text-xl font-bold text-gray-900 mt-2">
            Total: <DisplayPrice value={total_amount} />
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-white w-full">
            <PaymentElement />
          </div>
        </div>

        <div className='flex flex-col justify-center gap-3 mt-4'>
          <p className='text-center text-gray-500'>Complete your payment with one of our secure checkout methods.</p>
          <NextStepButton
            type='submit'
            disabled={!stripe || isLoading}
            handleOnClick={()=>{}}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              'Complete Payment'
            )}
          </NextStepButton>
        </div>

        

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes('succeeded')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

const ReviewAndPay: React.FC<ReviewAndPayProps> = ({
  orderDetail,
  onError,
}) => {
  const clientSecret = orderDetail.payment_data?.client_secret;
  if (!clientSecret) {
    onError?.('Payment data is incomplete');
    return;
  }
  const [stripeError, setStripeError] = useState<string>('');

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Stripe publishable key is not configured');
    }
  }, []);

  if (stripeError) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="bg-red-100 text-red-700 p-3 rounded-md">
          Error: {stripeError}
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="bg-yellow-100 text-yellow-700 p-3 rounded-md">
          Loading payment form...
        </div>
      </div>
    );
  }

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#0d7377",
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorDanger: "#ef4444",
      fontFamily: "system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  };

  const options = {
    clientSecret,
    appearance
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        orderDetail={orderDetail}
        onError={onError}
      />
    </Elements>
  );
};

export default ReviewAndPay;