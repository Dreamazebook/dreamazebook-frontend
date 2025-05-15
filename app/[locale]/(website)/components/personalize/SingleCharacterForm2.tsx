/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { FaQuestionCircle } from 'react-icons/fa';
import BasicInfoForm, { BasicInfoData } from './BasicInfoForm';
import UploadArea from './UploadArea';
import Sidebar from './Sidebar';
import useImageUpload from '../../hooks/useImageUpload';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
//import { ConfigProvider, DatePicker } from 'antd';

export interface PersonalizeFormData2 extends BasicInfoData {
  birthSeason: '' | 'spring' | 'summer' | 'autumn' | 'winter';
  dob: Date | null;
}

export interface SingleCharacterForm2Handle {
  validateForm: () => boolean;
  formData: PersonalizeFormData2;
  getFormData: () => PersonalizeFormData2;
}

interface FormErrors {
  fullName?: string;
  gender?: string;
  skinColor?: string;
  photo?: string;
  birthSeason?: string;
  dob?: string;
}

const SingleCharacterForm2 = forwardRef<SingleCharacterForm2Handle>((props, ref) => {
  const [formData, setFormData] = useState<PersonalizeFormData2>({
    fullName: '',
    gender: '',
    skinColor: '',
    photo: null,
    birthSeason: '',
    dob: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [touched, setTouched] = useState<Partial<Record<keyof PersonalizeFormData2, boolean>>>({});

  // Define season options (each with a label and image source)
  const seasons: { label: string; value: "" | "spring" | "summer" | "autumn" | "winter"; src: string }[] = [
    { label: 'Spring', value: 'spring', src: '/season-spring.png' },
    { label: 'Summer', value: 'summer', src: '/season-spring.png' },
    { label: 'Autumn', value: 'autumn', src: '/season-spring.png' },
    { label: 'Winter', value: 'winter', src: '/season-spring.png' },
  ];

  const {
    imageUrl,
    isUploading,
    uploadProgress,
    error: uploadError,
    isDragging,
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDeleteImage,
    handleUpload,
  } = useImageUpload();

  useEffect(() => {
    if (imageUrl) {
      const img: HTMLImageElement = document.createElement('img');
      img.src = imageUrl;
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    }
  }, [imageUrl]);

  // Update basic info fields and mark as touched
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Update error for a given field
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // Handle photo upload
  const handleUploadPhoto = async (file: File) => {
    const uploadResult = await handleUpload(file);
    if (uploadResult) {
      handleBasicInfoChange('photo', {
        file: uploadResult.file,
        path: uploadResult.uploadedFilePath
      });
      handleErrorChange('photo', '');
    }
  };

  // Handle season selection
  const handleSeasonClick = (value: "" | "spring" | "summer" | "autumn" | "winter") => {
    setFormData(prev => ({ ...prev, birthSeason: value }));
    setTouched(prev => ({ ...prev, birthSeason: true }));
    setErrors(prev => ({ ...prev, birthSeason: '' }));
  };

  useImperativeHandle(ref, () => ({
    validateForm() {
      // Mark all fields as touched to trigger validations
      setTouched({
        fullName: true,
        gender: true,
        skinColor: true,
        photo: true,
        birthSeason: true,
        dob: true,
      });

      const newErrors: FormErrors = {};
      if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the full name';
      if (!formData.gender) newErrors.gender = 'Please select gender';
      if (!formData.skinColor) newErrors.skinColor = 'Please select skin color';
      if (!formData.photo) newErrors.photo = 'Please upload a photo';
      if (!formData.birthSeason) newErrors.birthSeason = 'Please select a birth season';
      if (!formData.dob) newErrors.dob = 'Please select a date of birth';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    formData,
    getFormData() {
      return formData;
    }
  }));

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[120px] bg-[#F8F8F8] relative pb-8">
      {/* 表单区域 */}
      <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto">
        <div className="bg-white rounded p-6 shadow-sm">
          <form className="space-y-6">
            {/* 表单内容 */}
            <BasicInfoForm
              data={{
                fullName: formData.fullName,
                gender: formData.gender,
                skinColor: formData.skinColor,
                photo: formData.photo,
              }}
              errors={{
                fullName: errors.fullName,
                gender: errors.gender,
                skinColor: errors.skinColor,
                photo: errors.photo,
              }}
              touched={{
                fullName: touched.fullName,
                gender: touched.gender,
                skinColor: touched.skinColor,
                photo: touched.photo,
              }}
              onChange={handleBasicInfoChange}
              onErrorChange={handleErrorChange}
            />
  
            {/* Date of Birth Section */}
            <div>
              <label className="block mb-2 font-medium">Date of Birth</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={formData.dob}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, dob: newValue }));
                  setTouched(prev => ({ ...prev, dob: true }));
                  setErrors(prev => ({ ...prev, dob: '' }));
                }}
                slots={{ textField: TextField }}
                slotProps={{
                  day: {
                    sx: {
                      borderRadius: 0,
                        
                      '&.Mui-selected': {
                        backgroundColor: '#FCF2F2!important', 
                        border: '1px solid #222222',
                        color: '#222222',
                        //borderRadius: 0,
                      },
                      '&:hover': {
                        //borderRadius: 0,
                        backgroundColor: '#F8F8F8'
                      },
                      // 今天的日期
                      '&.MuiPickersDay-today': {
                        //borderRadius: 0
                      },
                    },
                  },
                }}
              />

                {touched.dob && errors.dob && (
                  <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                )}
              </LocalizationProvider>
            </div>
  
            {/* Birth Season Selection */}
            <div>
              <label className="block mb-2 font-medium">Birth Season</label>
              <div
                className="flex flex-wrap gap-2 sm:gap-3"
                tabIndex={0}
                onBlur={() => {
                  if (!formData.birthSeason) {
                    setErrors(prev => ({ ...prev, birthSeason: 'Please select a birth season' }));
                  } else {
                    setErrors(prev => ({ ...prev, birthSeason: '' }));
                  }
                }}
              >
                {seasons.map(season => (
                  <button
                    key={season.value}
                    type="button"
                    onClick={() => handleSeasonClick(season.value)}
                    className={`relative border p-2 rounded flex flex-col items-center gap-[10px] 
                      w-[80px] bg-[#F8F8F8] sm:w-[126px] sm:bg-transparent ${
                        formData.birthSeason === season.value
                          ? 'border-[#012CCE]'
                          : 'border-transparent'
                      }`}
                  >
                    <Image
                      src={season.src}
                      alt={season.label}
                      width={122}
                      height={110}
                      className="rounded"
                    />
                    <span>{season.label}</span>
                  </button>
                ))}
              </div>
              {touched.birthSeason && errors.birthSeason && (
                <p className="text-red-500 text-sm mt-1">{errors.birthSeason}</p>
              )}
            </div>
  
            {/* Photo Upload Section */}
            <div>
              <label className="block mb-2 flex items-center">
                <span className="font-medium">Photo</span>
                <span className="text-gray-400 inline-flex items-center group relative font-normal">
                  <FaQuestionCircle className="w-4 h-4 ml-1" />
                  <div className="hidden group-hover:block absolute left-0 top-6 w-64 p-2 bg-white/80 text-gray-800 text-sm rounded shadow-lg z-10 backdrop-blur">
                    <p className="mb-2">
                      Upload a photo so we can create a unique image of you. Your privacy is ensured.
                    </p>
                  </div>
                </span>
              </label>
              <p className="text-sm mb-2 text-gray-800">Please upload a photo of your character!</p>
              <ul className="text-sm text-gray-500 mb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300"></div>
                  <li>Make sure the subject is facing the camera.</li>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300"></div>
                  <li>Use a close-up photo.</li>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300"></div>
                  <li>The higher the quality, the better the result!</li>
                </div>
              </ul>
              <div>
                <UploadArea
                  imageUrl={imageUrl}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  error={uploadError}
                  isDragging={isDragging}
                  imageSize={imageSize}
                  handleDragEnter={handleDragEnter}
                  handleDragLeave={handleDragLeave}
                  handleDragOver={handleDragOver}
                  handleDrop={(e) => handleDrop(e, (file) => handleUploadPhoto(file))}
                  handleFileUpload={(e) => handleFileUpload(e, (file) => handleUploadPhoto(file))}
                  handleDeleteImage={() => {
                    handleDeleteImage();
                    handleBasicInfoChange('photo', null);
                    handleErrorChange('photo', 'Please upload a photo');
                  }}
                />
                {touched.photo && errors.photo && (
                  <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 侧边栏 */}
      <div className="hidden md:block absolute top-0 right-0 mr-14">
        <Sidebar currentStep={0} />
      </div>
    </div>
  );  
  
  
});

export default SingleCharacterForm2;
