'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { DetailedBook } from '@/types/book';
import { IoIosArrowBack } from "react-icons/io";
import { getWebSocketUrl } from '@/utils/wsConfig';
import Image from 'next/image';
import echo from '@/app/config/echo';
import useUserStore from '@/stores/userStore';

import { BasicInfoData } from '../components/personalize/BasicInfoForm';
export interface PersonalizeFormData extends BasicInfoData {
  singleChoice: string; // Single choice feature
  multipleChoice: string[]; // Multiple choice features
}
export interface PersonalizeFormData2 extends BasicInfoData {
  birthSeason: '' | 'spring' | 'summer' | 'autumn' | 'winter';
  dob: Date | null;
}

import SingleCharacterForm1, {
  SingleCharacterForm1Handle,
} from '../components/personalize/SingleCharacterForm1';
import SingleCharacterForm2, {
  SingleCharacterForm2Handle,
} from '../components/personalize/SingleCharacterForm2';

//import DoubleCharacterForm from '../components/personalize/DoubleCharacterForm';
interface ApiResponse {
  success: boolean;
  code: number;
  message: string;
  data: DetailedBook;
}

export default function PersonalizePage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookid');
  const langParam = searchParams.get('language') || 'en';
  const router = useRouter();
  const { user } = useUserStore();

  const [book, setBook] = useState<DetailedBook | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<'SINGLE1' | 'SINGLE2' | 'DOUBLE' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const singleForm1Ref = useRef<SingleCharacterForm1Handle>(null);
  const singleForm2Ref = useRef<SingleCharacterForm2Handle>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (bookId) {
        try {
          const response = await api.get<ApiResponse>(`/picbooks/${bookId}`);
          setBook(response.data);
          switch (response.data.character_count) {
            case 1:
              setSelectedFormType('SINGLE1');
              break;
            case 2:
              setSelectedFormType('SINGLE2');
              break;
            case 3:
              setSelectedFormType('DOUBLE');
              break;
            case 4:
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
      case 'SINGLE1':
        return <SingleCharacterForm1 ref={singleForm1Ref} />;
      case 'SINGLE2':
        return <SingleCharacterForm2 ref={singleForm2Ref} />;
      case 'DOUBLE':
        // return <DoubleCharacterForm />;
      default:
        return null;
    }
  };

  // 在你的组件里替换原来的 handleContinue
  const handleContinue = async () => {
    let fullName: string;
    let genderRaw: '' | 'boy' | 'girl';
    let skinColorRaw: string;
    let photoData: { file: File; path: string } | null = null;
  
    // 1. 拿到表单原始数据
    if (selectedFormType === 'SINGLE1' && singleForm1Ref.current) {
      const isValid = singleForm1Ref.current.validateForm();
      if (!isValid) return;
      const form1 = singleForm1Ref.current.getFormData();
      fullName      = form1.fullName;
      genderRaw     = form1.gender;
      skinColorRaw  = form1.skinColor;
      photoData     = form1.photo;
    } else if (selectedFormType === 'SINGLE2' && singleForm2Ref.current) {
      const isValid = singleForm2Ref.current.validateForm();
      if (!isValid) return;
      const form2 = singleForm2Ref.current.getFormData();
      fullName      = form2.fullName;
      genderRaw     = form2.gender;
      skinColorRaw  = form2.skinColor;
      photoData     = form2.photo;
    } else {
      return;
    }
  
    // 校验 photo
    if (!photoData || !photoData.path) {
      console.error('Please upload photo');
      return;
    }
  
    // 2. 字符串 → 数字 映射
    const genderCode =
      genderRaw === 'boy'  ? 1 :
      genderRaw === 'girl' ? 2 :
      0;  // 或者抛错、return
  
    // 通过在 BasicInfoForm 里定义的 skinColors 数组来找下标
    const skinColors = [
      '#FFE2CF', // Fair
      '#DCB593', // Medium
      '#665444', // Dark
    ];
    const idx = skinColors.findIndex(c => c === skinColorRaw);
    const skinColorCode = idx >= 0 ? idx + 1 : 0; // 1,2,3
  
    // 如果映射失败，也可以 return 或给默认
    if (!genderCode || !skinColorCode) {
      console.error('Invalid skincolor');
      return;
    }
  
    try {
      // 3. 调用 preview，发送图片路径
      const payload = {
        characters: [
          {
            full_name: fullName,
            language:  langParam,
            gender:    genderCode,
            skincolor: skinColorCode,
            photo:     photoData.path,
          },
        ],
      };
  
      await api.post(`/picbooks/${bookId}/preview`, payload, {
        timeout: 30000 // 30秒超时
      });

      // 4. 连接 WebSocket
      if (echo && user) {
        const channel = echo.private(`face-swap.${user.id}`);
        
        // 监听生成状态更新
        channel.listen('face-swap.progress', (e: { status: string; progress: number }) => {
          console.log('生成状态更新:', e);
        });

        // 监听生成完成事件
        channel.listen('face-swap.complete', (e: { success: boolean; message: string }) => {
          console.log('生成完成:', e);
          if (e.success) {
            router.push(`/preview?bookid=${bookId}`);
          } else {
            console.error('生成失败:', e.message);
          }
        });

        // 监听错误事件
        channel.listen('face-swap.error', (e: { message: string }) => {
          console.error('生成错误:', e.message);
        });
      } else {
        console.error('WebSocket连接未初始化或用户未登录');
      }

      // 5. 跳转到预览页面
      router.push(`/preview?bookid=${bookId}`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      if (err.code === 'ECONNABORTED') {
        console.error('请求超时，请稍后重试');
      }
    }
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
            <Image 
              src="/logo.png" 
              alt="Home" 
              width={115}
              height={40}
              priority
              className="w-[114.29px] h-[40px]"
            />
          </Link>
        </div>
        <Link href={`/books/${bookId}`} className="hidden sm:flex items-center text-sm">
          <span className="mr-2">←</span> Back to the product page
        </Link>
      </div>

      {showModal && book?.character_count === 3 && (
        <div>Modal to choose SINGLE or DOUBLE</div>
      )}

      <div className="mx-auto">
        <h1 className="text-2xl text-center my-6">Please fill in the basic information</h1>
        {renderForm()}
        <div className="flex justify-center">
          <button 
            type="button" 
            onClick={handleContinue} 
            style={{ width: '180px' }}
            className="bg-black text-white py-3 rounded hover:bg-gray-800 mb-16"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
