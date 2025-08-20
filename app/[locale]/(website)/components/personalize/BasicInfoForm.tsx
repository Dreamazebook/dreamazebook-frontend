/** @jsxImportSource react */
'use client';

import React from 'react';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';
import HairstyleSelector from './HairstyleSelector';
import HairColorSelector from './HairColorSelector';
import AvatarCanvas from './AvatarCanvas';
//import UploadArea from './UploadArea';
//import useImageUpload from '../../hooks/useImageUpload';

export interface BasicInfoData {
  fullName: string;
  gender: '' | 'boy' | 'girl';
  skinColor: string;
  hairstyle: string;
  hairColor: string;
  photo: { file?: File; path: string } | null;
}

interface BasicInfoFormProps {
  data: BasicInfoData;
  errors: Partial<Record<keyof BasicInfoData, string>>;
  touched: Partial<Record<keyof BasicInfoData, boolean>>;
  onChange: (field: keyof BasicInfoData, value: string | { file?: File; path: string } | null) => void;
  // 用于更新指定字段的错误状态
  onErrorChange?: (field: keyof BasicInfoData, error: string) => void;
  // 书籍ID，用于获取发型图片
  bookId?: string;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  errors,
  touched,
  onChange,
  onErrorChange,
  bookId = '1', // 默认使用书籍ID 1
}) => {
  // 图片上传相关的变量和函数已移至父组件 SingleCharacterForm1 和 SingleCharacterForm2
  /* 
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

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageUrl) {
      const img: HTMLImageElement = document.createElement('img');
      img.src = imageUrl;
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    }
  }, [imageUrl]);
  */

  const skinColors = [
    { value: '#FFE2CF', label: 'Fair' },
    { value: '#DCB593', label: 'Medium' },
    { value: '#665444', label: 'Dark' },
  ];

  // fullName 的 onChange 与 onBlur 处理
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 13) {
      if (onErrorChange) onErrorChange('fullName', 'Full name cannot exceed 13 characters.');
      return;
    } else {
      if (onErrorChange && errors.fullName) onErrorChange('fullName', '');
    }
    onChange('fullName', value);
  };

  const handleFullNameBlur = () => {
    if (!data.fullName.trim()) {
      if (onErrorChange) onErrorChange('fullName', 'Please enter the full name');
    }
  };

  // gender 的 onChange 与 onBlur 处理
  const handleGenderChange = (value: 'boy' | 'girl') => {
    onChange('gender', value);
    if (onErrorChange) onErrorChange('gender', '');
  };

  const handleGenderBlur = () => {
    if (!data.gender) {
      if (onErrorChange) onErrorChange('gender', 'Please select gender');
    }
  };

  // skinColor 的 onChange 与 onBlur 处理
  const handleSkinColorSelect = (colorValue: string) => {
    onChange('skinColor', colorValue);
    if (onErrorChange) onErrorChange('skinColor', '');
  };

  const handleSkinColorBlur = () => {
    if (!data.skinColor) {
      if (onErrorChange) onErrorChange('skinColor', 'Please select skin color');
    }
  };

  // hairstyle 的 onChange 与 onBlur 处理
  const handleHairstyleSelect = (hairstyleValue: string) => {
    onChange('hairstyle', hairstyleValue);
    if (onErrorChange) onErrorChange('hairstyle', '');
  };

  const handleHairstyleBlur = () => {
    if (!data.hairstyle) {
      if (onErrorChange) onErrorChange('hairstyle', 'Please select hairstyle');
    }
  };

  // hairColor 的 onChange 与 onBlur 处理
  const handleHairColorSelect = (hairColorValue: string) => {
    onChange('hairColor', hairColorValue);
    if (onErrorChange) onErrorChange('hairColor', '');
  };

  const handleHairColorBlur = () => {
    if (!data.hairColor) {
      if (onErrorChange) onErrorChange('hairColor', 'Please select hair color');
    }
  };

  // photo 的 onChange（文件上传通常不使用 onBlur，此处仅在 onChange 后清除错误）
  // const handleUploadPhoto = (file: File) => {
  //   onChange('photo', { file, path: '' });
  //   if (onErrorChange) onErrorChange('photo', '');
  // };

  return (
    <div className="space-y-6">
      {/* 预览图 */}
                   <div className="flex justify-center mb-6">
               <AvatarCanvas
                 bookId={bookId}
                 skinColor={data.skinColor || '#FFE2CF'}
                 hairstyle={data.hairstyle || 'hair_1'}
                 hairColor={data.hairColor || 'light'}
                 width={300}
                 height={300}
               />
             </div>
      <p className="text-center text-gray-500 mb-8">
        We will redesign the character in your image
      </p>

      {/* Full name */}
      <div>
        <label className="block mb-2 font-medium">Full name</label>
        <input
          type="text"
          placeholder="please enter..."
          className="w-full p-2 border border-[#E5E5E5] rounded"
          value={data.fullName}
          onChange={handleFullNameChange}
          onBlur={handleFullNameBlur}
        />
        {touched.fullName && errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <div className="flex items-center justify-between">
          <label className="font-medium">Gender</label>
          <div className="flex gap-4" onBlur={handleGenderBlur} tabIndex={0}>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="boy"
                checked={data.gender === 'boy'}
                onChange={() => handleGenderChange('boy')}
                className="hidden"
              />
              <div
                className={`w-6 h-6 rounded-full border-2 mr-2 flex items-center justify-center ${
                  data.gender === 'boy' ? 'border-[#012CCE] bg-[#012CCE]' : 'border-gray-300'
                }`}
              >
                {data.gender === 'boy' && <FaCheck className="w-3 h-3 text-white" />}
              </div>
              Boy
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={data.gender === 'girl'}
                onChange={() => handleGenderChange('girl')}
                className="hidden"
              />
              <div
                className={`w-6 h-6 rounded-full border-2 mr-2 flex items-center justify-center ${
                  data.gender === 'girl' ? 'border-[#012CCE] bg-[#012CCE]' : 'border-gray-300'
                }`}
              >
                {data.gender === 'girl' && <FaCheck className="w-3 h-3 text-white" />}
              </div>
              Girl
            </label>
          </div>
        </div>
        {touched.gender && errors.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
        )}
      </div>

      {/* Skin color */}
      <div>
        <div className="flex items-center justify-between" tabIndex={0} onBlur={handleSkinColorBlur}>
          <label className="font-medium">Skin color</label>
          <div className="flex gap-2">
            {skinColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-8 h-8 rounded-full ${data.skinColor === color.value ? 'ring-4' : ''}`}
                style={{
                  backgroundColor: color.value,
                  ...(data.skinColor === color.value
                    ? { boxShadow: `0 0 0 4px ${color.label === 'Fair' ? '#FFCDAC' : color.value + '80'}` }
                    : {}),
                }}
                onClick={() => handleSkinColorSelect(color.value)}
              />
            ))}
          </div>
        </div>
        {touched.skinColor && errors.skinColor && (
          <p className="text-red-500 text-sm mt-1">{errors.skinColor}</p>
        )}
      </div>

      {/* Hairstyle */}
      <div>
        <HairstyleSelector
          bookId={bookId}
          selectedHairstyle={data.hairstyle}
          onChange={handleHairstyleSelect}
          onBlur={handleHairstyleBlur}
          error={errors.hairstyle}
          touched={touched.hairstyle}
        />
      </div>

      {/* Hair Color */}
      <div>
        <HairColorSelector
          selectedHairColor={data.hairColor}
          onChange={handleHairColorSelect}
          onBlur={handleHairColorBlur}
          error={errors.hairColor}
          touched={touched.hairColor}
        />
      </div>

      {/* Photo Upload
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
              onChange('photo', null);
              if (onErrorChange) onErrorChange('photo', 'Please upload a photo');
            }}
          />
          {touched.photo && errors.photo && (
            <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default BasicInfoForm;
