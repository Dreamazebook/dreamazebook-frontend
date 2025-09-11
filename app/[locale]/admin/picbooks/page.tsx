'use client';

import { FC, useState } from 'react';
import PicbooksHeader from './components/PicbooksHeader';
import PicbooksFilters from './components/PicbooksFilters';
import PicbooksTable from './components/PicbooksTable';
import PicbooksPagination from './components/PicbooksPagination';
import { usePicbooksData } from './hooks/usePicbooksData';
import { usePicbooksFilters } from './hooks/usePicbooksFilters';
import { usePicbooksPagination } from './hooks/usePicbooksPagination';
import LoadingState from '../orders/components/LoadingState';
import ErrorState from '../orders/components/ErrorState';
import PicbookDetailModal from './components/PicbookDetailModal';

const AdminPicbooksPage: FC = () => {
  const { picbooks, loading, error } = usePicbooksData();
  const {
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
  } = usePicbooksFilters();
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = usePicbooksPagination();

  const totalPicbooks = picbooks.length;
  const lastUpdated = new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', { hour12: false });

  const [selectedPicbook, setSelectedPicbook] = useState(null);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {selectedPicbook && (
        <PicbookDetailModal 
          picbook={selectedPicbook} 
          onClose={() => setSelectedPicbook(null)} 
        />
      )}

      <PicbooksHeader totalPicbooks={totalPicbooks} lastUpdated={lastUpdated} />

      <div className="px-6 py-6">
        <PicbooksFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          languageFilter={languageFilter}
          setLanguageFilter={setLanguageFilter}
          characterCountFilter={characterCountFilter}
          setCharacterCountFilter={setCharacterCountFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        
        <PicbooksTable 
          picbooks={picbooks} 
          searchTerm={searchTerm} 
          setSelectedPicbook={setSelectedPicbook} 
        />
        
        <PicbooksPagination
          totalPicbooks={picbooks.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
    </div>
  );
};

export default AdminPicbooksPage;