import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_ORDER_CREATE } from '@/constants/api';
import { ORDER_CHECKOUT_URL } from '@/constants/links';

interface UseCheckoutProps {
  selectedItems: number[];
}

export const useCheckout = ({ selectedItems }: UseCheckoutProps) => {
  const router = useRouter();
  const t = useTranslations('ShoppingCart');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paypalCheckoutLoading, setPaypalCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | undefined>('');

  const handleCheckout = async (paymentMethod: 'card' | 'paypal' = 'card') => {
    if (selectedItems.length === 0) {
      setError(t('noItemsSelected'));
      return;
    }
    
    // Set the appropriate loading state
    if (paymentMethod === 'paypal') {
      setPaypalCheckoutLoading(true);
    } else {
      setCheckoutLoading(true);
    }
    
    try {
      const { success, code, message, data } = await api.post<ApiResponse>(API_ORDER_CREATE, {
        cart_item_ids: selectedItems,
        payment_method: paymentMethod
      });
      
      if (success) {
        setError('');
        router.push(ORDER_CHECKOUT_URL(data.order.id) + `&paymentMethod=${paymentMethod}`);
      } else if (code == 401) {
        router.push(`/login?redirect=/shopping-cart`);
      }
    } catch (err) {
      setError(t('checkoutFailed'));
    } finally {
      // Clear the appropriate loading state
      if (paymentMethod === 'paypal') {
        setPaypalCheckoutLoading(false);
      } else {
        setCheckoutLoading(false);
      }
    }
  };

  return {
    checkoutLoading,
    paypalCheckoutLoading,
    error,
    setError,
    handleCheckout
  };
};