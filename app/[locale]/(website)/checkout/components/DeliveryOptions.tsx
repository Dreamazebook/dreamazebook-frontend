'use client';

import React from 'react';
import { DeliveryOption } from './types';

interface DeliveryOptionsProps {
  selectedDeliveryOption: DeliveryOption;
  setSelectedDeliveryOption: (option: DeliveryOption) => void;
  handleNextFromDelivery: () => void;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  selectedDeliveryOption,
  setSelectedDeliveryOption,
  handleNextFromDelivery
}) => {
  return (
    <div>
      <div className="space-y-4 mb-6">
        <div 
          className={`border rounded-lg p-4 cursor-pointer ${selectedDeliveryOption === 'Standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onClick={() => setSelectedDeliveryOption('Standard')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${selectedDeliveryOption === 'Standard' ? 'border-blue-500' : 'border-gray-300'}`}>
                {selectedDeliveryOption === 'Standard' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium">Standard Delivery</h4>
                <p className="text-sm text-gray-600">Estimated delivery: 3-5 business days</p>
              </div>
            </div>
            <span className="font-medium">$4.99</span>
          </div>
        </div>

        <div 
          className={`border rounded-lg p-4 cursor-pointer ${selectedDeliveryOption === 'Express' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onClick={() => setSelectedDeliveryOption('Express')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${selectedDeliveryOption === 'Express' ? 'border-blue-500' : 'border-gray-300'}`}>
                {selectedDeliveryOption === 'Express' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium">Express Delivery</h4>
                <p className="text-sm text-gray-600">Estimated delivery: 1-2 business days</p>
              </div>
            </div>
            <span className="font-medium">$9.99</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleNextFromDelivery}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default DeliveryOptions;