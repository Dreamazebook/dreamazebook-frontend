import { useState, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_ORDER_CREATE, API_CART_LIST } from '@/constants/api';
import { ORDER_CHECKOUT_URL } from '@/constants/links';
import useUserStore from '@/stores/userStore';
import { fbTrackCustom, getContentIdBySpu } from '@/utils/track';

interface UseCheckoutProps {
  selectedItems: number[];
}

// Track CheckoutAttempt only once per session
let checkoutAttemptTracked = false;

export const useCheckout = ({ selectedItems }: UseCheckoutProps) => {
  const router = useRouter();
  const t = useTranslations('ShoppingCart');

  const {openLoginModal, isLoggedIn} = useUserStore();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paypalCheckoutLoading, setPaypalCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | undefined>('');

  // Helper to build tracking data from cart items
  const getCartTrackingData = useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<any>>(API_CART_LIST);
      const items = data?.items || [];
      const selectedCartItems = items.filter((item: any) => selectedItems.includes(item.id));
      
      const content_ids = selectedCartItems.map((item: any) => getContentIdBySpu(item.spu_code)).filter(Boolean);
      const contents = selectedCartItems.map((item: any) => ({
        id: getContentIdBySpu(item.spu_code),
        quantity: item.quantity || 1
      })).filter((item: { id?: string }) => item.id);
      const orderTotal = selectedCartItems.reduce((total: number, item: any) => total + (item.price * (item.quantity || 1)), 0);

      return { content_ids, contents, orderTotal };
    } catch (err) {
      return { content_ids: [], contents: [], orderTotal: 0 };
    }
  }, [selectedItems]);

  const trackCheckoutAttempt = useCallback(async () => {
    if (isLoggedIn || checkoutAttemptTracked) {
      return;
    }

    checkoutAttemptTracked = true;
    const { content_ids, contents, orderTotal } = await getCartTrackingData();
    fbTrackCustom('CheckoutAttempt', {
      is_logged_in: false,
      value: orderTotal,
      currency: 'USD',
      content_ids,
      content_type: 'product',
      contents
    });
  }, [getCartTrackingData, isLoggedIn]);

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
        await trackCheckoutAttempt();
        return openLoginModal();
        //router.push(`/login?redirect=/shopping-cart`);
      }
    } catch (err:any) {
      if (err?.status == 401) {
        await trackCheckoutAttempt();
        return openLoginModal();
      }
      setError('Almost there — tap "Create book" to continue ✨');
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