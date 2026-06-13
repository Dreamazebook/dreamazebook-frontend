"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useTranslations } from "next-intl";
import { Address } from "@/types/address";
import FormField from "./FormField";
import useUserStore from "@/stores/userStore";
import { OrderDetail, ShippingErrors } from "@/types/order";

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
    <div className="bg-white border border-gray-300 rounded">
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

// ── Field mapping: state key → DOM id ─────────────────────────────────────
const FIELD_IDS: Record<string, string> = {
  email: "email",
  first_name: "first_name",
  last_name: "last_name",
  country: "country",
  address: "address",
  house_number: "address2",
  city: "city",
  post_code: "post_code",
  state: "state",
  phone: "phone",
};

interface AddressFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
  orderDetail: OrderDetail;
  updateShippingAddress?: (orderId: string | number) => Promise<{ success: boolean; message?: string }>;
}

const AddressForm = forwardRef<
  {
    validateShippingAddress: () => boolean;
    /** Scroll to and focus the first field with an error */
    focusFirstError: () => void;
  },
  AddressFormProps
>(({ address, setAddress, orderDetail, updateShippingAddress }, ref) => {
  const { countryList, fetchCountryList } = useUserStore();
  const t = useTranslations("addressForm");
  const [errors, setErrors] = useState<ShippingErrors>({});
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCountryList();
  }, []);

  // ── Autofill sync: read DOM values directly ──────────────────────────────

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * When the browser autofills fields, React state may not be updated.
   * This reads current DOM values and syncs them into address state.
   */
  const syncFromDOM = useCallback(() => {
    const updates: Partial<Address> = {};
    let hasChanges = false;

    (Object.keys(FIELD_IDS) as Array<keyof typeof FIELD_IDS>).forEach((key) => {
      const domId = FIELD_IDS[key];
      const el = document.getElementById(domId) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) return;
      const domValue = el.value.trim();

      // Map state key → address property
      const propMap: Record<string, keyof Address> = {
        email: "email",
        first_name: "first_name",
        last_name: "last_name",
        country: "country",
        address: "street",
        house_number: "house_number",
        city: "city",
        post_code: "post_code",
        state: "state",
        phone: "phone",
      };

      const addressKey = propMap[key];
      if (!addressKey) return;

      const currentValue = (address as any)[addressKey] || "";

      if (domValue && domValue !== currentValue) {
        (updates as any)[addressKey] = domValue;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setAddress((prev) => ({ ...prev, ...updates }));
    }

    return updates;
  }, [address, setAddress]);

  /**
   * Schedule a deferred DOM sync. Useful after paste or autofill events
   * where the browser may take a moment to populate all related fields.
   */
  const scheduleSync = useCallback((delayMs = 150) => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncFromDOM();
    }, delayMs);
  }, [syncFromDOM]);

  // Clean up sync timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // ── Autofill handler per field ───────────────────────────────────────────

  const handleAutofill = useCallback(
    (field: string, value: string) => {
      const propMap: Record<string, keyof Address> = {
        email: "email",
        first_name: "first_name",
        last_name: "last_name",
        address: "street",
        address2: "house_number",
        city: "city",
        post_code: "post_code",
        state: "state",
        phone: "phone",
      };
      const addressKey = propMap[field];
      if (addressKey && value) {
        setAddress((prev) => {
          if ((prev as any)[addressKey] === value) return prev;
          return { ...prev, [addressKey]: value };
        });
        clearError(field as keyof ShippingErrors);
      }
    },
    [setAddress]
  );

  const clearError = (field: keyof ShippingErrors) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────

  // Expose validation + focus methods via ref
  useImperativeHandle(ref, () => ({
    validateShippingAddress: () => {
      // Read DOM values directly for immediate validation (don't wait for React state)
      const domUpdates: Partial<Address> = {};
      let needsSync = false;

      const propMap: Record<string, keyof Address> = {
        email: "email",
        first_name: "first_name",
        last_name: "last_name",
        country: "country",
        address: "street",
        house_number: "house_number",
        city: "city",
        post_code: "post_code",
        state: "state",
        phone: "phone",
      };

      (Object.keys(FIELD_IDS) as Array<keyof typeof FIELD_IDS>).forEach((key) => {
        const domId = FIELD_IDS[key];
        const el = document.getElementById(domId) as HTMLInputElement | HTMLSelectElement | null;
        if (!el) return;
        const domValue = el.value.trim();
        const addressKey = propMap[key];
        if (!addressKey) return;

        if (domValue) {
          (domUpdates as any)[addressKey] = domValue;
          needsSync = true;
        }
      });

      // Merge DOM values into current address for validation
      const addressForValidation = needsSync ? { ...address, ...domUpdates } : address;

      // Also sync React state (async — will update after this call returns)
      if (needsSync) {
        setAddress((prev) => ({ ...prev, ...domUpdates }));
      }

      // Validate with the merged data (includes DOM values)
      return validateShippingInfo(undefined, addressForValidation);
    },
    focusFirstError: () => {
      // Find the first field with an error and focus it
      setTimeout(() => {
        const firstErrorField = Object.keys(errors).find(
          (k) => errors[k as keyof ShippingErrors]
        );
        if (firstErrorField) {
          const domId = FIELD_IDS[firstErrorField];
          const el = document.getElementById(domId);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
    },
  }));

  const validateShippingInfo = (field?: keyof ShippingErrors, addressOverride?: Address): boolean => {
    const addr = addressOverride || address;
    let newErrors: ShippingErrors;

    if (field) {
      newErrors = { ...errors };
    } else {
      newErrors = {} as ShippingErrors;
    }

    const setOrClear = (key: keyof ShippingErrors, message?: string) => {
      if (message) newErrors[key] = message;
      else delete newErrors[key];
    };

    const checkEmail = () => {
      if (!addr.email)
        setOrClear("email", t("required", { field: t("email") }));
      else if (!/\S+@\S+\.\S+/.test(addr.email))
        setOrClear("email", t("invalidEmail"));
      else setOrClear("email");
    };

    const checks: Record<string, () => void> = {
      email: checkEmail,
      first_name: () =>
        setOrClear(
          "first_name",
          addr.first_name
            ? undefined
            : t("required", { field: t("firstName") })
        ),
      last_name: () =>
        setOrClear(
          "last_name",
          addr.last_name
            ? undefined
            : t("required", { field: t("lastName") })
        ),
      address: () =>
        setOrClear(
          "address",
          addr.street ? undefined : t("required", { field: t("address") })
        ),
      city: () =>
        setOrClear(
          "city",
          addr.city ? undefined : t("required", { field: t("city") })
        ),
      post_code: () =>
        setOrClear(
          "post_code",
          addr.post_code
            ? undefined
            : t("required", { field: t("postalCode") })
        ),
      country: () =>
        setOrClear(
          "country",
          addr.country ? undefined : t("required", { field: t("country") })
        ),
      state: () =>
        setOrClear(
          "state",
          addr.state ? undefined : t("required", { field: t("state") })
        ),
      phone: () =>
        setOrClear(
          "phone",
          addr.phone ? undefined : t("required", { field: t("phoneNumber") })
        ),
    } as Record<string, () => void>;

    if (field) {
      const fn = checks[field as string];
      if (fn) fn();
    } else {
      Object.keys(checks).forEach((k) => {
        const fn = checks[k];
        if (fn) fn();
      });
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (error) => error !== undefined
    );
    return !hasErrors;
  };

  // ── Address autocomplete ─────────────────────────────────────────────────

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getAddressSuggestions = useCallback(async () => {
    if (!address?.street || address?.street.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address?.street
        )}.json?access_token=${PUBLIC_MAPBOX_API_KEY}&limit=5&country=${
          address?.country || ""
        }`
      );
      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data.features);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    }
  }, [address?.street, address?.country]);

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

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.city;
      delete newErrors.state;
      delete newErrors.post_code;
      delete newErrors.country;
      delete newErrors.address;
      return newErrors;
    });

    setAddress((prev) => ({
      ...prev,
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      post_code: post_code.trim(),
      country: country.trim(),
    }));

    setAddressSuggestions([]);
  };

  // ── Error summary for full-form validation failure ───────────────────────

  const errorCount = Object.keys(errors).length;
  const errorList = Object.entries(errors)
    .filter(([, msg]) => msg)
    .map(([field, msg]) => ({
      field,
      label: (() => {
        const labelMap: Record<string, string> = {
          email: t("email"),
          first_name: t("firstName"),
          last_name: t("lastName"),
          address: t("address"),
          city: t("city"),
          post_code: t("postalCode"),
          country: t("country"),
          state: t("state"),
          phone: t("phoneNumber"),
        };
        return labelMap[field] || field;
      })(),
      msg: msg as string,
    }));

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={formRef}>
      {/* Error summary banner — shown when there are validation errors */}
      {errorCount > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm font-medium mb-1">
            {t("pleaseFixErrors", {
              defaultValue: `Please fix the following ${errorCount} field(s):`,
            })}
          </p>
          <ul className="list-disc list-inside text-red-600 text-xs space-y-0.5">
            {errorList.map((err) => (
              <li key={err.field}>
                <button
                  type="button"
                  className="underline hover:text-red-800"
                  onClick={() => {
                    const domId = FIELD_IDS[err.field] || err.field;
                    const el = document.getElementById(domId);
                    if (el) {
                      el.focus();
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                >
                  {err.label}: {err.msg}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormField
        id="email"
        label={t("email")}
        type="email"
        required
        autoComplete="email"
        value={address.email}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, email: e.target.value }));
          clearError("email");
        }}
        onBlur={() => validateShippingInfo("email")}
        onAutofill={(v) => handleAutofill("email", v)}
        error={errors.email}
        placeholder={t("emailPlaceholder")}
      >
        <span className="text-[16px] text-[#999]">{t("emailHelp")}</span>
      </FormField>

      <FormField
        id="first_name"
        label={t("firstName")}
        type="text"
        required
        autoComplete="given-name"
        value={address.first_name}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, first_name: e.target.value }));
          clearError("first_name");
        }}
        onBlur={() => validateShippingInfo("first_name")}
        onAutofill={(v) => handleAutofill("first_name", v)}
        error={errors.first_name}
        placeholder={t("firstNamePlaceholder")}
      />

      <FormField
        id="last_name"
        label={t("lastName")}
        type="text"
        required
        autoComplete="family-name"
        value={address.last_name}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, last_name: e.target.value }));
          clearError("last_name");
        }}
        onBlur={() => validateShippingInfo("last_name")}
        onAutofill={(v) => handleAutofill("last_name", v)}
        error={errors.last_name}
        placeholder={t("lastNamePlaceholder")}
      />

      <FormField
        id="country"
        label={t("country")}
        type="select"
        required
        autoComplete="country-name"
        value={address.country}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, country: e.target.value }));
          clearError("country");
        }}
        onBlur={() => validateShippingInfo("country")}
        error={errors.country}
        options={countryList}
        disabled={orderDetail.permissions.can_update_address_except_country}
      />

      <FormField
        id="address"
        label={t("address")}
        type="text"
        required
        autoComplete="street-address"
        value={address.street}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, street: e.target.value }));
          clearError("address");
          debouncedGetAddressSuggestions();
        }}
        onPaste={(e:any) => {
          // After pasting an address, browser autofill may populate other
          // fields (city, state, zip, etc.) without firing onChange events.
          // Schedule a delayed DOM sync to catch those changes.
          setAddress((prev) => ({ ...prev, street: e.target.value }));
          clearError("address");
          debouncedGetAddressSuggestions();
        }}
        onBlur={() => validateShippingInfo("address")}
        onAutofill={(v) => {
          handleAutofill("address", v);
          // Also schedule a sync for related fields after autofill
        }}
        error={errors.address}
        placeholder={t("addressPlaceholder")}
      />

      {address.street && (
        <AddressSuggestions
          addressSuggestions={addressSuggestions}
          handleAddressSuggestionClick={handleAddressSuggestionClick}
        />
      )}

      <FormField
        id="address2"
        label={t("address2")}
        type="text"
        required
        autoComplete="address-line2"
        value={address.house_number}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, house_number: e.target.value }));
          clearError("house_number");
        }}
        onBlur={() => validateShippingInfo("house_number")}
        onAutofill={(v) => handleAutofill("address2", v)}
        error={errors.house_number}
        placeholder={t("address2Placeholder")}
      />

      <FormField
        id="city"
        label={t("city")}
        type="text"
        required
        autoComplete="address-level2"
        value={address.city}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, city: e.target.value }));
          clearError("city");
        }}
        onBlur={() => validateShippingInfo("city")}
        onAutofill={(v) => handleAutofill("city", v)}
        error={errors.city}
        placeholder={t("cityPlaceholder")}
      />

      <FormField
        id="post_code"
        label={t("postalCode")}
        type="text"
        required
        autoComplete="postal-code"
        value={address.post_code}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, post_code: e.target.value }));
          clearError("post_code");
        }}
        onBlur={() => validateShippingInfo("post_code")}
        onAutofill={(v) => handleAutofill("post_code", v)}
        error={errors.post_code}
        placeholder={t("postalCodePlaceholder")}
      />

      <FormField
        id="phone"
        label={t("phoneNumber")}
        type="tel"
        required
        autoComplete="tel"
        value={address.phone}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, phone: e.target.value }));
          clearError("phone");
        }}
        onBlur={() => validateShippingInfo("phone")}
        onAutofill={(v) => handleAutofill("phone", v)}
        error={errors.phone}
        placeholder={t("phoneNumberPlaceholder")}
      >
        {/* <span className="text-[16px] text-[#999]">{t("phoneHelp")}</span> */}
      </FormField>

      <div className="mt-4 mb-6">
        <div className="flex items-center">
          <FormField
            id="setDefaultAddress"
            type="checkbox"
            value={address.is_default}
            onChange={(e: any) =>
              setAddress((prev) => ({ ...prev, is_default: e.target.checked }))
            }
          >
            <span className="text-[16px] text-[#999]">
              {t("saveAsDefault")}
            </span>
          </FormField>
        </div>
      </div>

      {updateShippingAddress && (
        <div className="mt-6">
          <button
            type="button"
            onClick={async () => {
              syncFromDOM();
              if (validateShippingInfo()) {
                setIsUpdating(true);
                try {
                  const result = await updateShippingAddress(orderDetail.id);
                  if (result.success) {
                    console.log("Address updated successfully");
                  } else {
                    console.error("Failed to update address:", result.message);
                  }
                } catch (error) {
                  console.error("Error updating address:", error);
                } finally {
                  setIsUpdating(false);
                }
              }
            }}
            disabled={isUpdating}
            className="w-full cursor-pointer bg-primary text-white font-medium py-3 px-4 rounded transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Updating..." : "Update Shipping Address"}
          </button>
        </div>
      )}
    </div>
  );
});

export default AddressForm;
