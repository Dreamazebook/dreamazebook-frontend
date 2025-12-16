"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useTranslations } from "next-intl";
import { Address } from "@/types/address";
import FormField from "./FormField";
import useUserStore from "@/stores/userStore";
import { ShippingErrors } from "@/types/order";

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

interface AddressFormProps {
  address: Address;
  setAddress: (value: React.SetStateAction<Address>) => void;
}

const AddressForm = forwardRef<
  {
    validateShippingAddress: () => boolean;
  },
  AddressFormProps
>(({ address, setAddress }, ref) => {
  const { countryList } = useUserStore();
  const t = useTranslations("addressForm");
  const [errors, setErrors] = useState<ShippingErrors>({});

  const clearError = (field: keyof ShippingErrors) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Expose validation method via ref
  useImperativeHandle(ref, () => ({
    validateShippingAddress: () => validateShippingInfo(),
  }));

  // Validate shipping information. If `field` is provided, validate only that field.
  const validateShippingInfo = (field?: keyof ShippingErrors): boolean => {
    let newErrors: ShippingErrors;

    if (field) {
      // Start with existing errors, then update the specific field
      newErrors = { ...errors };
    } else {
      // Start with empty errors for full validation
      newErrors = {} as ShippingErrors;
    }

    const setOrClear = (key: keyof ShippingErrors, message?: string) => {
      if (message) newErrors[key] = message;
      else delete newErrors[key];
    };

    const checkEmail = () => {
      if (!address.email)
        setOrClear("email", t("required", { field: t("email") }));
      else if (!/\S+@\S+\.\S+/.test(address.email))
        setOrClear("email", t("invalidEmail"));
      else setOrClear("email");
    };

    const checks: Record<string, () => void> = {
      email: checkEmail,
      first_name: () =>
        setOrClear(
          "first_name",
          address.first_name
            ? undefined
            : t("required", { field: t("firstName") })
        ),
      last_name: () =>
        setOrClear(
          "last_name",
          address.last_name
            ? undefined
            : t("required", { field: t("lastName") })
        ),
      address: () =>
        setOrClear(
          "address",
          address.street ? undefined : t("required", { field: t("address") })
        ),
      city: () =>
        setOrClear(
          "city",
          address.city ? undefined : t("required", { field: t("city") })
        ),
      post_code: () =>
        setOrClear(
          "post_code",
          address.post_code
            ? undefined
            : t("required", { field: t("postalCode") })
        ),
      country: () =>
        setOrClear(
          "country",
          address.country ? undefined : t("required", { field: t("country") })
        ),
      state: () =>
        setOrClear(
          "state",
          address.state ? undefined : t("required", { field: t("state") })
        ),
      phone: () =>
        setOrClear(
          "phone",
          address.phone ? undefined : t("required", { field: t("phoneNumber") })
        ),
    } as Record<string, () => void>;

    if (field) {
      const fn = checks[field as string];
      if (fn) fn();
    } else {
      // validate all (fallback)
      Object.keys(checks).forEach((k) => {
        const fn = checks[k];
        if (fn) fn();
      });
    }

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(
      (error) => error !== undefined
    );
    return !hasErrors;
  };

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Clear errors immediately for the fields that will be auto-filled
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

  return (
    <>
      <FormField
        id="email"
        label={t("email")}
        type="email"
        required
        value={address.email}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, email: e.target.value }));
          clearError("email");
        }}
        onBlur={() => validateShippingInfo("email")}
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
        value={address.first_name}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, first_name: e.target.value }));
          clearError("first_name");
        }}
        onBlur={() => validateShippingInfo("first_name")}
        error={errors.first_name}
        placeholder={t("firstNamePlaceholder")}
      />

      <FormField
        id="last_name"
        label={t("lastName")}
        type="text"
        required
        value={address.last_name}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, last_name: e.target.value }));
          clearError("last_name");
        }}
        onBlur={() => validateShippingInfo("last_name")}
        error={errors.last_name}
        placeholder={t("lastNamePlaceholder")}
      />

      <FormField
        id="country"
        label={t("country")}
        type="select"
        required
        value={address.country}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, country: e.target.value }));
          clearError("country");
        }}
        onBlur={() => validateShippingInfo("country")}
        error={errors.country}
        options={countryList}
      />

      <FormField
        id="address"
        label={t("address")}
        type="text"
        required
        value={address.street}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, street: e.target.value }));
          clearError("address");
          debouncedGetAddressSuggestions();
        }}
        onBlur={() => validateShippingInfo("address")}
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
        id="unit"
        label={t("unit")}
        type="text"
        required
        value={address.unit}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, unit: e.target.value }));
          clearError("unit");
          debouncedGetAddressSuggestions();
        }}
        onBlur={() => validateShippingInfo("unit")}
        error={errors.unit}
        placeholder={t("unitPlaceholder")}
      />

      <FormField
        id="city"
        label={t("city")}
        type="text"
        required
        value={address.city}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, city: e.target.value }));
          clearError("city");
        }}
        onBlur={() => validateShippingInfo("city")}
        error={errors.city}
        placeholder={t("cityPlaceholder")}
      />

      <FormField
        id="post_code"
        label={t("postalCode")}
        type="text"
        required
        value={address.post_code}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, post_code: e.target.value }));
          clearError("post_code");
        }}
        onBlur={() => validateShippingInfo("post_code")}
        error={errors.post_code}
        placeholder={t("postalCodePlaceholder")}
      />

      <FormField
        id="phone"
        label={t("phoneNumber")}
        type="tel"
        required
        value={address.phone}
        onChange={(e) => {
          setAddress((prev) => ({ ...prev, phone: e.target.value }));
          clearError("phone");
        }}
        onBlur={() => validateShippingInfo("phone")}
        error={errors.phone}
        placeholder={t("phoneNumberPlaceholder")}
      >
        <span className="text-[16px] text-[#999]">{t("phoneHelp")}</span>
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
    </>
  );
});

export default AddressForm;
