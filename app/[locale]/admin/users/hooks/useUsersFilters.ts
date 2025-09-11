'use client';

import { useState } from 'react';

interface DateRange {
  start: string;
  end: string;
}

export const useUsersFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [regionFilter, setRegionFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [satisfactionFilter, setSatisfactionFilter] = useState('');

  return {
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    regionFilter,
    setRegionFilter,
    sourceFilter,
    setSourceFilter,
    satisfactionFilter,
    setSatisfactionFilter,
  };
};