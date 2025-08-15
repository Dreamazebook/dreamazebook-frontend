'use client';

import React from 'react';
import { ShippingErrors } from './types';
import { Address } from '@/types/address';

interface AddressFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
  errors: ShippingErrors;
  clearError: (field: keyof ShippingErrors) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  setAddress,
  errors,
  clearError
}) => {
  return (
    <>
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
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            id="first_name"
            className={`w-full p-2 border rounded-md ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
            value={address.first_name}
            onChange={(e) => {
              setAddress(prev => ({...prev, first_name: e.target.value}));
              clearError('first_name');
            }}
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            id="last_name"
            className={`w-full p-2 border rounded-md ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
            value={address.last_name}
            onChange={(e) => {
              setAddress(prev => ({...prev, last_name: e.target.value}));
              clearError('last_name');
            }}
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
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
          <label htmlFor="post_code" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
          <input
            type="text"
            id="post_code"
            className={`w-full p-2 border rounded-md ${errors.post_code ? 'border-red-500' : 'border-gray-300'}`}
            value={address.post_code}
            onChange={(e) => {
              setAddress(prev => ({...prev, post_code: e.target.value}));
              clearError('post_code');
            }}
          />
          {errors.post_code && <p className="text-red-500 text-sm mt-1">{errors.post_code}</p>}
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
            <option value="CN">China</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="FR">France</option>
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
            checked={address.is_default}
            onChange={(e) => setAddress(prev => ({...prev, is_default: e.target.checked}))}
          />
          <label htmlFor="setDefaultAddress" className="ml-2 block text-sm text-gray-700">
            Set as default shipping address
          </label>
        </div>
      </div>
    </>
  );
};

export default AddressForm;