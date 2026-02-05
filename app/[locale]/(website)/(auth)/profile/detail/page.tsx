"use client";
import { API_ADDRESS_LIST, API_USER_PROFILE, API_USER_RESET_PASSWORD } from '@/constants/api';
import useUserStore from '@/stores/userStore';
import { ApiResponse } from '@/types/api';
import api from '@/utils/api';
import React, { useEffect, useState } from 'react';
import AddressCard from '../../../components/address/AddressCard';
import AddressCardList from '../../../components/address/AddressCardList';
import PasswordField from '@/app/components/common/PasswordField';
import { useTranslations } from 'next-intl';

export default function AccountDetails() {
  const {user, fetchAddresses, addresses} = useUserStore();
  const t = useTranslations('accountDetails');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert(t('passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }

    try {
      const payload: any = { new_password: formData.newPassword, new_password_confirmed: formData.confirmPassword };
      if (user?.has_set_password) {
        payload.current_password = formData.currentPassword;
      }
      const { success, message } = await api.put<ApiResponse>(API_USER_RESET_PASSWORD, payload);
      if (success) {
        setIsEditing(false);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert(t('passwordUpdated') || 'Password updated');
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
              <div className="grid grid-cols-1 gap-y-6 mb-8">
                {user?.has_set_password && (
                  <PasswordField
                    id="currentPassword"
                    label={t('currentPassword') || 'Current password'}
                    value={formData.currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, currentPassword: e.target.value})}
                    placeholder=""
                    required
                  />
                )}
                <PasswordField
                  id="newPassword"
                  label={t('newPassword') || 'New password'}
                  value={formData.newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder=""
                  required
                />
                <PasswordField
                  id="confirmPassword"
                  label={t('confirmPassword') || 'Confirm password'}
                  value={formData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder=""
                  required
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary cursor-pointer text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {t('updatePassword') || 'Update password'}
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