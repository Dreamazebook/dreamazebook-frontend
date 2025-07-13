'use client';

import React from 'react';
import { BillingErrors } from './types';
import Input from '@/app/components/common/Input';

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
      
      <Input
        id="billingEmail"
        label="Email"
        type="email"
        value={billingEmail}
        onChange={(e) => {
          setBillingEmail(e.target.value);
          clearBillingError('billingEmail');
        }}
        error={billingErrors.billingEmail}
        required
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          id="billingFirstName"
          label="First Name"
          value={billingFirstName}
          onChange={(e) => {
            setBillingFirstName(e.target.value);
            clearBillingError('billingFirstName');
          }}
          error={billingErrors.billingFirstName}
          required
        />
        <Input
          id="billingLastName"
          label="Last Name"
          value={billingLastName}
          onChange={(e) => {
            setBillingLastName(e.target.value);
            clearBillingError('billingLastName');
          }}
          error={billingErrors.billingLastName}
          required
        />
      </div>

      <Input
        id="billingAddress"
        label="Address"
        value={billingAddress}
        onChange={(e) => {
          setBillingAddress(e.target.value);
          clearBillingError('billingAddress');
        }}
        error={billingErrors.billingAddress}
        required
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          id="billingCity"
          label="City"
          value={billingCity}
          onChange={(e) => setBillingCity(e.target.value)}
        />
        <Input
          id="billingZip"
          label="ZIP / Postal Code"
          value={billingZip}
          onChange={(e) => setBillingZip(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="billingCountry"
          label="Country"
          type="select"
          value={billingCountry}
          onChange={(e) => setBillingCountry(e.target.value)}
          options={[
            { value: "US", label: "United States" },
            { value: "CA", label: "Canada" },
            { value: "UK", label: "United Kingdom" },
            { value: "AU", label: "Australia" }
          ]}
          placeholder="Select Country"
        />
        <Input
          id="billingState"
          label="State / Province"
          value={billingState}
          onChange={(e) => setBillingState(e.target.value)}
        />
      </div>
    </div>
  );
};

export default BillingAddressForm;