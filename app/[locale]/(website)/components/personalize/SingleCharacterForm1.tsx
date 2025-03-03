/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { BsCheck } from 'react-icons/bs';
import BasicInfoForm, { BasicInfoData } from './BasicInfoForm';
import UploadArea from './UploadArea';
import useImageUpload from '../../hooks/useImageUpload';

export interface PersonalizeFormData extends BasicInfoData {
  singleChoice: string; // Single choice feature
  multipleChoice: string[]; // Multiple choice features
}

export interface SingleCharacterForm1Handle {
  validateForm: () => boolean; // Method to validate form data
  formData: PersonalizeFormData;
}

interface FormErrors {
  fullName?: string;
  gender?: string;
  skinColor?: string;
  photo?: string;
  singleChoice?: string;
  multipleChoice?: string;
}

const SingleCharacterForm1 = forwardRef<SingleCharacterForm1Handle>((props, ref) => {
  const [formData, setFormData] = useState<PersonalizeFormData>({
    fullName: '',
    gender: '',
    skinColor: '',
    photo: null,
    singleChoice: '',
    multipleChoice: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [touched, setTouched] = useState<{ [K in keyof PersonalizeFormData]?: boolean }>({});

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
  } = useImageUpload();

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    }
  }, [imageUrl]);

  // Update basic info fields
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Update errors for specific fields
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // Handle photo upload and clear related errors
  const handleUploadPhoto = (file: File) => {
    handleBasicInfoChange('photo', file);
    handleErrorChange('photo', '');
  };

  useImperativeHandle(ref, () => ({
    validateForm() {
      // Mark all fields as touched for validation feedback
      setTouched({
        fullName: true,
        gender: true,
        skinColor: true,
        photo: true,
        singleChoice: true,
        multipleChoice: true,
      });

      const newErrors: FormErrors = {};
      if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the full name';
      if (!formData.gender) newErrors.gender = 'Please select gender';
      if (!formData.skinColor) newErrors.skinColor = 'Please select skin color';
      if (!formData.photo) newErrors.photo = 'Please upload a photo';
      if (!formData.singleChoice) newErrors.singleChoice = 'Please select one feature';
      if (formData.multipleChoice.length === 0) newErrors.multipleChoice = 'Please select at least one feature';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    formData,
  }));

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[120px] bg-[#F8F8F8] relative pb-8">
      {/* 表单区域 */}
      <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto">
        <div className="bg-white rounded p-6 shadow-sm">
          <form className="space-y-6">
            {/* Basic information part */}
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

            {/* Single Choice Section */}
            <div>
              <label className="block mb-2 font-medium">
                Features <span className="ml-2 text-gray-500">(Single choice)</span>
              </label>
              <div
                className="flex flex-wrap gap-2"
                tabIndex={0}
                onBlur={() => {
                  if (!formData.singleChoice) {
                    setErrors(prev => ({ ...prev, singleChoice: 'Please select one feature' }));
                  } else {
                    setErrors(prev => ({ ...prev, singleChoice: '' }));
                  }
                }}
              >
                {['lively', 'Quiet', 'kind hearted', 'cute', 'humor'].map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    className={`px-4 py-2 rounded border ${
                      formData.singleChoice === feature
                        ? 'bg-red-50 border-black text-black'
                        : 'bg-gray-100 border-transparent text-gray-800'
                    }`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, singleChoice: feature }));
                      setTouched(prev => ({ ...prev, singleChoice: true }));
                      setErrors(prev => ({ ...prev, singleChoice: '' }));
                    }}
                  >
                    {feature}
                  </button>
                ))}
              </div>
              {touched.singleChoice && errors.singleChoice && (
                <p className="text-red-500 text-sm">{errors.singleChoice}</p>
              )}
            </div>

            {/* Multiple Choice Section */}
            <div>
              <label className="block mb-2 font-medium">
                Features <span className="ml-2 text-gray-500">(Multiple choice)</span>
              </label>
              <div
                className="flex flex-wrap gap-2"
                tabIndex={0}
                onBlur={() => {
                  if (formData.multipleChoice.length === 0) {
                    setErrors(prev => ({ ...prev, multipleChoice: 'Please select at least one feature' }));
                  } else {
                    setErrors(prev => ({ ...prev, multipleChoice: '' }));
                  }
                }}
              >
                {['lively', 'Quiet', 'kind hearted', 'cute', 'humor'].map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    className={`relative px-4 py-2 rounded border ${
                      formData.multipleChoice.includes(feature)
                        ? 'border-black bg-[#FCF2F2] text-black'
                        : 'bg-gray-100 border-transparent text-gray-800'
                    }`}
                    onClick={() => {
                      setFormData(prev => {
                        const newArray = prev.multipleChoice.includes(feature)
                          ? prev.multipleChoice.filter(item => item !== feature)
                          : [...prev.multipleChoice, feature];
                        return { ...prev, multipleChoice: newArray };
                      });
                      setTouched(prev => ({ ...prev, multipleChoice: true }));
                      setErrors(prev => ({ ...prev, multipleChoice: '' }));
                    }}
                  >
                    {feature}
                    {formData.multipleChoice.includes(feature) && (
                      <span
                        className="absolute bottom-0 right-0 bg-black text-white flex items-center justify-center text-xs"
                        style={{ width: '18px', height: '12px', borderRadius: '4px 0 0 0' }}
                      >
                        <BsCheck className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {touched.multipleChoice && errors.multipleChoice && (
                <p className="text-red-500 text-sm">{errors.multipleChoice}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default SingleCharacterForm1;
