"use client";

import { API_SHIPPING_ESTIMATE } from '@/constants/api';
import api from '@/utils/api';
import React, { useState, useEffect } from 'react';
import { ShippingOption } from '@/types/order';
import { ApiResponse } from '@/types/api';
import useUserStore from '@/stores/userStore';

interface RateResponse {
  shipping_options: ShippingOption[] 
};

export default function ShippingEstimator() {
  const [country, setCountry] = useState<string>('US');
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {countryList, fetchCountryList} = useUserStore();

  useEffect(() => { 
    fetchCountryList();
  }, [fetchCountryList]);

  const fetchShippingOptions = async (countryCode: string) => {
    setLoading(true);
    setError(null);
    setShippingOptions([]);
    try {
      const {data,code,message,success} = await api.post<ApiResponse<RateResponse>>(API_SHIPPING_ESTIMATE,{
        country_code: countryCode,
      });

      

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
    <div className="p-4 rounded shadow">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Delivery Estimate</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <label className="block mb-2">
            <select
              value={country}
              onChange={onCountryChange}
              className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-label="Select destination country"
            >
              {countryList.map((c,idx) => (
                <option key={c.value+idx} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchShippingOptions(country)}
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {!error && !loading && (
          <div>
            {shippingOptions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">No shipping options available for this destination</p>
                <p className="text-sm text-gray-400 mt-1">Please try selecting a different country</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {shippingOptions.map((opt, index) => (
                  <div 
                    key={opt.code} 
                    className="bg-white p-6 rounded border border-gray-100 shadow hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="font-semibold text-lg text-gray-900">{opt.name || opt.code}</div>
                          {opt.is_trackable && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Trackable
                            </span>
                          )}
                        </div>
                        
                        {opt.description && (
                          <div className="text-gray-600 mb-3">{opt.description}</div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Estimated: <strong className="text-gray-700">{opt.estimated_days ?? '-'} days</strong></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {opt.currency ?? 'USD'} {opt.cost?.toFixed ? opt.cost.toFixed(2) : String(opt.cost)}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Shipping Cost</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
