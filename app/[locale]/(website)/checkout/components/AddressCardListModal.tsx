'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed z-10 inset-0 overflow-y-auto h-screen w-screen"
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50"
          onClick={handleCloseModal}
        />

        {/* Modal */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          className="fixed right-0 top-0 w-full sm:w-[90%] md:w-[60%] lg:w-[40%] h-full bg-white shadow-xl"
        >
          <div className="relative h-full flex flex-col">
            <div className="border-b px-5 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Addresses</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 rounded-md flex cursor-pointer items-center justify-center hover:bg-gray-100"
                onClick={handleCloseModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-y-auto"
            >
              <AddressCardList
                addressList={addressList}
                handleClickAddress={handleClickAddress}
                handleEditAddress={handleEditAddress}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddressCardListModal;