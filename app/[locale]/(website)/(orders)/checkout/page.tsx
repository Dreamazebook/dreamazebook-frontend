"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Loading from "../../components/Loading";
import { Address } from "@/types/address";
import CheckoutStep from "./components/CheckoutStep";
import ShippingForm from "./components/ShippingForm";
import DeliveryOptions from "./components/DeliveryOptions";
import ReviewAndPay from "./components/ReviewAndPay";
import OrderSummary from "./components/OrderSummary";
import AddressCardListModal from "./components/AddressCardListModal";
import useOrderStatus from "../../hooks/useOrderStatus";
import { useOrderDetail } from "./hooks/useOrderDetail";
import { useCheckoutSteps } from "./hooks/useCheckoutSteps";
import { useShippingAddress } from "./hooks/useShippingAddress";
import { useShippingMethod } from "./hooks/useShippingMethod";
import { CheckoutProvider } from "./context/CheckoutContext";
import { fbTrack, getContentIdBySpu } from "@/utils/track";

// Track InitiateCheckout only once per page load
let initiateCheckoutTracked = false;

function CheckoutPageContent() {
  const t = useTranslations("checkoutPage");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentMethod = searchParams.get("paymentMethod") || "card";

  const {
    orderDetail,
    setOrderDetail,
    isLoading: isOrderLoading,
    error,
  } = useOrderDetail(orderId);

  // Get order status to determine if editing is allowed
  const { orderStatus } = useOrderStatus(orderDetail?.status || '');

  // Check if order status allows editing shipping address
  const canEditShippingAddress = orderDetail?.permissions.can_update_address || orderDetail?.permissions.can_update_address_except_country;
  const { openStep, completedSteps, toggleStep, completeStep } =
    useCheckoutSteps();
  const {
    shippingAddress,
    setShippingAddress,
    billingAddress,
    setBillingAddress,
    needsBillingAddress,
    setNeedsBillingAddress,
    showShippingForm,
    setShowShippingForm,
    showAddressListModal,
    setShowAddressListModal,
    updateOrderAddress,
    saveAddress,
    isLoading: isAddressLoading,
  } = useShippingAddress(orderId);

  const { updateOrderShippingMethod, isLoading: isShippingMethodLoading } =
    useShippingMethod(orderId);

  // Refs for address form validation
  const shippingAddressRef = useRef<any>(null);
  const billingAddressRef = useRef<any>(null);

  useEffect(() => {
    if (orderDetail) {
      if (orderDetail.shipping_address) {
        setShippingAddress(orderDetail.shipping_address);
        completeStep(1);
      } else {
        setShowShippingForm(true);
      }
      if (orderDetail.billing_address) {
        setBillingAddress(orderDetail.billing_address);
      }
      if (
        orderDetail.shipping_address?.street !==
        orderDetail.billing_address?.street
      ) {
        setNeedsBillingAddress(true);
      }

      // Track InitiateCheckout when checkout page loads
      if (!initiateCheckoutTracked) {
        initiateCheckoutTracked = true;
        const content_ids = orderDetail.items.map((item: any) => getContentIdBySpu(item.spu_code)).filter(Boolean);
        const contents = orderDetail.items.map((item: any) => ({
          id: getContentIdBySpu(item.spu_code),
          quantity: item.quantity || 1
        })).filter(item => item.id);

        fbTrack('InitiateCheckout', {
          value: orderDetail.total_amount,
          currency: 'USD',
          content_ids,
          content_type: 'product',
          contents
        });
      }
    }
  }, [orderDetail]);

  const handleClickAddress = async (address: Address) => {
    setShippingAddress(address);
    const updatedOrder = await updateOrderAddress(address);
    if (updatedOrder) {
      setOrderDetail(updatedOrder);
    }
    setShowAddressListModal(false);
  };

  const handleEditAddress = (address: Address) => {
    setShippingAddress(address);
    setShowAddressListModal(false);
    setShowShippingForm(true);
  };

  const handleApplyCoupon = async (_couponCode: string) => {
    // TODO: Implement coupon logic
  };

  const isSameAddress = (addr1: Address, addr2: Address) => {
    return (
      addr1.email === addr2.email &&
      addr1.first_name === addr2.first_name &&
      addr1.last_name === addr2.last_name &&
      addr1.phone === addr2.phone &&
      addr1.house_number === addr2.house_number &&
      addr1.street === addr2.street &&
      addr1.city === addr2.city &&
      addr1.state === addr2.state &&
      addr1.post_code === addr2.post_code &&
      addr1.country === addr2.country
    );
  };

  const handleNextFromShipping = async () => {
    // Always validate shipping address if form is shown
    if (showShippingForm && shippingAddressRef.current) {
      const isShippingValid =
        shippingAddressRef.current.validateShippingAddress();
      if (!isShippingValid) {
        return; // Stop if shipping address validation fails
      }
    }

    // Always validate billing address if needed and form is shown
    if (needsBillingAddress && billingAddressRef.current) {
      const isBillingValid =
        billingAddressRef.current.validateShippingAddress();
      if (!isBillingValid) {
        return; // Stop if billing address validation fails
      }
    }

    let skipUpdateShippingAddress = false;
    if (orderDetail?.shipping_address) {
      skipUpdateShippingAddress = isSameAddress(
        orderDetail?.shipping_address,
        shippingAddress
      );
    }
    const skipUpdateBillingAddress =
      !needsBillingAddress ||
      (needsBillingAddress &&
        orderDetail?.billing_address?.street === billingAddress.street);

    if (skipUpdateShippingAddress && skipUpdateBillingAddress) {
      if (orderDetail?.permissions.can_pay) {
        completeStep(1);
      } else {
        window.history.back();
      }
      
      return;
    }

    const { success, data, message } = await saveAddress();

    if (success && data) {
      setOrderDetail(data);
      if (orderDetail?.permissions.can_pay) {
        completeStep(1);
      } else {
        window.history.back();
      }
    } else {
      alert(message);
    }
  };

  const handleNextFromDelivery = () => {
    completeStep(2);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <Loading
        isLoading={
          isOrderLoading || isAddressLoading || isShippingMethodLoading
        }
      />
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">{t("title")}</h1>
        {error && <div className="text-center text-red-500 py-4">{error}</div>}

        {showAddressListModal && (
          <AddressCardListModal
            handleClickAddress={handleClickAddress}
            handleEditAddress={handleEditAddress}
            handleCloseModal={() => setShowAddressListModal(false)}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-2/3">
            {/* Step 1: Shipping Information */}
            <CheckoutStep
              stepNumber={1}
              title={t("shipping")}
              isOpen={openStep === 1}
              isCompleted={completedSteps.includes(1)}
              onToggle={() => toggleStep(1)}
              canOpen={true}
            >
              {orderDetail && (
                <ShippingForm
                  orderDetail={orderDetail}
                  address={shippingAddress}
                  setAddress={setShippingAddress}
                  billingAddress={billingAddress}
                  setBillingAddress={setBillingAddress}
                  needsBillingAddress={needsBillingAddress}
                  setNeedsBillingAddress={setNeedsBillingAddress}
                  handleNextFromShipping={handleNextFromShipping}
                  setShowAddressListModal={setShowAddressListModal}
                  showShippingForm={showShippingForm}
                  setShowShippingForm={setShowShippingForm}
                  shippingAddressRef={shippingAddressRef}
                  billingAddressRef={billingAddressRef}
                  canEditShippingAddress={canEditShippingAddress}
                />
              )}
            </CheckoutStep>

            {/* Step 2: Delivery Options */}
            <CheckoutStep
              stepNumber={2}
              title={t("deliveryOptions")}
              isOpen={openStep === 2}
              isCompleted={completedSteps.includes(2)}
              onToggle={() => toggleStep(2)}
              canOpen={completedSteps.includes(1)}
            >
              {orderDetail && (
                <DeliveryOptions
                  orderDetail={orderDetail}
                  updateOrderShippingMethod={async (option) => {
                    const updatedOrder = await updateOrderShippingMethod(
                      option
                    );
                    if (updatedOrder) {
                      setOrderDetail(updatedOrder);
                    }
                  }}
                  handleNextFromDelivery={handleNextFromDelivery}
                />
              )}
            </CheckoutStep>

            {/* Step 3: Review and Pay */}
            <CheckoutStep
              stepNumber={3}
              title={t("reviewAndPay")}
              isOpen={openStep === 3}
              isCompleted={completedSteps.includes(3)}
              onToggle={() => toggleStep(3)}
              canOpen={completedSteps.includes(2)}
            >
              {orderDetail && (
                <ReviewAndPay
                  paymentMethod={paymentMethod}
                  orderDetail={orderDetail}
                />
              )}
            </CheckoutStep>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:w-1/3 relative">
            <OrderSummary
              orderDetail={orderDetail}
              handleApplyCoupon={handleApplyCoupon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutPageContent />
    </CheckoutProvider>
  );
}
