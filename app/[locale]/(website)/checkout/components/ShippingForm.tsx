'use client';

import React, { useEffect, useState } from 'react';
import { OrderDetailResponse, ShippingErrors } from './types';
import { Address } from '@/types/address';
import AddressForm from './AddressForm';
import AddressCard from '../../components/address/AddressCard';
import AddressCardList from '../../components/address/AddressCardList';

interface ShippingFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
  errors: ShippingErrors;
  setErrors: (errors: ShippingErrors) => void;
  needsBillingAddress: boolean;
  setNeedsBillingAddress: (value: boolean) => void;
  handleNextFromShipping: () => void;
  addressList: Address[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  orderDetail: OrderDetailResponse;
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
  setSelectedAddressId,
  orderDetail,
}) => {
  const [showForm, setShowForm] = useState(false);

  const [showAddressList, setShowAddressList] = useState(false);
  
  // 当选择已保存的地址时，自动填充表单字段
  useEffect(() => {
    setShowForm(addressList.length === 0);
    // if (!selectedAddressId) {
    //   const defaultAddress = addressList.find(addr => addr.is_default);
    //   if (defaultAddress) {
    //     setSelectedAddressId(defaultAddress?.id || '');
    //   }
    // }
  }, [addressList]);
  
  const clearError = (field: keyof ShippingErrors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div>
      
      {showAddressList && 
        <div className='fixed right-0 top-0 w-[40%] h-full bg-white'>
          <h3 className='border-b text-xl font-semibold px-5 py-4'>Addresses</h3>
          <AddressCardList addressList={addressList} handleClickAddress={(address) => {
            if (!address?.id) return;
            setSelectedAddressId(address?.id);
            setShowAddressList(false);
            }
          } />
        </div>
      }

      {orderDetail?.order?.shipping_address && <AddressCard address={orderDetail.order.shipping_address} />}
      {/* 使用新地址选项 */}
      <div className='flex items-center gap-5 mb-5'>
        <div 
          role="button"
          aria-checked={selectedAddressId === null}
          tabIndex={0}
          className={`cursor-pointer`}
          onClick={() => {
            setSelectedAddressId(null);
            setShowAddressList(true);
          }}
        >
          <div className="flex items-center text-[#012CCE]">Change Address</div>
        </div>
        <div 
          role="button"
          aria-checked={selectedAddressId === null}
          tabIndex={1}
          className={`cursor-pointer`}
          onClick={() => {
            setSelectedAddressId(null);
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