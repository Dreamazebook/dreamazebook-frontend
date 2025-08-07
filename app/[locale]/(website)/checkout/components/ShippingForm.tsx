'use client';

import React, { useEffect, useState } from 'react';
import { ShippingErrors } from './types';
import { Address } from '@/types/address';
import api from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { API_ORDER_UPDATE_ADDRESS } from '@/constants/api';

interface ShippingFormProps {
  address: {
    email: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalcode: string;
    country: string;
    state: string;
    phone: string;
    isDefault: boolean;
  };
  setAddress: (value: React.SetStateAction<{
    email: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalcode: string;
    country: string;
    state: string;
    phone: string;
    isDefault: boolean;
  }>) => void;
  errors: ShippingErrors;
  setErrors: (errors: ShippingErrors) => void;
  needsBillingAddress: boolean;
  setNeedsBillingAddress: (value: boolean) => void;
  handleNextFromShipping: () => void;
  addressList: Address[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  address,
  setAddress,
  errors,
  setErrors,
  needsBillingAddress,
  setNeedsBillingAddress,
  handleNextFromShipping,
  addressList,
  selectedAddressId,
  setSelectedAddressId
}) => {
  const [showForm, setShowForm] = useState(false);
  
  // 当选择已保存的地址时，自动填充表单字段
  useEffect(() => {
    setShowForm(addressList.length === 0);

    if (!selectedAddressId) {
      const defaultAddress = addressList.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addressList]);
  
  const clearError = (field: keyof ShippingErrors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div>
      {/* 地址选择部分 */}
      {addressList.length > 0 && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-3">选择送货地址</h3>
          <div className="flex flex-col gap-3">
            {/* 已保存地址列表 */}
            {addressList.map((addr) => (
              <div 
                key={addr.id}
                role="button"
                aria-checked={selectedAddressId === addr.id}
                tabIndex={0}
                className={`p-3 border rounded-md cursor-pointer ${
                  selectedAddressId === addr.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => {
                  setSelectedAddressId(addr.id);
                  setShowForm(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {addr.is_default && (
                      <span className="inline-block mb-1 px-2 py-1 text-xs font-medium bg-green-500 text-white rounded">
                        Default
                      </span>
                    )}
                    <p className="font-medium">
                      {addr.first_name} {addr.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addr.street}, {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    <p className="text-sm text-gray-600">{addr.country}</p>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowForm(true);
                    }}
                    className="ml-4 p-1 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                    aria-label="Edit address"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {/* 使用新地址选项 */}
            <div 
              role="button"
              aria-checked={selectedAddressId === null}
              tabIndex={0}
              className={`p-3 cursor-pointer`}
              onClick={() => {
                setSelectedAddressId(null);
                setShowForm(true);
              }}
            >
              <div className="flex items-center text-[#012CCE]">Add New Address</div>
            </div>
          </div>
        </div>
      )}

      {showForm &&  <>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          value={address.email}
          onChange={(e) => {
            setAddress(prev => ({...prev, email: e.target.value}));
            clearError('email');
          }}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            id="firstName"
            className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            value={address.firstName}
            onChange={(e) => {
              setAddress(prev => ({...prev, firstName: e.target.value}));
              clearError('firstName');
            }}
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            id="lastName"
            className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            value={address.lastName}
            onChange={(e) => {
              setAddress(prev => ({...prev, lastName: e.target.value}));
              clearError('lastName');
            }}
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          id="address"
          className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
          value={address.street}
          onChange={(e) => {
            setAddress(prev => ({...prev, street: e.target.value}));
            clearError('address');
          }}
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            id="city"
            className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            value={address.city}
            onChange={(e) => {
              setAddress(prev => ({...prev, city: e.target.value}));
              clearError('city');
            }}
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="postalcode" className="block text-sm font-medium text-gray-700 mb-1">postalcode / Postal Code</label>
          <input
            type="text"
            id="postalcode"
            className={`w-full p-2 border rounded-md ${errors.postalcode ? 'border-red-500' : 'border-gray-300'}`}
            value={address.postalcode}
            onChange={(e) => {
              setAddress(prev => ({...prev, postalcode: e.target.value}));
              clearError('postalcode');
            }}
          />
          {errors.postalcode && <p className="text-red-500 text-sm mt-1">{errors.postalcode}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            id="country"
            className={`w-full p-2 border rounded-md ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
            value={address.country}
            onChange={(e) => {
              setAddress(prev => ({...prev, country: e.target.value}));
              clearError('country');
            }}
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
          <input
            type="text"
            id="state"
            className={`w-full p-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
            value={address.state}
            onChange={(e) => {
              setAddress(prev => ({...prev, state: e.target.value}));
              clearError('state');
            }}
          />
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number(optional)</label>
        <input
          type="text"
          id="phone"
          className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          value={address.phone}
          onChange={(e) => {
            setAddress(prev => ({...prev, phone: e.target.value}));
            clearError('phone');
          }}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div className="mt-4 mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="setDefaultAddress"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={address.isDefault}
            onChange={(e) => setAddress(prev => ({...prev, isDefault: e.target.checked}))}
          />
          <label htmlFor="setDefaultAddress" className="ml-2 block text-sm text-gray-700">
            Set as default shipping address
          </label>
        </div>
      </div>
      </>}

      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="needsBillingAddress"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={needsBillingAddress}
            onChange={(e) => setNeedsBillingAddress(e.target.checked)}
          />
          <label htmlFor="needsBillingAddress" className="ml-2 block text-sm text-gray-700">
            My billing address is different from my shipping address
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleNextFromShipping}
          className="w-full bg-blue-600 cursor-pointer text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Delivery
        </button>
      </div>
    </div>
  );
};

export default ShippingForm;