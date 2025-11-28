'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "@/i18n/routing";
import Image from 'next/image';
import api from '@/utils/api';
import { API_CART_LIST } from '@/constants/api';
import { CartItems } from '@/types/cart';
import SingleCharacterForm1, { SingleCharacterForm1Handle } from '@/app/[locale]/(website)/components/personalize/SingleCharacterForm1';
import SingleCharacterForm2, { SingleCharacterForm2Handle } from '@/app/[locale]/(website)/components/personalize/SingleCharacterForm2';
import usePreviewStore from '@/stores/previewStore';

interface ApiResponse<T=any> { success: boolean; code: number; message: string; data: T }
interface DetailedBook { character_count: number }

const skinColors = ['#FFE2CF', '#DCB593', '#665444'];

const SkeletonLoader = () => (
  <div className="w-full max-w-[588px] mx-auto p-6 bg-white rounded shadow-sm animate-pulse mb-16">
    <div className="flex flex-col gap-6">
      {/* 预览图占位 */}
      <div className="w-full h-[200px] bg-gray-200 rounded mb-4"></div>
      
      {/* 名字输入框占位 */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
      </div>

      {/* 性别选择占位 */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="flex gap-4">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* 肤色选择占位 */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="flex gap-4">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function EditPersonalizedProductPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const bookId = params.spu_code as string;
  const previewId = params.preview_id as string; // preview_id 是 UUID 字符串，不是数字
  const currentLang = (pathname.match(/^\/(en|zh|fr)\b/)?.[1] as 'en'|'zh'|'fr') || 'en';

  const [formType, setFormType] = useState<'SINGLE1'|'SINGLE2'|'DOUBLE'|null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [initialData, setInitialData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  // 绘本语言（与网页语言不同），必须从 cart/list 的 preview.language 获取
  const [bookLanguage, setBookLanguage] = useState<string | null>(null);

  const form1Ref = useRef<SingleCharacterForm1Handle>(null);
  const form2Ref = useRef<SingleCharacterForm2Handle>(null);

  // 1) 根据 bookId 获取书籍信息，决定表单类型
  useEffect(() => {
    let ignore = false;
    const fetchBook = async () => {
      try {
        const { data } = await api.get<ApiResponse<DetailedBook>>(`/products/${bookId}`, { params: { language: currentLang } });
        if (ignore) return;
        switch (data.character_count) {
          case 1: setFormType('SINGLE1'); break;
          case 2: setFormType('SINGLE2'); break;
          case 3: setFormType('DOUBLE'); break;
          default: setFormType('SINGLE1');
        }
      } catch {}
    };
    fetchBook();
    return () => { ignore = true };
  }, [bookId]);

  // 从 preview/batches/{previewId} 或购物车中查找初始数据，用于回填个性化表单
  useEffect(() => {
    (async () => {
      // 1) 优先尝试从 /products/{spu_code}/preview/batches/{previewId} 获取 options
      try {
        const base = (process.env.NEXT_PUBLIC_PREVIEW_API_URL || '').replace(/\/$/, '');
        const path = `/products/${bookId}/preview/batches/${previewId}`;
        const url = base ? `${base}${path}` : path;

        const res = await api.get(url) as any;
        const batch = res?.data?.batch || res?.batch || {};
        const options = batch?.options || {};

        if (options && (options.full_name || options.face_images || options.attributes)) {
          const fullName = options.full_name || batch.recipient_name || '';
          const attrs = options.attributes || {};

          // skin_tone: 'white' | 'original' | 'black' → hex
          let skinColor = '';
          const tone = String(attrs.skin_tone || '').toLowerCase();
          if (tone === 'white') skinColor = skinColors[0];
          else if (tone === 'original') skinColor = skinColors[1];
          else if (tone === 'black') skinColor = skinColors[2];

          // hair_style: 后端返回数字 id (如 "1")，需要转换为 "hair_1" 格式以匹配 HairstyleSelector
          const hairstyleRaw = attrs.hair_style || attrs.hairstyle || '';
          const hairstyle = hairstyleRaw 
            ? (hairstyleRaw.startsWith('hair_') ? hairstyleRaw : `hair_${hairstyleRaw}`)
            : '';
          let hairColor = '';
          const hairColorRaw = String(attrs.hair_color || '').toLowerCase();
          if (hairColorRaw === 'blone' || hairColorRaw === 'blonde' || hairColorRaw === 'light') {
            hairColor = 'light';
          } else if (hairColorRaw) {
            hairColor = 'dark';
          }

          // face_images: 取 url/path 作为照片路径
          let faceImages: string[] = [];
          if (Array.isArray(options.face_images)) {
            faceImages = options.face_images
              .map((f: any) => f?.url || f?.path)
              .filter((v: any) => typeof v === 'string' && v);
          }

          setInitialData({
            fullName,
            // 性别后端当前未在 options 中返回，这里留空交给用户选择
            gender: '',
            skinColor,
            photo: faceImages.length > 0 ? { path: faceImages[0] } : null,
            photos: faceImages,
            ...(hairstyle ? { hairstyle } : {}),
            ...(hairColor ? { hairColor } : {}),
          });

          const lang = batch.language;
          if (lang) {
            setBookLanguage(String(lang));
          }

          setIsLoading(false);
          return; // 成功从 batch 获取后，不再走购物车兜底
        }
      } catch (e) {
        console.warn('从 preview/batches 获取初始个性化数据失败，尝试从购物车兜底:', e);
      }

      // 2) 兜底：从购物车列表中查找 previewId 获取初始数据（旧逻辑）
      try {
        const { data } = await api.get<ApiResponse<CartItems>>(`${API_CART_LIST}`);
        const item = data.items.find(ci => String(ci.preview_id) === String(previewId));
        const p = item?.preview;
        if (!p && !item) {
          setIsLoading(false);
          return;
        }
        
        // 兼容 face_image 为 JSON 数组字符串或单值
        let faceImages: string[] = [];
        // 尝试从 preview 或 item 根层级获取 face_image
        const faceImageRaw = p?.face_image || (item as any)?.face_image;
        try {
          if (typeof faceImageRaw === 'string' && faceImageRaw.trim().startsWith('[')) {
            const arr = JSON.parse(faceImageRaw);
            if (Array.isArray(arr)) faceImages = arr;
          } else if (typeof faceImageRaw === 'string' && faceImageRaw) {
            faceImages = [faceImageRaw];
          } else if (Array.isArray(faceImageRaw)) {
            faceImages = faceImageRaw;
          }
        } catch {}
        
        // 获取hairstyle和hairColor
        // hair_style: 后端返回数字 id (如 "1")，需要转换为 "hair_1" 格式以匹配 HairstyleSelector
        const hairstyleRaw = (p as any)?.hairstyle || (p as any)?.hair_style || (item as any)?.hairstyle || (item as any)?.hair_style || '';
        const hairstyle = hairstyleRaw 
          ? (hairstyleRaw.startsWith('hair_') ? hairstyleRaw : `hair_${hairstyleRaw}`)
          : '';
        const hairColor = (p as any)?.hairColor || (p as any)?.hair_color || (item as any)?.hairColor || (item as any)?.hair_color || '';
        
        // 获取性别和肤色 (处理数字字符串或数字)
        const genderVal = p?.gender || (item as any)?.gender;
        const gender = (String(genderVal) === '1') ? 'boy' : (String(genderVal) === '2') ? 'girl' : '';
        
        const skinVal = (p?.skin_color?.length ? p.skin_color[0] : p?.skin_color) || (item as any)?.skin_color;
        // 假设 skinVal 是 1, 2, 3 对应的索引，或者是颜色值
        // 这里 skinColors = ['#FFE2CF', '#DCB593', '#665444'];
        // 如果 skinVal 是数字 1-3，映射到索引 0-2
        let skinColor = '';
        if (skinVal) {
          const skinNum = Number(skinVal);
          if (!isNaN(skinNum) && skinNum >= 1 && skinNum <= 3) {
            skinColor = skinColors[skinNum - 1];
          } else if (typeof skinVal === 'string' && skinVal.startsWith('#')) {
            skinColor = skinVal;
          }
        }

        setInitialData({
          fullName: p?.recipient_name || p?.full_name || (item as any)?.full_name || '',
          gender,
          skinColor,
          photo: faceImages.length > 0 ? { path: faceImages[0] } : null,
          // 预填多张照片（SingleCharacterForm1支持photos数组）
          photos: faceImages,
          // 预填hairstyle和hairColor（如果存在）
          ...(hairstyle ? { hairstyle } : {}),
          ...(hairColor ? { hairColor } : {}),
        });
        
        const lang = p?.language || (item as any)?.language || (item as any)?.attributes?.language;
        if (lang) {
          setBookLanguage(String(lang));
        }
        // 数据加载完成
        setIsLoading(false);
      } catch (e) {
        // 即使出错也取消loading状态，避免永久骨架屏
        setIsLoading(false);
      }
    })();
  }, [bookId, previewId, currentLang]);

  const renderForm = () => {
    if (isLoading) return <SkeletonLoader />;
    if (!formType) return null;
    if (formType === 'SINGLE1') return <SingleCharacterForm1 ref={form1Ref} initialData={initialData} bookId={bookId} currentStep={currentStep} />;
    if (formType === 'SINGLE2') return <SingleCharacterForm2 ref={form2Ref} initialData={initialData} bookId={bookId} />;
    return <SingleCharacterForm1 ref={form1Ref} initialData={initialData} bookId={bookId} currentStep={currentStep} />;
  };

  const handleContinue = async () => {
    // Step 1 处理
    if (currentStep === 1) {
      if (formType === 'SINGLE1' && form1Ref.current) {
        const validationResult = form1Ref.current.validateForm({ scope: 'step1' });
        if (validationResult.isValid) {
          setCurrentStep(2);
          // 滚动到顶部
          window.scrollTo(0, 0);
        } else {
          // 如果验证失败，通常组件内部已经设置了 errors 和 touched 状态
          // 但为了确保用户看到，我们可以手动聚焦到第一个错误字段（如果 ref 支持）
          // 这里我们简单地不做操作，依靠组件的错误提示
          console.log('Step 1 validation failed:', validationResult);
          // 简单提示，避免用户困惑
          // alert('Please fill in all required fields.'); 
        }
      } else if (formType === 'SINGLE2' && form2Ref.current) {
        // ...
      } else {
        // 默认情况
      }
      // 如果是分步表单且在第一步，验证通过后切换到第二步并返回
      if (formType === 'SINGLE1') return;
    }

    // Step 2 (或单步表单) 提交处理
    let fullName: string;
    let genderRaw: '' | 'boy' | 'girl';
    let skinColorRaw: string;
    let photoData: { file?: File; path: string } | null = null;
    let photosData: string[] = [];

    if (formType === 'SINGLE1' && form1Ref.current) {
      const validationResult = form1Ref.current.validateForm({ scope: 'all' });
      if (!validationResult.isValid) return;
      const form1 = form1Ref.current.getFormData();
      fullName = form1.fullName;
      genderRaw = form1.gender;
      skinColorRaw = form1.skinColor;
      photoData = form1.photo;
      photosData = (form1 as any).photos || [];
    } else if (formType === 'SINGLE2' && form2Ref.current) {
      const validationResult = form2Ref.current.validateForm();
      if (!validationResult.isValid) return;
      const form2 = form2Ref.current.getFormData();
      fullName = form2.fullName;
      genderRaw = form2.gender;
      skinColorRaw = form2.skinColor;
      photoData = form2.photo;
      photosData = [form2.photo?.path].filter(Boolean) as string[];
    } else {
      return;
    }

    if (!photoData || !photoData.path) {
      console.error('Please upload photo');
      return;
    }

    const genderCode = genderRaw === 'boy' ? 1 : genderRaw === 'girl' ? 2 : 0;
    const colors = ['#FFE2CF', '#DCB593', '#665444'];
    const idx = colors.findIndex(c => c === skinColorRaw);
    const skinColorCode = idx >= 0 ? idx + 1 : 0;
    if (!genderCode || !skinColorCode) return;

    // 必须从购物车中获取绘本语言，且为2字符
    // 如果购物车中未指定，尝试使用当前网页语言或默认为 'en'
    let targetLang = bookLanguage;
    if (!targetLang || typeof targetLang !== 'string' || targetLang.length !== 2) {
      console.warn('Book language missing from cart, falling back to current locale or en');
      targetLang = currentLang || 'en';
    }

    // 由预览页负责创建任务：使用 Zustand store 存储用户数据
    const userData = {
      characters: [
        {
          full_name: fullName,
          language: targetLang,
          // 与个性化页保持一致：gender 为字符串，gender_code 保留数值
          gender: genderRaw || '',
          gender_code: genderCode,
          skincolor: skinColorCode,
          photo: photoData.path,
          photos: photosData.length > 0 ? photosData : (photoData?.path ? [photoData.path] : []),
        },
      ],
    };
    
    usePreviewStore.getState().setUserData(userData);
    usePreviewStore.getState().setBookId(bookId);
    
    router.push(`/preview?bookid=${bookId}&previewid=${previewId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <div className="flex items-center justify-between w-full sm:hidden">
          <a 
            onClick={(e) => {
              e.preventDefault();
              if (currentStep === 2) {
                setCurrentStep(1);
              } else {
                router.push(`/shopping-cart`);
              }
            }} 
            className="flex items-center text-gray-700 hover:text-blue-500 cursor-pointer"
          >
            <IoIosArrowBack size={24} />
          </a>
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
        <a 
          onClick={(e) => {
            e.preventDefault();
            if (currentStep === 2) {
              setCurrentStep(1);
            } else {
              router.push(`/shopping-cart`);
            }
          }}
          className="hidden sm:flex items-center text-sm cursor-pointer"
        >
          <span className="mr-2">←</span> {currentStep === 2 ? 'Back' : 'Back to shopping cart'}
        </a>
      </div>

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