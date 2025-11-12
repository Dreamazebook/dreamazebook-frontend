'use client';

import { OrderDetail } from '@/app/[locale]/(website)/checkout/components/types';
import { createContext, useContext, ReactNode, useState } from 'react';

interface OrderDetailContextType {
  order: OrderDetail | null;
  handleManualConfirm: (itemId: string) => Promise<void>;
  isModalOpen: boolean;
  selectedItem: any;
  openModal: (item: any) => void;
  closeModal: () => void;
}

const OrderDetailContext = createContext<OrderDetailContextType | undefined>(undefined);

interface OrderDetailProviderProps {
  children: ReactNode;
  order: OrderDetail | null;
  handleManualConfirm: (itemId: string) => Promise<void>;
  isModalOpen: boolean;
  selectedItem: any;
  openModal: (item: any) => void;
  closeModal: () => void;
}

export const OrderDetailProvider = ({ 
  children, 
  order, 
  handleManualConfirm,
  isModalOpen,
  selectedItem,
  openModal,
  closeModal
}: OrderDetailProviderProps) => {
  return (
    <OrderDetailContext.Provider value={{ 
      order, 
      handleManualConfirm,
      isModalOpen,
      selectedItem,
      openModal,
      closeModal
    }}>
      {children}
    </OrderDetailContext.Provider>
  );
};

export const useOrderDetail = () => {
  const context = useContext(OrderDetailContext);
  if (context === undefined) {
    throw new Error('useOrderDetail must be used within an OrderDetailProvider');
  }
  return context;
};