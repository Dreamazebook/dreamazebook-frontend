"use client";

import { API_SHIPPING_ESTIMATE } from '@/constants/api';
import api from '@/utils/api';
import React, { useState, useEffect } from 'react';
import { ShippingOption } from '../checkout/components/types';
import { ApiResponse } from '@/types/api';

interface RateResponse {
  shipping_options: ShippingOption[] 
};

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'CN', label: 'China' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'FR', label: 'France' },
];

export default function ShippingEstimator() {
  const [country, setCountry] = useState<string>('US');
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchShippingOptions = async (countryCode: string) => {
    setLoading(true);
    setError(null);
    setShippingOptions([]);
    try {
      // example package dimensions/weight and currency
      const weight = 600; // grams
      const length = 20; // cm
      const width = 15; // cm
      const height = 2; // cm
      const currency = 'USD';

      const url = `${API_SHIPPING_ESTIMATE}?country_code=${encodeURIComponent(countryCode)}&weight=${weight}&length=${length}&width=${width}&height=${height}&currency=${currency}`;
      const {data,code,message,success} = await api.get<ApiResponse<RateResponse>>(url);
      console.log(data);

      if (success && data) {
        setShippingOptions(data.shipping_options);
      } else if (message) {
        setError(message);
      }

    } catch (err: any) {
      console.error('fetchShippingOptions error', err);
      setError(err.message || 'Failed to fetch shippingOptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch on mount for default country
    fetchShippingOptions(country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = e.target.value;
    setCountry(c);
    fetchShippingOptions(c);
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Estimate delivery time & cost</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Destination country</span>
          <select
            value={country}
            onChange={onCountryChange}
            className="mt-1 block w-full p-2 border rounded-md"
            aria-label="Select destination country"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchShippingOptions(country)}
            className="bg-gray-900 text-white px-4 py-2 rounded-md"
          >
            Refresh
          </button>
          {loading && <span className="text-sm text-gray-500">Loading…</span>}
        </div>
      </div>

      <div className="mt-4">
        {error && <div className="text-red-600">{error}</div>}

        {!error && !loading && (
          <div>
            {shippingOptions.length === 0 ? (
              <div className="text-sm text-gray-600">No shipping options available for this destination.</div>
            ) : (
              <ul className="">
                {shippingOptions.map((opt) => (
                  <li key={opt.code} className="p-3 border rounded-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-gray-900">{opt.name || opt.code}</div>
                        {opt.description && <div className="text-sm text-gray-600">{opt.description}</div>}
                        <div className="text-sm text-gray-500 mt-1">Estimated: {opt.estimated_days ?? '-'} days</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{opt.currency ?? 'USD'} {opt.cost?.toFixed ? opt.cost.toFixed(2) : String(opt.cost)}</div>
                        {opt.is_trackable && <div className="text-xs text-green-600">Trackable</div>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
