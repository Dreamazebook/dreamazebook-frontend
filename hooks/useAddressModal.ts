import { useState } from 'react';
import { OrderDetail } from '@/types/order';
import { Address, EMPTY_ADDRESS } from '@/types/address';
import api from '@/utils/api';
import { API_ORDER_UPDATE_ADDRESS } from '@/constants/api';
import { ApiResponse } from '@/types/api';

interface UseAddressModalProps {
  onAddressUpdated?: () => void;
}

export const useAddressModal = ({ onAddressUpdated }: UseAddressModalProps = {}) => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);

  const openAddressModal = (orderDetail: OrderDetail) => {
    setSelectedOrderDetail(orderDetail);
    if (orderDetail.shipping_address) {
      setAddress(orderDetail.shipping_address);
    }
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setSelectedOrderDetail(null);
    setAddress(EMPTY_ADDRESS);
  };

  const updateShippingAddress = async (orderId: string) => {
    if (!address) {
      return { success: false, message: 'No address data available' };
    }

    try {
      const response = await api.put<ApiResponse>(API_ORDER_UPDATE_ADDRESS(orderId), {
        shipping_address_id: address.id,
        shipping_address: address,
      });

      if (response.success) {
        // Call callback if provided
        if (onAddressUpdated) {
          onAddressUpdated();
        }
        closeAddressModal();
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Failed to update address' };
      }
    } catch (error: any) {
      console.error('Error updating shipping address:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update shipping address'
      };
    }
  };

  return {
    showAddressModal,
    selectedOrderDetail,
    address,
    setAddress,
    openAddressModal,
    closeAddressModal,
    updateShippingAddress,
  };
};
