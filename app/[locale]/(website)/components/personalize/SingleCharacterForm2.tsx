/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { FaQuestionCircle } from 'react-icons/fa';
import BasicInfoForm, { BasicInfoData } from './BasicInfoForm';
import MultiImageUpload from './MultiImageUpload';
import Sidebar from './Sidebar';
import useMultiImageUpload from '../../hooks/useMultiImageUpload';
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
  hairstyle?: string;
  hairColor?: string;
  photo?: string;
  birthSeason?: string;
  dob?: string;
}

interface SingleCharacterForm2Props {
  initialData?: {
    fullName?: string;
    gender?: '' | 'boy' | 'girl';
    skinColor?: string;
    hairstyle?: string;
    hairColor?: string;
    photo?: { path: string } | null;
  };
  bookId?: string;
}

const SingleCharacterForm2 = forwardRef<SingleCharacterForm2Handle, SingleCharacterForm2Props>(({ initialData, bookId = '1' }, ref) => {
  const [formData, setFormData] = useState<PersonalizeFormData2>({
    fullName: initialData?.fullName ?? '',
    gender: initialData?.gender ?? '',
    skinColor: initialData?.skinColor ?? '#FFE2CF',
    hairstyle: initialData?.hairstyle ?? 'hair_1', // 默认选择头发样式1
    hairColor: initialData?.hairColor ?? 'light', // 默认选择浅色头发
    photo: initialData?.photo ? { path: initialData.photo.path } as any : null,
    birthSeason: '',
    dob: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PersonalizeFormData2, boolean>>>({});

  // Define season options (each with a label and image source)
  const seasons: { label: string; value: "" | "spring" | "summer" | "autumn" | "winter"; src: string }[] = [
    { label: 'Spring', value: 'spring', src: '/season-spring.png' },
    { label: 'Summer', value: 'summer', src: '/season-spring.png' },
    { label: 'Autumn', value: 'autumn', src: '/season-spring.png' },
    { label: 'Winter', value: 'winter', src: '/season-spring.png' },
  ];

  const {
    images,
    isUploading,
    uploadProgress,
    error: uploadError,
    isDragging,
    handleImageUpload,
    handleImageDelete,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    getUploadedPaths,
    initializeWithUrls,
  } = useMultiImageUpload(3);

  // 书籍2的品质选择移至 select-book-content 页面

  // 当某张图片上传成功后，自动把第一张已上传图片设置为主图，确保可提交
  useEffect(() => {
    if (!formData.photo) {
      const firstUploaded = images.find(img => !!img.uploadedFilePath);
      if (firstUploaded && firstUploaded.uploadedFilePath) {
        handleBasicInfoChange('photo', { path: firstUploaded.uploadedFilePath });
        handleErrorChange('photo', '');
      }
    }
  }, [images, formData.photo]);

  // 初始化：如果传入了 initialData.photo.path，则作为已有图片显示
  useEffect(() => {
    const url = initialData?.photo?.path;
    if (url) {
      initializeWithUrls([url]);
      handleBasicInfoChange('photo', { path: url });
      handleErrorChange('photo', '');
    }
  // 仅在初次挂载或 initialData 变化时运行
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.photo?.path]);

  // Update basic info fields and mark as touched
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: string | { file?: File; path: string } | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Update error for a given field
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // Handle multiple photos upload（与书籍1一致）
  const handlePhotosUpload = async (files: File[]) => {
    const newlyUploadedPaths = await handleImageUpload(files);
    if (newlyUploadedPaths.length > 0 && !formData.photo) {
      handleBasicInfoChange('photo', { path: newlyUploadedPaths[0] });
      handleErrorChange('photo', '');
    }
  };

  // 处理删除
  const handlePhotoDelete = (id: string) => {
    handleImageDelete(id);
    const remainingPaths = getUploadedPaths();
    if (remainingPaths.length > 0) {
      handleBasicInfoChange('photo', { path: remainingPaths[0] });
    } else {
      handleBasicInfoChange('photo', null);
      handleErrorChange('photo', 'Please upload a photo');
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
        hairstyle: true,
        hairColor: true,
        photo: true,
        birthSeason: true,
        dob: true,
      });

      const newErrors: FormErrors = {};
      if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the full name';
      if (!formData.gender) newErrors.gender = 'Please select gender';
      if (!formData.skinColor) newErrors.skinColor = 'Please select skin color';
      if (!formData.hairstyle) newErrors.hairstyle = 'Please select hairstyle';
      if (!formData.hairColor) newErrors.hairColor = 'Please select hair color';
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
                hairstyle: formData.hairstyle,
                hairColor: formData.hairColor,
                photo: formData.photo,
              }}
              errors={{
                fullName: errors.fullName,
                gender: errors.gender,
                skinColor: errors.skinColor,
                hairstyle: errors.hairstyle,
                hairColor: errors.hairColor,
                photo: errors.photo,
              }}
              touched={{
                fullName: touched.fullName,
                gender: touched.gender,
                skinColor: touched.skinColor,
                hairstyle: touched.hairstyle,
                hairColor: touched.hairColor,
                photo: touched.photo,
              }}
              onChange={handleBasicInfoChange}
              onErrorChange={handleErrorChange}
              bookId={bookId}
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

            {/* 品质选择已迁移至 select-book-content 页面 */}
  
            {/* Photo Upload Section - 与书籍1一致，使用多图片上传组件 */}
            <div>
              <MultiImageUpload
                images={images as any}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={uploadError}
                isDragging={isDragging}
                maxImages={3}
                onImageUpload={handlePhotosUpload}
                onImageDelete={handlePhotoDelete}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
              {touched.photo && errors.photo && (
                <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
              )}
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

SingleCharacterForm2.displayName = 'SingleCharacterForm2';

export default SingleCharacterForm2;
