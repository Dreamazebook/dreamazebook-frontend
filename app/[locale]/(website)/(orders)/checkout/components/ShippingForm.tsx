"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Address, EMPTY_ADDRESS } from "@/types/address";
import AddressForm from "./AddressForm";
import AddressCard from "../../../components/address/AddressCard";
import useUserStore from "@/stores/userStore";
import NextStepButton from "./NextStepButton";
import { Link } from "@/i18n/routing";
import { OrderDetail } from "@/types/order";

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
  shippingAddressRef?: React.RefObject<any>;
  billingAddressRef?: React.RefObject<any>;
  canEditShippingAddress?: boolean;
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
  shippingAddressRef,
  billingAddressRef,
  canEditShippingAddress = true,
}) => {
  const t = useTranslations("checkoutPage");
  const { fetchAddresses } = useUserStore();

  // const [showBillingForm, setShowBillingForm] = useState(false);

  const isAddressValidated = () => {
    const REQUIRED_FIELDS = [
      "first_name",
      "last_name",
      "email",
      "street",
      "city",
      "post_code",
      "country",
      "state",
      "phone",
    ];
    for (const field of REQUIRED_FIELDS) {
      if (!address[field]) {
        return false;
      }
      if (needsBillingAddress && !billingAddress[field]) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-4">
      {orderDetail?.shipping_address && (
        <div>
          <AddressCard
            style="bg-[#F8F8F8]"
            address={orderDetail.shipping_address}
          />
          {/* Edit Shipping Address link */}
          {canEditShippingAddress && (
            <div className="mt-2">
              <button
                onClick={() => {
                  setShowShippingForm(true);
                  setAddress(orderDetail.shipping_address!);
                }}
                className="text-[#012CCE] hover:text-[#012CCE]/80 text-sm font-medium"
              >
                {t("editShippingAddress")}
              </button>
            </div>
          )}
        </div>
      )}
      {/* 使用新地址选项 */}
      <div className="flex items-center gap-5">
        {/* <div
          className={`cursor-pointer text-[#012CCE]`}
          onClick={() => {
            setShowShippingForm(false);
            fetchAddresses();
            setShowAddressListModal(true);
          }}
        >
          {t("changeAddress")}
        </div> */}
        {(orderDetail?.shipping_address || !showShippingForm) && (
          <div
            className={`cursor-pointer text-[#012CCE]`}
            onClick={() => {
              setShowShippingForm(true);
              setAddress(EMPTY_ADDRESS);
            }}
          >
            {t("addNewAddress")}
          </div>
        )}
      </div>

      {showShippingForm && (
        <AddressForm
          ref={shippingAddressRef}
          address={address}
          setAddress={setAddress}
          orderDetail={orderDetail}
        />
      )}

      <div className="flex items-center justify-between">
        <label className="ml-2 block text-[#222] font-bold">
          {t("billingAddressQuestion")}
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
            <label className="block text-sm text-gray-700">{t("yes")}</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="billingAddressOption"
              checked={!needsBillingAddress}
              onChange={() => setNeedsBillingAddress(false)}
              className="h-4 w-4 text-blue-600 border-gray-300"
            />
            <label className="block text-sm text-gray-700">{t("noNeed")}</label>
          </div>
        </div>
      </div>

      {needsBillingAddress && (
        <AddressForm
          ref={billingAddressRef}
          address={billingAddress}
          setAddress={setBillingAddress}
          orderDetail={orderDetail}
        />
      )}

      <div className="mt-4 flex flex-col justify-center">
        <p className="mb-2 text-center text-[#666]">
          By clicking Continue, you agree to our{" "}
          <Link href={"/terms-and-conditions"} className="text-primary">
            {t("termsAndConditions")}
          </Link>{" "}
          and{" "}
          <Link target="_blank" href="/privacy-policy" className="text-primary">
            {t("privacyPolicy")}
          </Link>
        </p>

        <NextStepButton
          // disabled={!isAddressVal
          // idated()}
          handleOnClick={handleNextFromShipping}
        >
          {t("continueToDelivery")}
        </NextStepButton>
      </div>
    </div>
  );
};

export default ShippingForm;
