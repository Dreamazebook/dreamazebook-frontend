'use client';

import { useState } from 'react';

export const usePicbooksPagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  };
};