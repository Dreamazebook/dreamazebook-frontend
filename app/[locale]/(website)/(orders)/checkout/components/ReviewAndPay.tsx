'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { OrderDetail } from '@/types/order';
import api from '@/utils/api';
import { API_ORDER_STRIPE_PAID } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { useRouter } from '@/i18n/routing';
import DisplayPrice from '../../../components/component/DisplayPrice';
import NextStepButton from './NextStepButton';
import { ORDER_SUMMARY_URL } from '@/constants/links';
import OrderSummaryDelivery from '../../../components/component/OrderSummaryDelivery';
import OrderSummary from './OrderSummary';
import CartItemCard from '../../shopping-cart/components/CartItemCard';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ReviewAndPayProps {
  paymentMethod?: string;
  orderDetail: OrderDetail;
  handlePlaceOrder?: () => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<{
  orderDetail: OrderDetail;
  paymentMethod?: string;
  onError?: (error: string) => void;
}> = ({ orderDetail, paymentMethod, onError }) => {
  const t = useTranslations('checkoutPage');
  const order = orderDetail;
  const {shipping_address,total_amount} = order;
  const clientSecret = orderDetail.stripe_client_secret;
  const stripe = useStripe();
  const elements = useElements();
  
  const isStripeReady = useMemo(() => stripe && elements, [stripe, elements]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

    if (!clientSecret) {
      setMessage(t("errorLoadingOrder"));
      onError?.(t("errorLoadingOrder"));
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
      setMessage(t("cardInformation"));
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.origin + ORDER_SUMMARY_URL(orderDetail.id),
        receipt_email: shipping_address?.email || undefined,
      },
    });

    if (error) {
      setMessage(error.message || t("paymentStatusUnknown"));
      onError?.(error.message || t("paymentFailed"));
      return;
    }

    switch (paymentIntent?.status) {
      case 'succeeded':
        setMessage(t("paymentSuccess"));
        try {
          const { success } = await api.post<ApiResponse>(API_ORDER_STRIPE_PAID, {
            order_id: orderDetail.id,
            payment_intent_id: orderDetail.stripe_payment_intent_id
          });
          if (success) {
            router.push(ORDER_SUMMARY_URL(orderDetail.id));
          } else {
            setMessage(t("errorLoadingOrder"));
          }
        } catch (error) {
          setMessage(t("paymentFailed"));
          onError?.(t("paymentFailed"));
        }
        break;
      case 'processing':
        setMessage(t("paymentProcessing"));
        break;
      case 'requires_payment_method':
        setMessage(t("paymentFailed"));
        break;
      default:
        setMessage(t("paymentStatusUnknown"));
    }

    setIsLoading(false);
  };

  const paymentElementOptions: any = {
    layout: "tabs",
    defaultValues: {
      billingDetails: {
        email: shipping_address?.email
      }
    },
    defaultPaymentMethod: paymentMethod,
    paymentMethodOrder: paymentMethod == 'paypal' ? ['paypal','card'] : ['card','paypal'],
    // wallets: {
    //   applePay: 'never',
    //   googlePay: 'never'
    // }
  };

  return (
    <div className="bg-white p-6 rounded shadow">

      <h3 className='text-[22px] md:text-[26px] mb-[16px]'>Order Summary</h3>

      {orderDetail.items.map((item) => (
        <CartItemCard key={item.id} item={item} />
      ))}

      <h3 className='text-[22px] md:text-[26px] mb-[16px] border-t border-[#E5E5E5] pt-[16px] mt-[16px]'>Order Details</h3>

      <OrderSummaryDelivery orderDetail={orderDetail} showDate={false} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[22px] md:text-[26px] mb-2">
            {t("cardInformation")}
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-white w-full">
            <PaymentElement options={paymentElementOptions} />
          </div>
        </div>

        <div className='flex flex-col justify-center gap-3 mt-4'>
          <p className='text-center text-gray-500'>{t("completePaymentSecure")}</p>
          <NextStepButton
            type='submit'
            disabled={!stripe || isLoading}
            handleOnClick={()=>{}}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t("processing")}
              </div>
            ) : (
              t("completePayment")
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
  paymentMethod = 'card',
  orderDetail,
  onError,
}) => {
  const t = useTranslations('checkoutPage');
  const clientSecret = orderDetail.stripe_client_secret;
  if (!clientSecret) {
    onError?.(t("errorLoadingOrder"));
    return;
  }
  const [stripeError, setStripeError] = useState<string>('');

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError(t("errorLoadingOrder"));
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
        paymentMethod={paymentMethod}
        orderDetail={orderDetail}
        onError={onError}
      />
    </Elements>
  );
};

export default ReviewAndPay;