'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, Link, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';
// Link 已从上方 i18n/routing 导入
import { DetailedBook } from '@/types/book';
import { IoIosArrowBack } from "react-icons/io";
import { getWebSocketUrl } from '@/utils/wsConfig';
import Image from 'next/image';
import echo from '@/app/config/echo';
import useUserStore from '@/stores/userStore';

import { BasicInfoData } from '../components/personalize/BasicInfoForm';
import { PersonalizeFormData } from '../components/personalize/SingleCharacterForm1';

// 为SingleCharacterForm2创建兼容的接口
export interface PersonalizeFormData2 {
  fullName: string;
  gender: '' | 'boy' | 'girl';
  skinColor: string;
  hairstyle: string;
  hairColor: string;
  photos: string[]; // 更新为支持多张图片
  birthSeason: '' | 'spring' | 'summer' | 'autumn' | 'winter';
  dob: Date | null;
  qualities?: string[];
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
  const mockParam = searchParams.get('mock');
  const isKs = searchParams.get('ks') === '1';
  const ksPackageItemId = searchParams.get('package_item_id') || '';
  const ksPackageId = searchParams.get('package_id') || '';
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
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
        const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true' || mockParam === '1';
        if (FRONTEND_PREVIEW) {
          // 预览模式：跳过接口
          if (bookId === '2') {
            setSelectedFormType('SINGLE2');
          } else {
            setSelectedFormType('SINGLE1');
          }
          setLoading(false);
          return;
        }
        try {
          const response = await api.get<ApiResponse>(`/picbooks/${bookId}`);
          setBook(response.data);
          // 基于书籍ID控制表单类型
          if (bookId === '2') {
            setSelectedFormType('SINGLE2');
          } else {
            setSelectedFormType('SINGLE1');
          }
        } catch (error) {
          console.error('Failed to fetch book:', error);
          // 接口失败也允许前端预览
          if (bookId === '2') {
            setSelectedFormType('SINGLE2');
          } else {
            setSelectedFormType('SINGLE1');
          }
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
        return <SingleCharacterForm1 ref={singleForm1Ref} bookId={bookId || '1'} />;
      case 'SINGLE2':
        return <SingleCharacterForm2 ref={singleForm2Ref} bookId={bookId || '1'} />;
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
    let hairstyleRaw: string;
    let hairColorRaw: string;
    let photoData: BasicInfoData['photo'] = null;
    let photosData: string[] = [];
  
    // 1. 拿到表单原始数据
    if (selectedFormType === 'SINGLE1' && singleForm1Ref.current) {
      const isValid = singleForm1Ref.current.validateForm();
      if (!isValid) return;
      const form1 = singleForm1Ref.current.getFormData();
      fullName      = form1.fullName;
      genderRaw     = form1.gender;
      skinColorRaw  = form1.skinColor;
      hairstyleRaw  = form1.hairstyle;
      hairColorRaw  = form1.hairColor;
      photoData     = form1.photo;
      // 获取所有上传的图片路径
      photosData    = (form1 as any).photos || [];
    } else if (selectedFormType === 'SINGLE2' && singleForm2Ref.current) {
      const isValid = singleForm2Ref.current.validateForm();
      if (!isValid) return;
      const form2 = singleForm2Ref.current.getFormData();
      fullName      = form2.fullName;
      genderRaw     = form2.gender;
      skinColorRaw  = form2.skinColor;
      hairstyleRaw  = form2.hairstyle;
      hairColorRaw  = form2.hairColor;
      photoData     = form2.photo;
      photosData    = [form2.photo?.path].filter(Boolean) as string[];
      // 附加字段（书籍2）
      const dobStr = form2.dob ? new Date(form2.dob).toISOString().slice(0,10) : undefined;
      const birthSeason = form2.birthSeason || undefined;
      // qualities 改为在 select-book-content 里选择与保存
      (window as any).__extraPersonalize = { dob: dobStr, birthSeason };
    } else {
      return;
    }
  
    // 校验 photo（预览模式可用占位图）
    const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true' || mockParam === '1';
    if (!photoData || !photoData.path) {
      if (FRONTEND_PREVIEW) {
        photoData = { path: '/personalize/face.png' } as any;
      } else {
        console.error('Please upload photo');
        return;
      }
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

    // 发型映射 (hair_1, hair_2, hair_3, hair_4 -> 1, 2, 3, 4)
    const hairstyleCode = hairstyleRaw ? parseInt(hairstyleRaw.replace('hair_', '')) : 1;

    // 发色映射
    const hairColorMapping = {
      'light': 1,
      'brown': 2,
      'dark': 3,
    };
    const hairColorCode = (hairColorMapping as any)[hairColorRaw] || 1;
  
    // 如果映射失败，也可以 return 或给默认
    if (!genderCode || !skinColorCode) {
      console.error('Invalid skincolor');
      return;
    }
  
    // 3. 将用户数据保存到 localStorage，以便在 preview 页面使用
    const extras = (window as any).__extraPersonalize || {};
    const userData = {
      characters: [
        {
          full_name: fullName,
          language:  langParam || 'en',
          gender:    genderCode,
          skincolor: skinColorCode,
          hairstyle: hairstyleCode,
          haircolor: hairColorCode,
          photo:     (photoData as any).path,
          // 如果有多张图片，也保存所有图片路径
          ...(photosData.length > 0 && { photos: photosData }),
          ...(extras.dob ? { dob: extras.dob } : {}),
          ...(extras.birthSeason ? { birth_season: extras.birthSeason } : {}),
          // qualities 在 select-book-content 进行保存
        },
      ],
    };
    
    localStorage.setItem('previewUserData', JSON.stringify(userData));
    localStorage.setItem('previewBookId', bookId || '');
    
    // 4. 立即跳转到预览页面（使用 i18n 路由）
    const qs = new URLSearchParams();
    if (bookId) qs.set('bookid', bookId);
    if (isKs) qs.set('ks', '1');
    if (isKs && ksPackageItemId) qs.set('package_item_id', ksPackageItemId);
    if (isKs && ksPackageId) qs.set('package_id', ksPackageId);
    router.push(`/preview?${qs.toString()}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <div className="flex items-center justify-between w-full sm:hidden">
          <Link href={isKs ? `/shopping-cart` : `/books/${bookId}`} className="flex items-center text-gray-700 hover:text-blue-500">
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
        <Link href={isKs ? `/shopping-cart` : `/books/${bookId}`} className="hidden sm:flex items-center text-sm">
          <span className="mr-2">←</span> {isKs ? 'Back to the cart' : 'Back to the product page'}
        </Link>
      </div>

      {isKs && (
        <div className="h-12 px-4 sm:px-32 py-2 bg-[#FCF2F2] text-center text-xs sm:text-sm text-[#000000] flex items-center justify-center">
          A book can only be regenerated 3 times per day. You still have 2 chances left.
        </div>
      )}

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
