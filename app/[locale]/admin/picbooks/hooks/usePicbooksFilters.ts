'use client';

import { useState } from 'react';

interface DateRange {
  start: string;
  end: string;
}

export const usePicbooksFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [characterCountFilter, setCharacterCountFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    languageFilter,
    setLanguageFilter,
    characterCountFilter,
    setCharacterCountFilter,
    dateRange,
    setDateRange,
  };
};