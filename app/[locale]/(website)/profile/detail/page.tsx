"use client";
import useUserStore from '@/stores/userStore';
import React, { useState } from 'react';
export default function AccountDetails() {
  const {user} = useUserStore();
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Augustine',
      email: '15574892055@163.com',
      address: 'Wuhou District, Chengdu City, Sichuan Province, China',
      type: 'Home'
    },
    {
      id: 2,
      name: 'Augustine',
      email: '15574892055@163.com',
      address: 'Wuhou District, Chengdu City, Sichuan Province, China',
      type: 'default'
    },
    {
      id: 3,
      name: 'Augustine',
      email: '15574892055@163.com',
      address: 'Wuhou District, Chengdu City, Sichuan Province, China',
      type: ''
    }
  ]);

  const handleDeleteAddress = (id:number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const addNewAddress = () => {
    const newAddress = {
      id: Math.max(...addresses.map(a => a.id)) + 1,
      name: 'Augustine',
      email: '15574892055@163.com',
      address: 'Wuhou District, Chengdu City, Sichuan Province, China',
      type: ''
    };
    setAddresses([...addresses, newAddress]);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-medium text-gray-900 mb-12">Account Details</h1>
      
      {/* About You Section */}
      <div className="mb-16">
        <div className="flex items-center mb-8">
          <div className="w-1 h-5 bg-blue-500 mr-3"></div>
          <h2 className="text-base font-medium text-gray-900">About you</h2>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-8">
            <div>
              <div className="text-sm text-gray-500 mb-2">First Name</div>
              <div className="text-gray-900">{user?.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Last Name</div>
              <div className="text-gray-900"></div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500 mb-2">Email Address</div>
              <div className="text-gray-900">{user?.email}</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Information Section */}
      <div>
        <div className="flex items-center mb-8">
          <div className="w-1 h-5 bg-blue-500 mr-3"></div>
          <h2 className="text-base font-medium text-gray-900">Receipt information</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {addresses.map((address) => (
            <div key={address.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-gray-900 font-medium">{address.name}</span>
                    <span className="text-gray-900">{address.email}</span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700">{address.address}</span>
                    {address.type && (
                      <span className="text-gray-500 text-sm">{address.type}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="p-6 text-center">
            <button
              onClick={addNewAddress}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Add New Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}