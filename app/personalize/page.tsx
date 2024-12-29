/** @jsxImportSource react */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { BaseBook } from '@/types/book';

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
  const language = searchParams.get('language');

  const [showModal, setShowModal] = useState(false);
  const [book, setBook] = useState<BaseBook | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<'SINGLE' | 'DOUBLE' | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#FFF5F5] p-4">
      <Link href={`/books/${bookId}`} className="flex items-center text-sm mb-8">
        ← Back to the product page
      </Link>

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

      <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow-sm">
        {renderForm()}
      </div>
    </div>
  );
}

// 不同的表单组件
const SingleCharacterForm1 = () => {
  const [formData, setFormData] = useState<PersonalizeFormData>({
    fullName: '',
    gender: 'girl',
    skinColor: '#FFEFEF',
    photo: null
  });

  const skinColors = [
    { value: '#FFEFEF', label: 'Light' },
    { value: '#FFE2CF', label: 'Fair' },
    { value: '#DCB593', label: 'Medium' },
    { value: '#665444', label: 'Dark' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: event.target.files![0] }));
    }
  };

  return (
    <>
      <h1 className="text-2xl text-center mb-8">请填写基础信息</h1>

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

      <form className="space-y-6">
        <div>
          <label className="block mb-2">
            Full name <span className="text-gray-500">(也可以是称呼)</span>
          </label>
          <input
            type="text"
            placeholder="please enter..."
            className="w-full p-2 border rounded"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          />
        </div>

        <div>
          <label className="block mb-2">Gender</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="boy"
                checked={formData.gender === 'boy'}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: 'boy' }))}
                className="mr-2"
              />
              Boy
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={formData.gender === 'girl'}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: 'girl' }))}
                className="mr-2"
              />
              Girl
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-2">Skin color</label>
          <div className="flex gap-2">
            {skinColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${
                  formData.skinColor === color.value ? 'border-blue-500' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => setFormData(prev => ({ ...prev, skinColor: color.value }))}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2">
            Photo <span className="text-gray-400 text-sm">(?)</span>
          </label>
          <p className="text-sm mb-4">Please upload a photo of your character !</p>
          <ul className="text-sm text-gray-500 mb-4 space-y-1">
            <li>• Make sure the subject is facing the camera.</li>
            <li>• Use a close-up photo.</li>
            <li>• The higher the quality, the better the result!</li>
          </ul>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="mb-2">Please drag the photo in</p>
            <p className="mb-2">or</p>
            <button
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Browse Files
            </button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
        >
          Continue
        </button>
      </form>
    </>
  );
};

const SingleCharacterForm2 = () => {
  // 表单类型 2 的实现
  return (
    <div>
      <h1>Single Character Form Type 2</h1>
      {/* 表单内容 */}
    </div>
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
