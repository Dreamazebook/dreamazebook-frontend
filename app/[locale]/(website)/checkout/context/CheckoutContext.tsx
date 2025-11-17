'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Address } from '@/types/address';
import { ShippingErrors } from '@/types/order';

interface CheckoutContextType {
  // Address validation states
  shippingErrors: ShippingErrors;
  billingErrors: ShippingErrors;
  setShippingErrors: (errors: ShippingErrors) => void;
  setBillingErrors: (errors: ShippingErrors) => void;
  
  // Address suggestions
  shippingAddressSuggestions: any[];
  setShippingAddressSuggestions: (suggestions: any[]) => void;
  
  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  isAddressValidating: boolean;
  setIsAddressValidating: (validating: boolean) => void;
  
  // Validation methods
  validateShippingAddress: (address: Address) => boolean;
  clearAllErrors: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  // Error states
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [billingErrors, setBillingErrors] = useState<ShippingErrors>({});
  
  // Address suggestions
  const [shippingAddressSuggestions, setShippingAddressSuggestions] = useState<any[]>([]);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressValidating, setIsAddressValidating] = useState(false);

  // Validation methods
  const validateShippingAddress = (address: Address): boolean => {
    const requiredFields = ['first_name', 'last_name', 'email', 'street', 'city', 'post_code', 'country', 'state', 'phone'];
    const newErrors: ShippingErrors = {};
    
    requiredFields.forEach(field => {
      if (!address[field as keyof Address]) {
        newErrors[field as keyof ShippingErrors] = `${field.replace('_', ' ')} is required`;
      }
    });
    
    // Email validation
    if (address.email && !/\S+@\S+\.\S+/.test(address.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setShippingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearAllErrors = () => {
    setShippingErrors({});
    setBillingErrors({});
  };

  const value: CheckoutContextType = {
    // Error states
    shippingErrors,
    billingErrors,
    setShippingErrors,
    setBillingErrors,
    
    // Address suggestions
    shippingAddressSuggestions,
    setShippingAddressSuggestions,
    
    // Loading states
    isSubmitting,
    setIsSubmitting,
    isAddressValidating,
    setIsAddressValidating,
    
    // Validation methods
    validateShippingAddress,
    clearAllErrors,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};