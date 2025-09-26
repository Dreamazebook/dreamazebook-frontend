'use client';

import { useState } from 'react';

interface DateRange {
  start: string;
  end: string;
}

export const useOrdersFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statusFilter: '',
    paymentStatusFilter: '',
    discountFilter: '',
    regionFilter: '',
    dateRange: { start: '', end: '' },
  });

  const onFilterChange = {
    setStatusFilter: (status: string) => setFilters({ ...filters, statusFilter: status }),
    setPaymentStatusFilter: (status: string) => setFilters({ ...filters, paymentStatusFilter: status }),
    setDiscountFilter: (filter: string) => setFilters({ ...filters, discountFilter: filter }),
    setRegionFilter: (region: string) => setFilters({ ...filters, regionFilter: region }),
    setDateRange: (range: DateRange) => setFilters({ ...filters, dateRange: range }),
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    onFilterChange,
  };
};