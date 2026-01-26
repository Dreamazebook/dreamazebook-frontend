"use client";
import { API_ADDRESS_LIST, API_USER_PROFILE } from '@/constants/api';
import useUserStore from '@/stores/userStore';
import { ApiResponse } from '@/types/api';
import api from '@/utils/api';
import React, { useEffect, useState } from 'react';
import AddressCard from '../../../components/address/AddressCard';
import AddressCardList from '../../../components/address/AddressCardList';
import { useTranslations } from 'next-intl';

export default function AccountDetails() {
  const {user, fetchAddresses, addresses} = useUserStore();
  const t = useTranslations('accountDetails');
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
      alert(t('failedToUpdateProfile'));
    }
  };

  useEffect(()=> {
    fetchAddresses();
  },[])

  const handleDeleteAddress = async (id:string|undefined) => {
    if (!id) return;
    const {success,message} = await api.delete<ApiResponse>(`${API_ADDRESS_LIST}/${id}`);
    if (success) {
      fetchAddresses({refresh:true});
    } else {
      alert(message);
    }
  };

  const addNewAddress = () => {
    
  };

  const UserDetailField = ({label, value}: {label:string, value:string|undefined}) => (
    <div className="flex gap-[12px] items-center">
      <div className="text-[16px] w-[93px] text-[#999999]">{label}</div>
      <div className="text-[#222222] text-[14px]">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen">      
      {/* About You Section */}
      <div className="mb-16">
        <div className="flex items-center mb-8">
          <div className="w-1 h-5 bg-primary mr-3"></div>
          <h2 className="text-[16px] font-medium text-[#222]">{t('aboutYou')}</h2>
        </div>
        
        <div className="bg-white p-6 rounded">

          <div className="flex flex-col gap-[4px]">
            <UserDetailField label={t('emailAddress')} value={user?.email} />
            <UserDetailField label={t('firstName')} value={user?.name} />
            <UserDetailField label={'Password'} value={'**********'} />
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {isEditing ? t('cancel') : t('edit')}
            </button>
          </div>
          
          {isEditing && (
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-8">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">{t('firstName')}</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">{t('lastName')}</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500 mb-2 block">{t('emailAddress')}</label>
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
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Receipt Information Section */}
      {/* <div>
        <div className="flex items-center mb-8">
          <div className="w-1 h-5 bg-blue-500 mr-3"></div>
          <h2 className="text-base font-medium text-gray-900">{t('receiptInformation')}</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          <AddressCardList addressList={addresses} handleDeleteAddress={handleDeleteAddress} />
          
          <div className="p-6 text-center">
            <button
              onClick={addNewAddress}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('addNewAddress')}
            </button>
          </div>
        </div>
      </div> */}

    </div>
  );
}