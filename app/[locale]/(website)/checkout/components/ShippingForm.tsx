'use client';

import React, { useEffect, useState } from 'react';
import { OrderDetailResponse, ShippingErrors } from './types';
import { Address } from '@/types/address';
import AddressForm from './AddressForm';
import AddressCard from '../../components/address/AddressCard';
import useUserStore from '@/stores/userStore';

interface ShippingFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
  errors: ShippingErrors;
  setErrors: (errors: ShippingErrors) => void;
  needsBillingAddress: boolean;
  setNeedsBillingAddress: (value: boolean) => void;
  handleNextFromShipping: () => void;
  orderDetail: OrderDetailResponse;
  setShowAddressListModal: (value: boolean) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  address,
  setAddress,
  errors,
  setErrors,
  needsBillingAddress,
  setNeedsBillingAddress,
  handleNextFromShipping,
  orderDetail,
  setShowAddressListModal
}) => {
  const [showForm, setShowForm] = useState(false);
  const {countryList, fetchCountryList} = useUserStore();

  useEffect(()=>{
    fetchCountryList();
  },[])
  
  const clearError = (field: keyof ShippingErrors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div>
      {orderDetail?.order?.shipping_address && <AddressCard style='bg-[#F8F8F8]' address={orderDetail.order.shipping_address} />}
      {/* 使用新地址选项 */}
      <div className='flex items-center gap-5 my-5'>
        <div 
          role="button"
          tabIndex={0}
          className={`cursor-pointer`}
          onClick={() => {
            setShowForm(false);
            setShowAddressListModal(true);
          }}
        >
          <div className="flex items-center text-[#012CCE]">Change Address</div>
        </div>
        <div 
          role="button"
          tabIndex={1}
          className={`cursor-pointer`}
          onClick={() => {
            setShowForm(true);
          }}
        >
          <div className="flex items-center text-[#012CCE]">Add New Address</div>
        </div>
      </div>
      

      {showForm && <AddressForm
  address={address}
  setAddress={setAddress}
  errors={errors}
  clearError={clearError}
/>}

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