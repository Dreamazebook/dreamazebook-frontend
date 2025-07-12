'use client';

import React from 'react';
import { BillingErrors } from './types';

interface BillingAddressFormProps {
  billingEmail: string;
  setBillingEmail: (value: string) => void;
  billingFirstName: string;
  setBillingFirstName: (value: string) => void;
  billingLastName: string;
  setBillingLastName: (value: string) => void;
  billingAddress: string;
  setBillingAddress: (value: string) => void;
  billingCity: string;
  setBillingCity: (value: string) => void;
  billingZip: string;
  setBillingZip: (value: string) => void;
  billingCountry: string;
  setBillingCountry: (value: string) => void;
  billingState: string;
  setBillingState: (value: string) => void;
  billingErrors: BillingErrors;
  setBillingErrors: (errors: BillingErrors) => void;
}

const BillingAddressForm: React.FC<BillingAddressFormProps> = ({
  billingEmail,
  setBillingEmail,
  billingFirstName,
  setBillingFirstName,
  billingLastName,
  setBillingLastName,
  billingAddress,
  setBillingAddress,
  billingCity,
  setBillingCity,
  billingZip,
  setBillingZip,
  billingCountry,
  setBillingCountry,
  billingState,
  setBillingState,
  billingErrors,
  setBillingErrors
}) => {
  const clearBillingError = (field: keyof BillingErrors) => {
    if (billingErrors[field]) {
      setBillingErrors({ ...billingErrors, [field]: undefined });
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h4 className="text-md font-medium mb-4">Billing Address</h4>
      
      <div className="mb-4">
        <label htmlFor="billingEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="billingEmail"
          className={`w-full p-2 border rounded-md ${billingErrors.billingEmail ? 'border-red-500' : 'border-gray-300'}`}
          value={billingEmail}
          onChange={(e) => {
            setBillingEmail(e.target.value);
            clearBillingError('billingEmail');
          }}
        />
        {billingErrors.billingEmail && <p className="text-red-500 text-sm mt-1">{billingErrors.billingEmail}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            id="billingFirstName"
            className={`w-full p-2 border rounded-md ${billingErrors.billingFirstName ? 'border-red-500' : 'border-gray-300'}`}
            value={billingFirstName}
            onChange={(e) => {
              setBillingFirstName(e.target.value);
              clearBillingError('billingFirstName');
            }}
          />
          {billingErrors.billingFirstName && <p className="text-red-500 text-sm mt-1">{billingErrors.billingFirstName}</p>}
        </div>
        <div>
          <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            id="billingLastName"
            className={`w-full p-2 border rounded-md ${billingErrors.billingLastName ? 'border-red-500' : 'border-gray-300'}`}
            value={billingLastName}
            onChange={(e) => {
              setBillingLastName(e.target.value);
              clearBillingError('billingLastName');
            }}
          />
          {billingErrors.billingLastName && <p className="text-red-500 text-sm mt-1">{billingErrors.billingLastName}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          id="billingAddress"
          className={`w-full p-2 border rounded-md ${billingErrors.billingAddress ? 'border-red-500' : 'border-gray-300'}`}
          value={billingAddress}
          onChange={(e) => {
            setBillingAddress(e.target.value);
            clearBillingError('billingAddress');
          }}
        />
        {billingErrors.billingAddress && <p className="text-red-500 text-sm mt-1">{billingErrors.billingAddress}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            id="billingCity"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={billingCity}
            onChange={(e) => setBillingCity(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
          <input
            type="text"
            id="billingZip"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={billingZip}
            onChange={(e) => setBillingZip(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            id="billingCountry"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={billingCountry}
            onChange={(e) => setBillingCountry(e.target.value)}
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>
        <div>
          <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
          <input
            type="text"
            id="billingState"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={billingState}
            onChange={(e) => setBillingState(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BillingAddressForm;