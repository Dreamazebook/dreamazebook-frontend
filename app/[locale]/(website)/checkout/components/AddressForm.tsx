'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ShippingErrors } from './types';
import { Address } from '@/types/address';

const PUBLIC_MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

interface AddressSuggestionsProps {
  addressSuggestions: any[];
  handleAddressSuggestionClick: (suggestion: any) => void;
}

const AddressSuggestions: React.FC<AddressSuggestionsProps> = ({
  addressSuggestions,
  handleAddressSuggestionClick,
}) => {
  if (!addressSuggestions || addressSuggestions.length === 0) return null;

  return (
    <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
      {addressSuggestions.map((suggestion, index) => (
        <div
          key={index}
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleAddressSuggestionClick(suggestion)}
        >
          {suggestion.place_name}
        </div>
      ))}
    </div>
  );
};

interface AddressFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  setAddress,
}) => {
  const [errors, setErrors] = useState<ShippingErrors>({});


    const clearError = (field: keyof ShippingErrors) => {
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  // Validate shipping information
  const validateShippingInfo = (address: Address) => {
    const newErrors: ShippingErrors = {};
    
    if (!address.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(address.email)) newErrors.email = "Invalid email address";
    
    if (!address.first_name) newErrors.first_name = "First name is required";
    if (!address.last_name) newErrors.last_name = "Last name is required";
    if (!address.street) newErrors.address = "Address is required";
    if (!address.city) newErrors.city = "City is required";
    if (!address.post_code) newErrors.post_code = "Postal code is required";
    if (!address.country) newErrors.country = "Country is required";
    if (!address.state) newErrors.state = "State is required";
    if (!address.phone) newErrors.phone = "Phone number is required";
    
    return newErrors;
  };

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAddressSuggestions = useCallback(async () => {
    if (!address?.street || address?.street.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address?.street)}.json?access_token=${PUBLIC_MAPBOX_API_KEY}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data.features);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  }, [address?.street]);

  const debouncedGetAddressSuggestions = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      getAddressSuggestions();
    }, 300);
  }, [getAddressSuggestions]);

  const handleAddressSuggestionClick = (suggestion: any) => {
    const context = suggestion.context;
    const street = suggestion.place_name.split(', ')[0];
    let city = '';
    let state = '';
    let post_code = '';
    let country = '';

    context.forEach((item: any) => {
      if (item.id.includes('place')) city = item.text;
      if (item.id.includes('region')) state = item.text;
      if (item.id.includes('postcode')) post_code = item.text;
      if (item.id.includes('country')) country = item.short_code.toUpperCase();
    });

    setAddress(prev => ({
      ...prev,
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      post_code: post_code.trim(),
      country: country.trim(),
    }));
    setAddressSuggestions([]);
  };
  
  useEffect(() => {
    setErrors(validateShippingInfo(address));
  }, [address]);
  return (
    <>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          required
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
            required
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
            required
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
          required
          className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
          value={address.street}
          onChange={(e) => {
            setAddress(prev => ({...prev, street: e.target.value}));
            clearError('address');
            debouncedGetAddressSuggestions();
          }}
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        {address.street && 
        <AddressSuggestions
          addressSuggestions={addressSuggestions}
          handleAddressSuggestionClick={handleAddressSuggestionClick}
        />}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            id="city"
            required
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
            required
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
            required
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
            required
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="text"
          id="phone"
          required
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