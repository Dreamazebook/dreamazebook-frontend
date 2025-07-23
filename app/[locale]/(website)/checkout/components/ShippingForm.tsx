'use client';

import React, { useEffect } from 'react';
import { ShippingErrors } from './types';
import { Address } from '@/types/address';

interface ShippingFormProps {
  email: string;
  setEmail: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  postalcode: string;
  setPostalcode: (value: string) => void;
  phone:string;
  setPhone: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  state: string;
  setState: (value: string) => void;
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
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  address,
  setAddress,
  city,
  setCity,
  postalcode,
  setPostalcode,
  country,
  setCountry,
  state,
  setState,
  phone,
  setPhone,
  errors,
  setErrors,
  needsBillingAddress,
  setNeedsBillingAddress,
  handleNextFromShipping,
  addressList,
  selectedAddressId,
  setSelectedAddressId
}) => {
  
  // 当选择已保存的地址时，自动填充表单字段
  useEffect(() => {
    // if (selectedAddressId) {
    //   const selectedAddress = addressList.find(addr => addr.id === selectedAddressId);
    //   if (selectedAddress) {
    //     // 填充表单字段
    //     if (selectedAddress.email) setEmail(selectedAddress.email);
    //     if (selectedAddress.first_name) setFirstName(selectedAddress.first_name);
    //     if (selectedAddress.last_name) setLastName(selectedAddress.last_name);
    //     if (selectedAddress.street) setAddress(selectedAddress.street);
    //     if (selectedAddress.city) setCity(selectedAddress.city);
    //     if (selectedAddress.postal_code) setPostalcode(selectedAddress.postal_code);
    //     if (selectedAddress.country) setCountry(selectedAddress.country);
    //     if (selectedAddress.state) setState(selectedAddress.state);
    //     if (selectedAddress.phone) setPhone(selectedAddress.phone);
    //   }
    // }
  }, [selectedAddressId, addressList]);
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
                className={`p-3 border rounded-md cursor-pointer ${
                  selectedAddressId === addr.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedAddressId(addr.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium">
                      {addr.first_name} {addr.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addr.street}, {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    <p className="text-sm text-gray-600">{addr.country}</p>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 使用新地址选项 */}
            <div 
              className={`p-3 border rounded-md cursor-pointer ${
                selectedAddressId === null 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setSelectedAddressId(null)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedAddressId === null}
                  onChange={() => setSelectedAddressId(null)}
                  className="mr-2"
                />
                <p className="font-medium">使用新地址</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
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
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
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
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
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
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
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
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
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
            value={postalcode}
            onChange={(e) => {
              setPostalcode(e.target.value);
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
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
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
            value={state}
            onChange={(e) => {
              setState(e.target.value);
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
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clearError('phone');
          }}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Delivery
        </button>
      </div>
    </div>
  );
};

export default ShippingForm;