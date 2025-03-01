/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { BaseBook } from '@/types/book';
import { IoIosArrowBack } from "react-icons/io";
import { BsCheck } from "react-icons/bs";
import { FaQuestionCircle } from 'react-icons/fa';
import BasicInfoForm, { BasicInfoData } from '../components/BasicInfoForm';
import springImage from '@/public/spring.jpeg';
import UploadArea from '../components/UploadArea';
import useImageUpload from '../hooks/useImageUpload';


// 扩展 BasicInfoData，增加额外字段
export interface PersonalizeFormData extends BasicInfoData {
  singleChoice: string; // 单选功能
  multipleChoice: string[]; // 多选功能
}

export interface SingleCharacterForm1Handle {
  validateForm: () => boolean; // 点击 Continue 时触发校验
  formData: PersonalizeFormData;
}

interface FormErrors {
  fullName?: string;
  gender?: string;
  skinColor?: string;
  photo?: string;
  singleChoice?: string;
  multipleChoice?: string;
  birthSeason?: string;
}

export interface PersonalizeFormData2 extends BasicInfoData {
  birthSeason: '' | 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface SingleCharacterForm2Handle {
  validateForm: () => boolean;
  formData: PersonalizeFormData2;
}

export default function PersonalizePage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookid');
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [book, setBook] = useState<BaseBook | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<'SINGLE' | 'DOUBLE' | null>(null);
  const [loading, setLoading] = useState(true);

  const singleFormRef = useRef<SingleCharacterForm2Handle>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (bookId) {
        try {
          const response = await api.get<{ book: BaseBook }>(`/books/${bookId}`);
          setBook(response.book);
          switch (response.book.formid) {
            case 1:
              setSelectedFormType('SINGLE');
              break;
            case 2:
              setSelectedFormType('DOUBLE');
              break;
            case 3:
              setShowModal(true);
              break;
            default:
              console.error('Invalid form type');
              break;
          }
        } catch (error) {
          console.error('Failed to fetch book:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBook();
  }, [bookId]);

  const renderForm = () => {
    if (!selectedFormType) return null;
    switch (selectedFormType) {
      case 'SINGLE':
        return <SingleCharacterForm2 ref={singleFormRef} />;
      case 'DOUBLE':
        return <DoubleCharacterForm />;
      default:
        return null;
    }
  };

  const handleContinue = () => {
    if (selectedFormType === 'SINGLE' && singleFormRef.current) {
      const isValid = singleFormRef.current.validateForm();
      if (!isValid) return;
    }
    // 双人表单校验逻辑（如有）...
    router.push(`/preview?bookId=${bookId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <div className="flex items-center justify-between w-full sm:hidden">
          <Link href={`/books/${bookId}`} className="flex items-center text-gray-700 hover:text-blue-500">
            <IoIosArrowBack size={24} />
          </Link>
          <Link href="/" className="flex items-center justify-center flex-grow p-2">
            <img src="/logo.png" alt="Home" className="w-[114.29px] h-[40px]" />
          </Link>
        </div>
        <Link href={`/books/${bookId}`} className="hidden sm:flex items-center text-sm">
          <span className="mr-2">←</span> Back to the product page
        </Link>
      </div>

      {/* 主要内容区域 */}
      <div className="pt-0 px-4">
        {showModal && book?.formid === 3 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl text-center mb-6">选择角色数量</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSelectedFormType('SINGLE');
                    setShowModal(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  单人故事
                </button>
                <button
                  onClick={() => {
                    setSelectedFormType('DOUBLE');
                    setShowModal(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  双人故事
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-[95vw] sm:w-[60vw] md:w-[40%] mx-auto">
          <h1 className="text-2xl text-center my-6">Please fill in the basic information</h1>
          <div className="bg-white rounded p-6 shadow-sm mb-8">
            {renderForm()}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleContinue}
              className="w-1/3 bg-black text-white py-3 rounded hover:bg-gray-800 mb-16"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 单人表单组件，引用 BasicInfoForm 处理公共部分
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
      const img: HTMLImageElement = document.createElement('img');
      img.src = imageUrl;
      
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    }
  }, [imageUrl]);


  // 更新公共部分数据
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // 定义 onErrorChange 回调，用于更新指定字段的错误状态
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // 图片上传处理：清除 photo 错误并更新 photo 字段
  const handleUploadPhoto = (file: File) => {
    handleBasicInfoChange('photo', file);
    handleErrorChange('photo', '');
  };

  useImperativeHandle(ref, () => ({
    validateForm() {
      // 标记所有字段为 touched
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
    <form className="space-y-6">
      {/* 公共基本信息部分，传入 onErrorChange 回调 */}
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

      {/* 额外的单人表单内容 */}
      <div className="space-y-6">
        {/* Photo Upload */}
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
        {/* 单选题 */}
        <div>
          <label className="block mb-2 font-medium">
            Features <span className="ml-2 text-gray-500">(Single choice)</span>
          </label>
          {/* 使用外层 div 添加 tabIndex 和 onBlur，实现失焦校验 */}
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
                  // 点击后清除错误提示
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

        {/* 多选题 */}
        <div>
          <label className="block mb-2 font-medium">
            Features <span className="ml-2 text-gray-500">(Multiple choice)</span>
          </label>
          {/* 同样使用外层 div 添加 tabIndex 和 onBlur */}
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
                  // 点击时清除错误提示
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
      </div>
    </form>
  );
});

// 单人表单组件，引用 BasicInfoForm 处理公共部分
const SingleCharacterForm2 = forwardRef<SingleCharacterForm2Handle>((props, ref) => {
  const [formData, setFormData] = useState<PersonalizeFormData2>({
    fullName: '',
    gender: '',
    skinColor: '',
    photo: null,
    birthSeason: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [touched, setTouched] = useState<Partial<Record<keyof PersonalizeFormData2, boolean>>>({});

  // 定义季节选项
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

  // 更新公共部分数据
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // 定义 onErrorChange 回调，用于更新指定字段的错误状态
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // 图片上传处理：清除 photo 错误并更新 photo 字段
  const handleUploadPhoto = (file: File) => {
    handleBasicInfoChange('photo', file);
    handleErrorChange('photo', '');
  };

  useImperativeHandle(ref, () => ({
    validateForm() {
      // 标记所有字段为 touched
      setTouched({
        fullName: true,
        gender: true,
        skinColor: true,
        photo: true,
        birthSeason: true,
      });

      const newErrors: FormErrors = {};
      if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the full name';
      if (!formData.gender) newErrors.gender = 'Please select gender';
      if (!formData.skinColor) newErrors.skinColor = 'Please select skin color';
      if (!formData.photo) newErrors.photo = 'Please upload a photo';
      if (!formData.birthSeason) newErrors.birthSeason = 'Please select a birth season';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    formData,
  }));

  // 处理季节点击
  const handleSeasonClick = (value: "" | "spring" | "summer" | "autumn" | "winter") => {
    setFormData(prev => ({ ...prev, birthSeason: value }));
    setTouched(prev => ({ ...prev, birthSeason: true }));
    setErrors(prev => ({ ...prev, birthSeason: '' }));
  };  

  return (
    <form className="space-y-6">
      {/* 公共基本信息部分，传入 onErrorChange 回调 */}
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

      {/* 季节选择（放在图片上传上方的概念区） */}
      <div>
        <label className="block mb-2 font-medium">Birth season</label>
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
              layout="fixed"
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

      {/* Photo Upload */}
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
  );
});


const DoubleCharacterForm = () => {
  return (
    <div>
      <h1>Double Character Form</h1>
      {/* 双人表单内容 */}
    </div>
  );
};
