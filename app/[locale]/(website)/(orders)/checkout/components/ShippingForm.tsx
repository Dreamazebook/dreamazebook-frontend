"use client";

import React, { useEffect, useState } from "react";
import { Address, EMPTY_ADDRESS } from "@/types/address";
import AddressForm from "./AddressForm";
import AddressCard from "../../../components/address/AddressCard";
import useUserStore from "@/stores/userStore";
import NextStepButton from "./NextStepButton";
import { Link } from "@/i18n/routing";
import { OrderDetail } from '@/types/order';

interface ShippingFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
  billingAddress: Address;
  setBillingAddress: (value: React.SetStateAction<Address>) => void;
  needsBillingAddress: boolean;
  setNeedsBillingAddress: (value: boolean) => void;
  handleNextFromShipping: () => void;
  orderDetail: OrderDetail;
  setShowAddressListModal: (value: boolean) => void;
  showShippingForm: boolean;
  setShowShippingForm: (value: boolean) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  address,
  setAddress,
  billingAddress,
  setBillingAddress,
  needsBillingAddress,
  setNeedsBillingAddress,
  handleNextFromShipping,
  orderDetail,
  setShowAddressListModal,
  showShippingForm,
  setShowShippingForm,
}) => {
  const { fetchCountryList, fetchAddresses } = useUserStore();

  // const [showBillingForm, setShowBillingForm] = useState(false);

  useEffect(() => {
    fetchCountryList();
  }, []);

  const isAddressValidated = () => {
    const REQUIRED_FIELDS = ["first_name", "last_name", "email", "street", "city", "post_code", "country", "state", "phone"];
    for (const field of REQUIRED_FIELDS) {
      if (!address[field]) {
        return false;
      }
      if (needsBillingAddress && !billingAddress[field]) {
        return false;
      }
    }
    return true;
  }

  return (
    <div className="space-y-4">
      {orderDetail?.shipping_address && (
        <AddressCard
          style="bg-[#F8F8F8]"
          address={orderDetail.shipping_address}
        />
      )}
      {/* 使用新地址选项 */}
      <div className="flex items-center gap-5">
        <div
          className={`cursor-pointer text-[#012CCE]`}
          onClick={() => {
            setShowShippingForm(false);
            fetchAddresses();
            setShowAddressListModal(true);
          }}
        >
          Change Address
        </div>
        {(orderDetail?.shipping_address || !showShippingForm) &&
        <div
          className={`cursor-pointer text-[#012CCE]`}
          onClick={() => {
            setShowShippingForm(true);
            setAddress(EMPTY_ADDRESS);
          }}
        >
          Add New Address
        </div>}
      </div>

      {showShippingForm && (
        <AddressForm
          address={address}
          setAddress={setAddress}
        />
      )}

        <div className="flex items-center justify-between">
          <label
            className="ml-2 block text-[#222] font-bold"
          >
            Bills need to be sent to a new address？
          </label>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="billingAddressOption"
                checked={needsBillingAddress}
                onChange={() => setNeedsBillingAddress(true)}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <label
                className="block text-sm text-gray-700"
              >
                Yes
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="billingAddressOption"
                checked={!needsBillingAddress}
                onChange={() => setNeedsBillingAddress(false)}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <label
                className="block text-sm text-gray-700"
              >
                No need
              </label>
            </div>
          </div>
        </div>

      {needsBillingAddress && (
        <AddressForm
          address={billingAddress}
          setAddress={setBillingAddress}
        />
      )}

      <div className="mt-4 flex flex-col justify-center">
        <p className="mb-2 text-center text-[#666]">
          By clicking Continue, you agree to our <Link href={'/terms-and-conditions'} className="text-primary">terms & conditions</Link> and <Link target="_blank" href='/privacy-policy' className="text-primary">privacy policy</Link>
        </p>

        <NextStepButton
          disabled={!isAddressValidated()}
          handleOnClick={handleNextFromShipping}
        >Continue to Delivery</NextStepButton>

      </div>
    </div>
  );
};

export default ShippingForm;
