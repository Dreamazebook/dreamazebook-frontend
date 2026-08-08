"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Address } from "@/types/address";
import { OrderDetail, ShippingOption, getShippingOptions, ShippingErrors } from "@/types/order";
import FormField from "./FormField";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import useUserStore from "@/stores/userStore";
import DisplayPrice from "../../../components/component/DisplayPrice";
import OrderSummaryPrices from "../../../components/component/OrderSummaryPrices";
import CouponInput from "../../shopping-cart/components/CouponInput";
import { CouponInfo } from "@/types/order-summary";
import api from "@/utils/api";
import { API_ORDER_STRIPE_PAID } from "@/constants/api";
import { ApiResponse } from "@/types/api";
import { useRouter } from "@/i18n/routing";
import { ORDER_SUMMARY_URL } from "@/constants/links";
import { fbTrackCustom, getContentIdBySpu, trackAddPaymentInfo } from "@/utils/track";
import NeedHelpSection from "../../shopping-cart/components/NeedHelpSection";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const PUBLIC_MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

// ── Address suggestions dropdown ────────────────────────────────────────
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
    <div className="bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
      {addressSuggestions.map((suggestion, index) => (
        <div
          key={index}
          className="p-2 hover:bg-gray-100 cursor-pointer text-[14px] text-[#222] border-b border-gray-100 last:border-b-0"
          onClick={() => handleAddressSuggestionClick(suggestion)}
        >
          {suggestion.place_name}
        </div>
      ))}
    </div>
  );
};

interface MobileCheckoutProps {
  orderDetail: OrderDetail;
  shippingAddress: Address;
  setShippingAddress: (value: React.SetStateAction<Address>) => void;
  handleApplyCoupon: (code: string) => void;
  handleRemoveCoupon?: () => void;
  couponApplying?: boolean;
  couponError?: string;
  updateOrderShippingMethod: (option: ShippingOption) => Promise<void>;
  paymentMethod?: string;
  saveAddress: () => Promise<{ success: boolean; data?: OrderDetail; message?: string }>;
}

const FIELD_IDS: Record<string, string> = {
  email: "m_email",
  first_name: "m_first_name",
  last_name: "m_last_name",
  country: "m_country",
  street: "m_address",
  phone: "m_phone",
};

const MobileCheckout: React.FC<MobileCheckoutProps> = ({
  orderDetail,
  shippingAddress,
  setShippingAddress,
  handleApplyCoupon,
  handleRemoveCoupon,
  couponApplying,
  couponError,
  updateOrderShippingMethod,
  paymentMethod = "card",
  saveAddress,
}) => {
  const t = useTranslations("checkoutPage");
  const tForm = useTranslations("addressForm");
  const router = useRouter();
  const { countryList, fetchCountryList } = useUserStore();

  useEffect(() => {
    if (countryList.length === 0) {
      fetchCountryList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [editAddressMode, setEditAddressMode] = useState(false);

  const couponInfo: CouponInfo | undefined = orderDetail?.coupon_code
    ? {
        status: "applied",
        code: orderDetail.coupon_code,
        discount_amount: orderDetail.discount_amount || 0,
        type: orderDetail.discount_details?.type || "fixed",
        value: orderDetail.discount_details?.percentage || 0,
        coupon_id: 0,
        campaign_name: "",
        created_for: null,
        description: "",
        subtotal_before_coupon: 0,
        subtotal_after_coupon: 0,
        reservation_ttl_hours: 0,
        applied_at: "",
      }
    : undefined;

  const total = orderDetail?.total_amount || 0;

  // ── Address autocomplete ──────────────────────────────────────────────
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const addressSuggestionsRef = useRef<any[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const [addressSelectedFromList, setAddressSelectedFromList] = useState(false);
  const [errors, setErrors] = useState<ShippingErrors>({});

  const clearError = (field: keyof ShippingErrors) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateField = (field: keyof ShippingErrors, addr: Address): string | undefined => {
    const isValidPhone = (phone: string): boolean => /^\+?\d{7,15}$/.test(phone.replace(/[\s\-()]/g, ''));
    switch (field) {
      case 'email':
        if (!addr.email) return tForm('emailRequired');
        if (!/\S+@\S+\.\S+/.test(addr.email)) return tForm('emailInvalid');
        return undefined;
      case 'first_name':
        return addr.first_name ? undefined : tForm('firstNameRequired');
      case 'last_name':
        return addr.last_name ? undefined : tForm('lastNameRequired');
      case 'country':
        return addr.country ? undefined : tForm('countryRequired');
      case 'address':
        return addr.street ? undefined : tForm('addressRequired');
      case 'phone':
        if (!addr.phone) return tForm('phoneRequired');
        if (!isValidPhone(addr.phone)) return tForm('phoneInvalid');
        return undefined;
      default:
        return undefined;
    }
  };

  const validateShippingInfo = (field?: keyof ShippingErrors, addressOverride?: Address): boolean => {
    const addr = addressOverride || shippingAddress;
    const newErrors: ShippingErrors = field ? { ...errors } : {};

    const fields: (keyof ShippingErrors)[] = ['email', 'first_name', 'last_name', 'country', 'address', 'phone'];
    const checks = field ? [field] : fields;

    checks.forEach((f) => {
      const msg = validateField(f, addr);
      if (msg) newErrors[f] = msg;
      else delete newErrors[f];
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const focusFirstError = () => {
    setTimeout(() => {
      const firstErrorField = Object.keys(errors).find((k) => errors[k as keyof ShippingErrors]);
      if (firstErrorField) {
        const domId = FIELD_IDS[firstErrorField] || firstErrorField;
        const el = document.getElementById(domId);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const getAddressSuggestions = useCallback(async () => {
    const query = shippingAddress.street;
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      addressSuggestionsRef.current = [];
      return;
    }
    try {
      const countryParam = shippingAddress.country
        ? `&country=${encodeURIComponent(shippingAddress.country)}`
        : "";
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${PUBLIC_MAPBOX_API_KEY}&limit=5${countryParam}`
      );
      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data.features);
        addressSuggestionsRef.current = data.features || [];
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    }
  }, [shippingAddress.street, shippingAddress.country]);

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
    const street = suggestion.place_name.split(", ")[0];
    let city = "";
    let state = "";
    let post_code = "";
    let country = "";

    context.forEach((item: any) => {
      if (item.id.includes("place")) city = item.text;
      if (item.id.includes("region")) state = item.text;
      if (item.id.includes("postcode")) post_code = item.text;
      if (item.id.includes("country")) country = item.short_code.toUpperCase();
    });

    setShippingAddress((prev) => ({
      ...prev,
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      post_code: post_code.trim(),
      country: country.trim(),
    }));

    setAddressSuggestions([]);
    setShowAddressPrompt(false);
    setAddressSelectedFromList(true);
    clearError("address");
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // If an existing shipping address is present on the order, jump straight to step 2
  useEffect(() => {
    if (
      orderDetail?.shipping_address?.street &&
      orderDetail?.shipping_address?.city &&
      orderDetail?.shipping_address?.country
    ) {
      setMobileStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDetail?.shipping_address?.street, orderDetail?.shipping_address?.city, orderDetail?.shipping_address?.country]);

  // Reset edit mode when entering step 2
  useEffect(() => {
    if (mobileStep === 2) {
      setEditAddressMode(false);
    }
  }, [mobileStep]);

  const handleContinueFromShipping = async () => {
    // Validate all required fields
    if (!validateShippingInfo()) {
      focusFirstError();
      return;
    }

    // Check if address was selected from list
    if (!addressSelectedFromList) {
      setErrors((prev) => ({ ...prev, address: tForm("selectAddressFromList") }));
      focusFirstError();
      return;
    }

    // Save the address
    const result = await saveAddress();
    if (result.success) {
      setMobileStep(2);
    } else {
      alert(result.message || "Failed to save address");
    }
  };

  const handleEditClick = () => {
    setEditAddressMode(true);
    setMobileStep(1);
  };

  return (
    <div className="lg:hidden bg-[#F5F5F5] min-h-screen pb-[180px]">
      {/* Top bar: back arrow + title + secure checkout */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center relative py-4">
          <button
            onClick={() => {
              if (mobileStep === 2 && !editAddressMode) {
                setMobileStep(1);
              } else {
                window.history.back();
              }
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1"
            aria-label="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-[18px] font-bold text-[#222]">{t("title")}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#165C52" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <span className="text-[12px] text-[#666]">{t("secureCheckout")}</span>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-4 pb-4">
          <div className="flex items-center">
            {/* Step 1 circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                  mobileStep === 1
                    ? "bg-primary text-white"
                    : mobileStep === 2
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {mobileStep === 2 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  "1"
                )}
              </div>
              <span
                className={`text-[11px] mt-1 whitespace-nowrap ${
                  mobileStep === 1 ? "text-[#165C52] font-medium" : "text-[#666]"
                }`}
              >
                {t("shippingDetails")}
              </span>
            </div>

            <div className={`flex-1 h-[2px] mx-2 mb-4 ${mobileStep === 2 ? "bg-primary" : "bg-gray-200"}`} />

            {/* Step 2 circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                  mobileStep === 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-[11px] mt-1 whitespace-nowrap ${
                  mobileStep === 2 ? "text-[#165C52] font-medium" : "text-[#666]"
                }`}
              >
                {t("deliveryAndPayment")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Shipping Details */}
      {mobileStep === 1 && (
        <div className="px-4 pt-4 space-y-6">
          {/* Error summary banner */}
          {/* {Object.keys(errors).filter((k) => errors[k as keyof ShippingErrors]).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm font-medium mb-1">
                {tForm("pleaseFixErrors", { count: Object.keys(errors).filter((k) => errors[k as keyof ShippingErrors]).length })}
              </p>
            </div>
          )} */}

          {/* Contact information */}
          <section>
            <h2 className="text-[16px] font-bold text-[#222] mb-3">{t("contactInformation")}</h2>
            <FormField
              id={FIELD_IDS.email}
              label={tForm("email")}
              type="email"
              required
              autoComplete="email"
              value={shippingAddress.email}
              onChange={(e) => {
                setShippingAddress((prev) => ({ ...prev, email: e.target.value }));
                clearError("email");
              }}
              onBlur={() => validateShippingInfo("email")}
              error={errors.email}
              placeholder={tForm("emailPlaceholder")}
            >
            </FormField>
          </section>

          {/* Shipping address */}
          <section>
            <h2 className="text-[16px] font-bold text-[#222] mb-3">{t("shippingAddress")}</h2>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                id={FIELD_IDS.first_name}
                label={tForm("firstName")}
                type="text"
                required
                autoComplete="given-name"
                value={shippingAddress.first_name}
                onChange={(e) => {
                  setShippingAddress((prev) => ({ ...prev, first_name: e.target.value }));
                  clearError("first_name");
                }}
                onBlur={() => validateShippingInfo("first_name")}
                error={errors.first_name}
                placeholder={tForm("firstNamePlaceholder")}
              />
              <FormField
                id={FIELD_IDS.last_name}
                label={tForm("lastName")}
                type="text"
                required
                autoComplete="family-name"
                value={shippingAddress.last_name}
                onChange={(e) => {
                  setShippingAddress((prev) => ({ ...prev, last_name: e.target.value }));
                  clearError("last_name");
                }}
                onBlur={() => validateShippingInfo("last_name")}
                error={errors.last_name}
                placeholder={tForm("lastNamePlaceholder")}
              />
            </div>

            <FormField
              id={FIELD_IDS.country}
              label={t("countryRegion")}
              type="select"
              required
              autoComplete="country-name"
              value={shippingAddress.country}
              onChange={(e) => {
                setShippingAddress((prev) => ({ ...prev, country: e.target.value }));
                clearError("country");
              }}
              onBlur={() => validateShippingInfo("country")}
              error={errors.country}
              options={countryList}
            />

            <FormField
              id={FIELD_IDS.street}
              label={tForm("address")}
              type="text"
              required
              autoComplete="street-address"
              value={shippingAddress.street}
              onChange={(e) => {
                setShippingAddress((prev) => ({ ...prev, street: e.target.value }));
                clearError("address");
                setAddressSelectedFromList(false);
                debouncedGetAddressSuggestions();
                setShowAddressPrompt(false);
              }}
              onPaste={(e) => {
                const pastedText = e.clipboardData?.getData('text') || '';
                setAddressSelectedFromList(false);
                if (pastedText.length > 20) {
                  setShowAddressPrompt(true);
                  debouncedGetAddressSuggestions();
                }
              }}
              onBlur={() => validateShippingInfo("address")}
              onAutofill={(v) => {
                setShippingAddress((prev) => ({ ...prev, street: v }));
                setAddressSelectedFromList(false);
                setShowAddressPrompt(false);
              }}
              error={errors.address}
              placeholder="Start typing your address..."
            >
              {/* Persistent hint + paste warning */}
              <div className="space-y-1">
                <span className="text-[12px] text-[#999]">{tForm("selectAddressFromListHint")}</span>
                {showAddressPrompt && addressSuggestions.length > 0 && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                    Please select an address from the list or enter it manually.
                  </div>
                )}
              </div>
            </FormField>

            
            {shippingAddress.street && (
              <AddressSuggestions
                addressSuggestions={addressSuggestions}
                handleAddressSuggestionClick={handleAddressSuggestionClick}
              />
            )}

            {/* Additional address fields shown after suggestion selection */}
            {shippingAddress.city && (
              <>
                <FormField
                  id="m_house_number"
                  label={tForm("address2")}
                  type="text"
                  autoComplete="address-line2"
                  value={shippingAddress.house_number || ""}
                  onChange={(e) => {
                    setShippingAddress((prev) => ({ ...prev, house_number: e.target.value }));
                  }}
                  placeholder={tForm("address2Placeholder")}
                />
                <FormField
                  id="m_city"
                  label={tForm("city")}
                  type="text"
                  required
                  autoComplete="address-level2"
                  value={shippingAddress.city || ""}
                  onChange={(e) => {
                    setShippingAddress((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  placeholder={tForm("cityPlaceholder")}
                />
                <FormField
                  id="m_post_code"
                  label={tForm("postalCode")}
                  type="text"
                  required
                  autoComplete="postal-code"
                  value={shippingAddress.post_code || ""}
                  onChange={(e) => {
                    setShippingAddress((prev) => ({ ...prev, post_code: e.target.value }));
                  }}
                  placeholder={tForm("postalCodePlaceholder")}
                />
              </>
            )}

            <FormField
              id={FIELD_IDS.phone}
              label={tForm("phoneNumber")}
              type="tel"
              required
              autoComplete="tel"
              value={shippingAddress.phone}
              onChange={(e) => {
                setShippingAddress((prev) => ({ ...prev, phone: e.target.value }));
                clearError("phone");
              }}
              onBlur={() => validateShippingInfo("phone")}
              error={errors.phone}
              placeholder={tForm("phoneNumberPlaceholder")}
            >
              <span className="text-[12px] text-[#999]">{t("phoneHelp")}</span>
            </FormField>
          </section>
        </div>
      )}

      {/* Step 2: Delivery & Payment */}
      {mobileStep === 2 && (
        <div className="px-4 pt-4 space-y-4">
          {/* Shipping details card */}
          <section className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-[#222]">{t("shippingDetails")}</span>
              </div>
              <button
                onClick={handleEditClick}
                className="px-3 py-1 border border-gray-200 rounded-md text-[13px] text-[#222]"
              >
                {t("edit")}
              </button>
            </div>
            <div className="text-[14px] text-[#222] space-y-0.5">
              <div>
                {shippingAddress.first_name} {shippingAddress.last_name}
              </div>
              <div>{shippingAddress.house_number} {shippingAddress.street}</div>
              <div>{shippingAddress.post_code} {shippingAddress.city}</div>
              <div>{shippingAddress.country}</div>
              <div>{shippingAddress.email}</div>
              <div>{shippingAddress.phone}</div>
            </div>
          </section>

          {/* Delivery method */}
          <section>
            <h2 className="text-[16px] font-bold text-[#222] mb-3 mt-2">{t("deliveryMethod")}</h2>
            <div className="space-y-3">
              {getShippingOptions(orderDetail.shipping_options).map(({ code, cost, name, is_free, payable_cost, type, estimated_days }) => {
                const selected = orderDetail.shipping_method === code;
                return (
                  <button
                    key={type}
                    onClick={() => updateOrderShippingMethod({ code, cost, payable_cost })}
                    className={`w-full bg-white rounded-xl p-4 text-left flex items-start justify-between ${
                      selected ? "border-2 border-[#165C52]" : "border border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border-2 ${
                          selected ? "border-[#165C52]" : "border-gray-300"
                        }`}
                      >
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#222]">
                          {name || (type === "express" ? t("expressDelivery") : t("standardDelivery"))}
                        </p>
                        <p className="text-[12px] text-[#999] mt-0.5">
                          {t("estimatedDelivery", { days: estimated_days })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[13px] font-bold ${is_free ? "text-[#165C52]" : "text-[#222]"}`}>
                      {is_free ? "FREE" : `$${(payable_cost || cost).toFixed(2)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-xl p-4">
            <h2 className="text-[16px] font-bold text-[#222] mb-1">{t("cardInformation")}</h2>
            <p className="text-[12px] text-[#666] mb-3">{t("allTransactionsSecure")}</p>
            {orderDetail.stripe_client_secret ? (
              <PaymentLoadingProvider>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: orderDetail.stripe_client_secret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#165C52",
                        colorBackground: "#ffffff",
                        colorText: "#222222",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <MobilePaymentForm orderDetail={orderDetail} paymentMethod={paymentMethod} />
                </Elements>
              </PaymentLoadingProvider>
            ) : (
              <p className="text-sm text-gray-500">{t("errorLoadingOrder")}</p>
            )}
          </section>

          {/* Order summary */}
          <section className="bg-white rounded-xl p-4">
            <OrderSummaryPrices orderDetail={orderDetail} />
          </section>

          {/* Coupon */}
          <section className="bg-white rounded-xl p-4">
            {/* <CouponInput
              onApply={handleApplyCoupon}
              onRemove={handleRemoveCoupon}
              coupon={couponInfo}
              couponApplying={couponApplying}
              couponError={couponError}
            /> */}
            <NeedHelpSection />
          </section>
        </div>
      )}

      {/* Bottom fixed bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] text-[#666]">Total</p>
            <DisplayPrice value={total} style="text-[20px] font-bold text-[#222]" />
          </div>
          {mobileStep === 1 ? (
            <button
              onClick={handleContinueFromShipping}
              className="flex-1 h-[52px] bg-primary text-white rounded-xl font-medium text-[16px] flex items-center justify-center"
            >
              {t("continueToDelivery")}
            </button>
          ) : (
            <PayButton total={total} />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Shared pay button + payment loading state ──────────────────────────

// Context to share loading state between PayButton and MobilePaymentForm
const PaymentLoadingContext = React.createContext<{
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}>({ isLoading: false, setIsLoading: () => {} });

const PaymentLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <PaymentLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </PaymentLoadingContext.Provider>
  );
};

const PayButton: React.FC<{ total: number }> = ({ total }) => {
  const t = useTranslations("checkoutPage");
  const { isLoading } = React.useContext(PaymentLoadingContext);

  return (
    <button
      type="submit"
      form="m-pay-form"
      disabled={isLoading}
      className="flex-1 h-[52px] bg-primary text-white rounded-xl font-medium text-[16px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      )}
      {isLoading ? t("processing") : t("payNow")}
    </button>
  );
};

// Stripe payment subform for mobile step 2
const MobilePaymentForm: React.FC<{ orderDetail: OrderDetail; paymentMethod?: string }> = ({
  orderDetail,
  paymentMethod,
}) => {
  const t = useTranslations("checkoutPage");
  const stripe = useStripe();
  const elements = useElements();
  const { isLoading, setIsLoading } = React.useContext(PaymentLoadingContext);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setMessage("");

    const content_ids = orderDetail.items.map((item: any) => getContentIdBySpu(item));
    const contents = orderDetail.items.map((item: any) => ({
      id: getContentIdBySpu(item),
      quantity: item.quantity || 1,
    })).filter((item: any) => item.id);

    fbTrackCustom("PlaceOrder", {
      value: Number(orderDetail.total_amount),
      currency: "USD",
      content_ids,
      content_type: "product",
      contents,
    });

    const ga4Items = orderDetail.items.map((item: any) => ({
      item_id: item.id || item.spu_code || "",
      item_name: item.sku_name || item.spu_code || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
    }));
    trackAddPaymentInfo(ga4Items, orderDetail.total_amount || 0);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.origin + ORDER_SUMMARY_URL(orderDetail.id),
        receipt_email: orderDetail.shipping_address?.email || undefined,
      },
    });

    if (error) {
      setMessage(error.message || t("paymentFailed"));
      setIsLoading(false);
      return;
    }

    switch (paymentIntent?.status) {
      case "succeeded":
        try {
          const { success } = await api.post<ApiResponse>(API_ORDER_STRIPE_PAID, {
            order_id: orderDetail.id,
            payment_intent_id: orderDetail.stripe_payment_intent_id,
          });
          if (success) {
            return router.push(ORDER_SUMMARY_URL(orderDetail.id));
          } else {
            setMessage(t("errorLoadingOrder"));
          }
        } catch (err) {
          setMessage(t("paymentFailed"));
        }
        break;
      case "processing":
        setMessage(t("paymentProcessing"));
        break;
      case "requires_payment_method":
        setMessage(t("paymentFailed"));
        break;
      default:
        setMessage(t("paymentStatusUnknown"));
    }
    setIsLoading(false);
  };

  return (
    <form id="m-pay-form" onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: {
            billingDetails: { email: orderDetail.shipping_address?.email },
          },
          paymentMethodOrder: paymentMethod == "paypal" 
            ? ["paypal", "google_pay", "apple_pay", "card"] 
            : ["card", "paypal", "google_pay", "apple_pay"],
        } as any}
      />
      {message && (
        <div
          className={`mt-3 p-2 rounded text-sm ${
            message.toLowerCase().includes("success") || message.toLowerCase().includes("succeeded")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
};

export default MobileCheckout;