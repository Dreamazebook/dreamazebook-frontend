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
import BasicInfoForm, { BasicInfoData } from '../components/BasicInfoForm';

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
}

export default function PersonalizePage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookid');
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [book, setBook] = useState<BaseBook | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<'SINGLE' | 'DOUBLE' | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!selectedFormType) return null;
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
  const [touched, setTouched] = useState<{ [K in keyof PersonalizeFormData]?: boolean }>({});

  // 更新公共部分数据
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // 定义 onErrorChange 回调，用于更新指定字段的错误状态
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
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


const DoubleCharacterForm = () => {
  return (
    <div>
      <h1>Double Character Form</h1>
      {/* 双人表单内容 */}
    </div>
  );
};
