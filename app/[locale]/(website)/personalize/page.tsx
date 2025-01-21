/** @jsxImportSource react */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { BaseBook } from '@/types/book';
import { FaQuestionCircle, FaCheck, FaRegTrashAlt } from 'react-icons/fa';
import UploadArea from '../components/UploadArea';
import useImageUpload from '../hooks/useImageUpload';

// 定义表单数据接口
interface PersonalizeFormData {
  fullName: string;
  gender: 'boy' | 'girl';
  skinColor: string;
  photo: File | null;
}

export default function PersonalizePage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookid');
  //const language = searchParams.get('language');

  const [showModal, setShowModal] = useState(false);
  const [book, setBook] = useState<BaseBook | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<'SINGLE' | 'DOUBLE' | null>(null);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState<string | null>(null);  // 添加错误状态

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
        return <SingleCharacterForm1 />;
      case 'DOUBLE':
        return <DoubleCharacterForm />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-32">
        <Link href={`/books/${bookId}`} className="flex items-center text-sm">
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
              type="submit"
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
const SingleCharacterForm1 = () => {
  const [formData, setFormData] = React.useState<PersonalizeFormData>({
    fullName: '',
    gender: 'girl',
    skinColor: '#FFE2CF',
    photo: null,
  });

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
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

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, gender: event.target.value as 'boy' | 'girl' }));
  };

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, fullName: event.target.value }));
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
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
        />
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
                onClick={() => setFormData(prev => ({ ...prev, skinColor: color.value }))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 图片上传区域 */}
      <div>
        <label className="block mb-2 flex items-center font-[500]">
          <span>Photo</span>
          <span className="text-gray-400 inline-flex items-center group relative">
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
            handleDrop={(e) => handleDrop(e, (file) => setFormData((prev) => ({ ...prev, photo: file })))}
            handleFileUpload={(e) =>
              handleFileUpload(e, (file) => setFormData((prev) => ({ ...prev, photo: file })))
            }
            handleDeleteImage={() => {
              handleDeleteImage();
              setFormData((prev) => ({ ...prev, photo: null }));
            }}
          />
        </div>
      </div>
    </form>
  );
};

const DoubleCharacterForm = () => {
  // 双人表单的实现
  return (
    <div>
      <h1>Double Character Form</h1>
      {/* 表单内容 */}
    </div>
  );
};
