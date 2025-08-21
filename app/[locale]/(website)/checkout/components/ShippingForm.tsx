"use client";

import React, { useEffect, useState } from "react";
import { OrderDetailResponse, ShippingErrors } from "./types";
import { Address, EMPTY_ADDRESS } from "@/types/address";
import AddressForm from "./AddressForm";
import AddressCard from "../../components/address/AddressCard";
import useUserStore from "@/stores/userStore";
import NextStepButton from "./NextStepButton";

interface ShippingFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
  billingAddress: Address;
  setBillingAddress: (value: React.SetStateAction<Address>) => void;
  needsBillingAddress: boolean;
  setNeedsBillingAddress: (value: boolean) => void;
  handleNextFromShipping: () => void;
  orderDetail: OrderDetailResponse;
  setShowAddressListModal: (value: boolean) => void;
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
}) => {
  const [showShippingForm, setShowShippingForm] = useState(false);
  const { countryList, fetchCountryList } = useUserStore();

  // const [showBillingForm, setShowBillingForm] = useState(false);

  useEffect(() => {
    fetchCountryList();
  }, []);

  const isAddressValidated = () => {
    console.log(address,billingAddress);
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
    <div>
      {orderDetail?.order?.shipping_address && (
        <AddressCard
          style="bg-[#F8F8F8]"
          address={orderDetail.order.shipping_address}
        />
      )}
      {/* 使用新地址选项 */}
      <div className="flex items-center gap-5 my-5">
        <div
          className={`cursor-pointer text-[#012CCE]`}
          onClick={() => {
            setShowShippingForm(false);
            setShowAddressListModal(true);
          }}
        >
          Change Address
        </div>
        <div
          className={`cursor-pointer text-[#012CCE]`}
          onClick={() => {
            setShowShippingForm(true);
            setAddress(EMPTY_ADDRESS);
          }}
        >
          Add New Address
        </div>
      </div>

      {showShippingForm && (
        <AddressForm
          address={address}
          setAddress={setAddress}
        />
      )}

      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="needsBillingAddress"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={needsBillingAddress}
            onChange={(e) => setNeedsBillingAddress(e.target.checked)}
          />
          <label
            htmlFor="needsBillingAddress"
            className="ml-2 block text-sm text-gray-700"
          >
            My billing address is different from my shipping address
          </label>
        </div>
      </div>

      {needsBillingAddress && (
        <AddressForm
          address={billingAddress}
          setAddress={setBillingAddress}
        />
      )}

      <div className="mt-4 flex flex-col justify-center">
        <p className="mb-2 text-center text-gray-500">
          By clicking Continue, you agree to ourterms & conditions and privacy
          policy
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
