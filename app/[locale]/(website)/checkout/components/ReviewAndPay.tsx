'use client';

import React from 'react';
import { PaymentOption } from './types';

interface ReviewAndPayProps {
  selectedPaymentOption: PaymentOption;
  setSelectedPaymentOption: (option: PaymentOption) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cardName: string;
  setCardName: (value: string) => void;
  cardExpiry: string;
  setCardExpiry: (value: string) => void;
  cardCvc: string;
  setCardCvc: (value: string) => void;
  handlePlaceOrder: () => void;
}

const ReviewAndPay: React.FC<ReviewAndPayProps> = ({
  selectedPaymentOption,
  setSelectedPaymentOption,
  cardNumber,
  setCardNumber,
  cardName,
  setCardName,
  cardExpiry,
  setCardExpiry,
  cardCvc,
  setCardCvc,
  handlePlaceOrder
}) => {
  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-4">Payment Method</h4>
        
        <div className="space-y-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${selectedPaymentOption === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onClick={() => setSelectedPaymentOption('card')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${selectedPaymentOption === 'card' ? 'border-blue-500' : 'border-gray-300'}`}>
                {selectedPaymentOption === 'card' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium">Credit / Debit Card</h4>
              </div>
            </div>
            
            {selectedPaymentOption === 'card' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                  <input
                    type="text"
                    id="cardName"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      id="cardExpiry"
                      placeholder="MM/YY"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input
                      type="text"
                      id="cardCvc"
                      placeholder="123"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${selectedPaymentOption === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onClick={() => setSelectedPaymentOption('paypal')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${selectedPaymentOption === 'paypal' ? 'border-blue-500' : 'border-gray-300'}`}>
                {selectedPaymentOption === 'paypal' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium">PayPal</h4>
                <p className="text-sm text-gray-600">You will be redirected to PayPal to complete your purchase.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          disabled={!selectedPaymentOption}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default ReviewAndPay;