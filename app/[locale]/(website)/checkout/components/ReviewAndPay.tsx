'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { OrderDetail, OrderDetailResponse } from './types';
import api from '@/utils/api';
import { API_ORDER_STRIPE_PAID } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { useRouter } from 'next/navigation';

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
  const {shipping_address:{email},total_amount} = order;
  const clientSecret = orderDetail.payment_data.client_secret;
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setMessage('Card element not found');
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email,
        },
      },
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      onError?.(error.message || 'Payment failed');
    } else if (paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      // Call API_ORDER_STRIPE_PAID on successful payment
      const {code,success,message,data} = await api.post<ApiResponse>(API_ORDER_STRIPE_PAID,{
        orderId: orderDetail.order.id,
        payment_intent_id: orderDetail.order.stripe_payment_intent_id
      });
      if (success) {
        router.push(`/order-summary?orderId=${orderDetail.order.id}`);
      }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Pay</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800"></h3>
          <p className="text-gray-600">Customer: {email}</p>
          <p className="text-xl font-bold text-gray-900 mt-2">
            Total: ${total_amount}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-white w-full">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay $${total_amount}`
          )}
        </button>

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
  const clientSecret = orderDetail.payment_data.client_secret;
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

  const options = {
    clientSecret,
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