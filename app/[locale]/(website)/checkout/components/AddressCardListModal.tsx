'use client';

import React from 'react';
import { Address } from '@/types/address';
import AddressCardList from '../../components/address/AddressCardList';

interface AddressCardListModalProps {
  addressList: Address[];
  handleCloseModal?: () => void;
  handleEditAddress?: (address: Address) => void;
  handleClickAddress?: (address: Address) => void;
  
}

const AddressCardListModal: React.FC<AddressCardListModalProps> = ({
  addressList,
  handleCloseModal,
  handleEditAddress,
  handleClickAddress,
}) => {
  return (
    <div className='fixed z-10 inset-0 bg-black/50 overflow-y-auto h-screen w-screen' onClick={handleCloseModal}>
      <div className='fixed right-0 top-0 w-[40%] h-full bg-white'>
        <h3 className='border-b text-xl font-semibold px-5 py-4'>Addresses</h3>
        <button className="absolute top-5 right-3 w-7 h-7 rounded-md flex cursor-pointer items-center justify-center" onClick={handleCloseModal}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>
        <AddressCardList
          addressList={addressList}
          handleClickAddress={handleClickAddress}
          handleEditAddress={handleEditAddress}
        />
      </div>
    </div>
  );
};

export default AddressCardListModal;