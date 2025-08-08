"use client";
import { API_ADDRESS_LIST, API_USER_PROFILE } from '@/constants/api';
import useUserStore from '@/stores/userStore';
import { ApiResponse } from '@/types/api';
import api from '@/utils/api';
import React, { useEffect, useState } from 'react';
export default function AccountDetails() {
  const {user, fetchAddresses, addresses} = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name || '',
    lastName: '',
    email: user?.email || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success, message } = await api.put<ApiResponse>(API_USER_PROFILE, formData);
      if (success) {
        setIsEditing(false);
      } else {
        alert(message);
      }
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  useEffect(()=> {
    fetchAddresses();
  },[])

  const handleDeleteAddress = async (id:string) => {
    const {success,message} = await api.delete<ApiResponse>(`${API_ADDRESS_LIST}/${id}`);
    if (success) {
      fetchAddresses({refresh:true});
    } else {
      alert(message);
    }
  };

  const addNewAddress = () => {
    
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
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          {isEditing && (
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-8">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
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
                    <span className="text-gray-900 font-medium">{address.first_name}</span>
                    <span className="text-gray-900">{address.email}</span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                      {/* <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                        Edit
                      </button> */}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700">{address.street}</span>
                    {/* {address?.type && (
                      <span className="text-gray-500 text-sm">{address?.type}</span>
                    )} */}
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