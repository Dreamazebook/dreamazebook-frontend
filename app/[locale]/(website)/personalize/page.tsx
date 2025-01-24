/** @jsxImportSource react */

'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { BaseBook } from '@/types/book';
import { FaQuestionCircle, FaCheck, FaRegTrashAlt } from 'react-icons/fa';
import { BsCheck } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import UploadArea from '../components/UploadArea';
import useImageUpload from '../hooks/useImageUpload';

// 定义表单数据接口
interface PersonalizeFormData {
  fullName: string;
  gender: '' | 'boy' | 'girl';
  skinColor: string;
  photo: File | null;
  singleChoice: string; // For single-choice buttons
  multipleChoice: string[]; // For multiple-choice buttons
}

export interface SingleCharacterForm1Handle {
  validateForm: () => boolean; // 点 Continue 时可以触发的校验
  formData: PersonalizeFormData;
}

// 定义 errors 对象结构：key 对应表单字段名，value 是错误提示字符串
interface FormErrors {
  fullName?: string;
  gender?: string;
  skinColor?: string;
  photo?: string;
  singleChoice?: string;
  multipleChoice?: string;
}

export default function PersonalizePage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookid');
  const router = useRouter();
  //const language = searchParams.get('language');

  const [showModal, setShowModal] = useState(false);
  const [book, setBook] = useState<BaseBook | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<'SINGLE' | 'DOUBLE' | null>(null);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState<string | null>(null);  // 添加错误状态

  const singleFormRef = useRef<SingleCharacterForm1Handle>(null);

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
    if (!selectedFormType) return null;  // 如果没有选择表单类型，不渲染任何内容
    
    switch (selectedFormType) {
      case 'SINGLE':
        return <SingleCharacterForm1 ref={singleFormRef} />;
      case 'DOUBLE':
        return <DoubleCharacterForm />;
      default:
        return null;
    }
  };

  const handleContinue = () => {
    // 校验单人表单
    if (selectedFormType === 'SINGLE' && singleFormRef.current) {
      const isValid = singleFormRef.current.validateForm();
      if (!isValid) return; // 如果校验失败，阻止后续操作
    }

    // 校验双人表单
    if (selectedFormType === 'DOUBLE') {
      // 双人表单校验逻辑...
    }

    router.push(`/preview?bookId=${bookId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        {/* 手机端导航栏 */}
        <div className="flex items-center justify-between w-full sm:hidden">
          {/* 返回按钮 */}
          <Link href={`/books/${bookId}`} className="flex items-center text-gray-700 hover:text-blue-500">
            <IoIosArrowBack size={24} />
          </Link>

          {/* Home 按钮 */}
          <Link href="/" className="flex items-center justify-center flex-grow p-2">
            <img
              src="/logo.png"
              alt="Home"
              className="w-[114.29px] h-[40px]"
            />
          </Link>
        </div>

        {/* 网页端导航栏 */}
        <Link href={`/books/${bookId}`} className="hidden sm:flex flex items-center text-sm">
          <span className="mr-2">←</span> Back to the product page
        </Link>
      </div>

      {/* 主要内容区域 */}
      <div className="pt-0 px-4">
        {/* 只在 formid 为 3 时显示选择模态窗口 */}
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
          {/* 标题 */}
          <h1 className="text-2xl text-center my-6">Please fill in the basic information</h1>
          
          {/* 白色模块 */}
          <div className="bg-white rounded p-6 shadow-sm mb-8">
            {renderForm()}
          </div>

          {/* 提交按钮 */}
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

// 不同的表单组件
const SingleCharacterForm1 = forwardRef<SingleCharacterForm1Handle>((props, ref) => {
  const [formData, setFormData] = React.useState<PersonalizeFormData>({
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
    error,
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

  const skinColors = [
    { value: '#FFE2CF', label: 'Fair' },
    { value: '#DCB593', label: 'Medium' },
    { value: '#665444', label: 'Dark' },
  ];

  useImperativeHandle(ref, () => ({
    validateForm() {
      setTouched({
        fullName: true,
        gender: true,
        skinColor: true,
        photo: true,
        singleChoice: true,
        multipleChoice: true,
      });

      const newErrors: FormErrors = {};

      // fullName 为空时
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Please enter the full name';
      }

      if (!formData.gender) {
        newErrors.gender = 'Please select gender';
      }
      if (!formData.skinColor) {
        newErrors.skinColor = 'Please select skin color';
      }
      if (!formData.photo) {
        newErrors.photo = 'Please upload a photo';
      }

      // singleChoice 未选择时
      if (!formData.singleChoice) {
        newErrors.singleChoice = 'Please select one feature';
      }

      // multipleChoice 未选择时
      if (formData.multipleChoice.length === 0) {
        newErrors.multipleChoice = 'Please select at least one feature';
      }      

      setErrors(newErrors);

      // 如果还有字段错误，则返回 false
      if (Object.keys(newErrors).length > 0) {
        return false;
      }

      // 如果校验通过
      return true;
    },
    formData,
  }));

  // 校验单个字段
  const validateField = (fieldName: keyof PersonalizeFormData, value: any) => {
    let error = '';

    if (fieldName === 'fullName') {
      if (!value.trim()) {
        error = 'Please enter the full name';
      }
    }

    if (fieldName === 'gender') {
      if (!value) {
        error = 'Please select gender';
      }
    }

    if (fieldName === 'skinColor') {
      if (!value) {
        error = 'Please select skin color';
      }
    }

    if (fieldName === 'photo') {
      if (!value) {
        error = 'Please upload a photo';
      }
    }

    if (fieldName === 'singleChoice') {
      if (!value) {
        error = 'Please select one feature';
      }
    }

    if (fieldName === 'multipleChoice') {
      if (!value || value.length === 0) {
        error = 'Please select at least one feature';
      }
    }    
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error || undefined, // 没有错误就删除该字段错误
    }));
  };

  // onChange：只有当用户已经 touched 过这个字段，才进行实时校验
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length > 13) {
      // 显示错误提示
      setErrors((prev) => ({
        ...prev,
        fullName: 'Full name cannot exceed 13 characters.',
      }));
      return;
    } else {
      // 清除错误提示
      setErrors((prev) => ({
        ...prev,
        fullName: '',
      }));
    }

    setFormData((prev) => ({ ...prev, fullName: value }));

    // 如果已经 touched，则实时校验
    if (touched.fullName) {
      validateField('fullName', value);
    }
  };

  // onBlur：标记 touched，并做一次校验
  const handleFullNameBlur = () => {
    setTouched((prev) => ({ ...prev, fullName: true }));
    validateField('fullName', formData.fullName);
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.value as 'boy' | 'girl';
    setFormData((prev) => ({ ...prev, gender: chosen }));
    setTouched((prev) => ({ ...prev, gender: true }));
    validateField('gender', chosen);
  };

  const handleSkinColorSelect = (colorValue: string) => {
    setFormData((prev) => ({ ...prev, skinColor: colorValue }));
    setTouched((prev) => ({ ...prev, skinColor: true }));
    validateField('skinColor', colorValue);
  };

  const handleUploadPhoto = (file: File) => {
    setFormData((prev) => ({ ...prev, photo: file }));
    setTouched((prev) => ({ ...prev, photo: true }));
    validateField('photo', file);
  };

  const handleSingleChoiceClick = (feature: string) => {
    setFormData((prev) => ({ ...prev, singleChoice: feature }));
    setTouched((prev) => ({ ...prev, singleChoice: true }));
    validateField('singleChoice', feature);
  };

  const handleMultipleChoiceClick = (feature: string) => {
    setFormData((prev) => {
      const newArray = prev.multipleChoice.includes(feature)
        ? prev.multipleChoice.filter((item) => item !== feature)
        : [...prev.multipleChoice, feature];
  
      setTouched((prevTouched) => ({ ...prevTouched, multipleChoice: true }));
      validateField('multipleChoice', newArray);
      
      return { ...prev, multipleChoice: newArray };
    });
  };  

  return (
    <form className="space-y-6">
      <div className="flex justify-center mb-6">
        <Image
          src="/character-placeholder.png"
          alt="Character preview"
          width={200}
          height={200}
          className="rounded-lg"
        />
      </div>
      
      <p className="text-center text-gray-500 mb-8">
        We will redesign the character in your image
      </p>

      <div>
        <label className="block mb-2 font-[500]">
          Full name
        </label>
        <input
          type="text"
          placeholder="please enter..."
          className="w-full p-2 border rounded"
          value={formData.fullName}
          onChange={handleFullNameChange}
          onBlur={handleFullNameBlur}
        />
        {/* 若有错误信息则显示 */}
        {touched.fullName && errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* 性别选择 */}
      <div>
        <div className="flex items-center justify-between">
          <label className="font-[500]">Gender</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="boy"
                checked={formData.gender === 'boy'}
                onChange={handleGenderChange}
                className="hidden"
              />
              <div className={`w-6 h-6 rounded-full border-2 mr-2 flex items-center justify-center
                ${formData.gender === 'boy' ? 'border-[#012CCE] bg-[#012CCE]' : 'border-gray-300'}`}>
                {formData.gender === 'boy' && (
                  <FaCheck className="w-3 h-3 text-white" />
                )}
              </div>
              Boy
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={formData.gender === 'girl'}
                onChange={handleGenderChange}
                className="hidden"
              />
              <div className={`w-6 h-6 rounded-full border-2 mr-2 flex items-center justify-center
                ${formData.gender === 'girl' ? 'border-[#012CCE] bg-[#012CCE]' : 'border-gray-300'}`}>
                {formData.gender === 'girl' && (
                  <FaCheck className="w-3 h-3 text-white" />
                )}
              </div>
              Girl
            </label>
          </div>
        </div>
        {touched.gender && errors.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
        )}
      </div>


      {/* 皮肤颜色选择 */}
      <div>
        <div className="flex items-center justify-between">
          <label className="font-[500]">Skin color</label>
          <div className="flex gap-2">
            {skinColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-8 h-8 rounded-full relative
                  ${formData.skinColor === color.value ? 'ring-4' : ''}`}
                style={{ 
                  backgroundColor: color.value,
                  ...(formData.skinColor === color.value ? {
                    boxShadow: `0 0 0 3px ${
                      color.label === 'Fair' 
                        ? '#FFCDAC'
                        : color.value + '80'  // 添加 80 作为 50% 透明度
                    }`
                  } : {})
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

      {/* 图片上传区域 */}
      <div>
        <label className="block mb-2 flex items-center">
          <span className="font-[500]">Photo</span>
          <span className="text-gray-400 inline-flex items-center group relative font-[400]">
            <FaQuestionCircle className="w-4 h-4 ml-1" />
            <div className="hidden group-hover:block absolute left-0 top-6 w-64 p-2 bg-white/80 text-[#222222] text-sm rounded shadow-lg z-10 backdrop-blur-2xl">
              <p className="mb-2">Upload a photo so we can create a unique image of you. 
              Photos are only generated from user images. We have an independent database 
              to ensure that your privacy will not be leaked.</p>
            </div>
          </span>
        </label>
        <p className="text-sm mb-2 text-[#222222]">Please upload a photo of your character !</p>
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
          {/* 图片上传区域 */}
          <UploadArea
            imageUrl={imageUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            error={error}
            isDragging={isDragging}
            imageSize={imageSize}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDragOver={handleDragOver}
            handleDrop={(e) => 
              handleDrop(e, (file) => handleUploadPhoto(file))}
            handleFileUpload={(e) =>
              handleFileUpload(e, (file) => handleUploadPhoto(file))
            }
            handleDeleteImage={() => {
              handleDeleteImage();
              setFormData((prev) => ({ ...prev, photo: null }));
              setTouched((prev) => ({ ...prev, photo: true }));
              validateField('photo', null);
            }}
          />
          {touched.photo && errors.photo && (
            <p className="text-red-500 text-sm">{errors.photo}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Single Choice Buttons */}
        <div>
          <label className="block mb-2 font-[500]">
            Features <span className="ml-2 text-[#999999]">(Single choice)</span>
          </label>
          <div className="flex flex-wrap gap-2 font-[400]">
            {['lively', 'Quiet', 'kind hearted', 'cute', 'humor'].map((feature) => (
              <button
                key={feature}
                type="button"
                className={`px-4 py-2 rounded border ${
                  formData.singleChoice === feature
                    ? 'bg-red-50 border-black text-black'
                    : 'bg-gray-100 border-transparent text-gray-800'
                }`}
                
                onClick={() => handleSingleChoiceClick(feature)}
              >
                {feature}
              </button>
            ))}
          </div>
          {touched.singleChoice && errors.singleChoice && (
            <p className="text-red-500 text-sm">{errors.singleChoice}</p>
          )}
        </div>

        {/* Multiple Choice Buttons */}
        <div>
          <label className="block mb-2 font-[500]">
            Features <span className="ml-2 text-[#999999]">(Multiple choice)</span>
          </label>
          <div className="flex flex-wrap gap-2 font-[400]">
            {['lively', 'Quiet', 'kind hearted', 'cute', 'humor'].map((feature) => (
              <button
                key={feature}
                type="button"
                className={`relative px-4 py-2 rounded border ${
                  formData.multipleChoice.includes(feature)
                    ? 'border-black bg-[#FCF2F2] text-black'
                    : 'bg-gray-100 border-transparent text-gray-800'
                }`}
                onClick={() => handleMultipleChoiceClick(feature)}
              >
                {feature}
                {formData.multipleChoice.includes(feature) && (
                  <span
                    className="absolute bottom-0 right-0 bg-black text-white flex items-center justify-center text-s"
                    style={{
                      width: '18px',
                      height: '12px',
                      borderRadius: '4px 0 0 0',
                    }}
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

const DoubleCharacterForm = () => {
  // 双人表单的实现
  return (
    <div>
      <h1>Double Character Form</h1>
      {/* 表单内容 */}
    </div>
  );
};
