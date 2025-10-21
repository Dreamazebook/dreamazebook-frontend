import { useState } from 'react';
import { Address, EMPTY_ADDRESS } from '@/types/address';
import api from '@/utils/api';
import { API_ADDRESS_LIST, API_ORDER_UPDATE_ADDRESS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import useUserStore from '@/stores/userStore';

export const useShippingAddress = (orderId: string | null) => {
  const { fetchAddresses, fetchOrderList } = useUserStore();
  const [shippingAddress, setShippingAddress] = useState<Address>(EMPTY_ADDRESS);
  const [billingAddress, setBillingAddress] = useState<Address>(EMPTY_ADDRESS);
  const [needsBillingAddress, setNeedsBillingAddress] = useState<boolean>(false);
  const [showShippingForm, setShowShippingForm] = useState<boolean>(false);
  const [showAddressListModal, setShowAddressListModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateOrderAddress = async (address: Address) => {
    if (!orderId) return;
    const options = {
      shipping_address_id: address.id,
      billing_address_id: address.id,
      use_shipping_as_billing: true
    };
    
    if (needsBillingAddress) {
      options.billing_address_id = billingAddress.id;
      options.use_shipping_as_billing = false;
    }

    setIsLoading(true);
    const { data, success } = await api.put<ApiResponse>(API_ORDER_UPDATE_ADDRESS(orderId), options);
    setIsLoading(false);
    if (success) {
      fetchOrderList();
      return data;
    }
    return null;
  };

  const saveAddress = async () => {
    let url = API_ADDRESS_LIST;
    let method = api.post;
    
    if (shippingAddress?.id) {
      url = `${API_ADDRESS_LIST}/${shippingAddress.id}`;
      method = api.put;
    }

    setIsLoading(true);
    const { data, success, message } = await method<ApiResponse>(url, shippingAddress);
    setIsLoading(false);

    if (success) {
      await fetchAddresses({ refresh: true });
      const updatedOrder = await updateOrderAddress(data);
      return { success: true, data: updatedOrder };
    }
    
    return { success: false, message };
  };

  return {
    shippingAddress,
    setShippingAddress,
    billingAddress,
    setBillingAddress,
    needsBillingAddress,
    setNeedsBillingAddress,
    showShippingForm,
    setShowShippingForm,
    showAddressListModal,
    setShowAddressListModal,
    isLoading,
    updateOrderAddress,
    saveAddress
  };
};