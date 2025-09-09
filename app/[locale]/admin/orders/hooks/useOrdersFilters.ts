'use client';

import { useState } from 'react';

interface DateRange {
  start: string;
  end: string;
}

export const useOrdersFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [discountFilter, setDiscountFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    discountFilter,
    setDiscountFilter,
    regionFilter,
    setRegionFilter,
    dateRange,
    setDateRange,
  };
};