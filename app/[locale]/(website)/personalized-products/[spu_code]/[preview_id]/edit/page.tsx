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

  const normalizeGender = (v: any): '' | 'boy' | 'girl' => {
    if (v == null) return '';
    // number / numeric string
    const n = Number(v);
    if (!Number.isNaN(n)) {
      if (n === 1) return 'boy';
      if (n === 2) return 'girl';
    }
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === 'boy' || s === 'girl') return s as any;
      if (s === 'male' || s === 'm' || s === 'man') return 'boy';
      if (s === 'female' || s === 'f' || s === 'woman') return 'girl';
    }
    return '';
  };

  const [formType, setFormType] = useState<'SINGLE1'|'SINGLE2'|'DOUBLE'|null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [initialData, setInitialData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  // 绘本语言（与网页语言不同），必须从 cart/list 的 preview.language 获取
  const [bookLanguage, setBookLanguage] = useState<string | null>(null);
  // 该个性化商品对应的购物车条目 id：用于 regenerate-preview
  const [cartItemId, setCartItemId] = useState<number | null>(null);

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
          const gender = normalizeGender(
            options.gender ??
              options.gender_code ??
              attrs.gender ??
              attrs.gender_code ??
              attrs.genderCode
          );

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
          } else if (hairColorRaw === 'original' || hairColorRaw === 'brown' || hairColorRaw === 'dark_brown') {
            // original 视为 brown
            hairColor = 'brown';
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
            // gender 可能在 options 或 options.attributes 中；缺失则留空交给用户选择
            gender,
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
        if (item?.id) {
          setCartItemId(Number(item.id));
        }
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
        const gender = normalizeGender(genderVal);
        
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

  // 无论初始数据来自 batch 还是 cart，都需要 cartItemId；这里再兜底取一次
  useEffect(() => {
    if (cartItemId) return;
    (async () => {
      try {
        const { data } = await api.get<ApiResponse<CartItems>>(`${API_CART_LIST}`);
        const item = data.items.find(ci => String(ci.preview_id) === String(previewId));
        if (item?.id) setCartItemId(Number(item.id));
      } catch {}
    })();
  }, [cartItemId, previewId]);

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
    let hairStyleRaw: string | undefined;
    let hairColorRaw: string | undefined;
    let photoData: { file?: File; path: string } | null = null;
    let photosData: string[] = [];
    let relationshipRaw: string | undefined;

    if (formType === 'SINGLE1' && form1Ref.current) {
      const validationResult = form1Ref.current.validateForm({ scope: 'all' });
      if (!validationResult.isValid) return;
      const form1 = form1Ref.current.getFormData();
      fullName = form1.fullName;
      genderRaw = form1.gender;
      skinColorRaw = form1.skinColor;
      hairStyleRaw = (form1 as any).hairstyle || (form1 as any).hairStyle;
      hairColorRaw = (form1 as any).hairColor || (form1 as any).hair_color;
      photoData = form1.photo;
      photosData = (form1 as any).photos || [];
      relationshipRaw = (form1 as any).relationship;
    } else if (formType === 'SINGLE2' && form2Ref.current) {
      const validationResult = form2Ref.current.validateForm();
      if (!validationResult.isValid) return;
      const form2 = form2Ref.current.getFormData();
      fullName = form2.fullName;
      genderRaw = form2.gender;
      skinColorRaw = form2.skinColor;
      hairStyleRaw = (form2 as any).hairstyle || (form2 as any).hairStyle;
      hairColorRaw = (form2 as any).hairColor || (form2 as any).hair_color;
      photoData = form2.photo;
      photosData = [form2.photo?.path].filter(Boolean) as string[];
      relationshipRaw = (form2 as any).relationship;
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

    // 使用新接口：POST /api/cart/:cartItemId/regenerate-preview
    if (!cartItemId) {
      console.error('Missing cartItemId for regenerate-preview');
      return;
    }

    const genderStr = genderRaw === 'boy' || genderRaw === 'girl' ? genderRaw : '';
    const skinTone =
      skinColorRaw === skinColors[0] ? 'white' :
      skinColorRaw === skinColors[1] ? 'original' :
      skinColorRaw === skinColors[2] ? 'black' :
      undefined;

    // hair_style: 支持 "hair_1" -> "1"；优先使用用户当前选择，其次用回填的 initialData
    const hairstyleCandidate =
      (hairStyleRaw as any) ||
      (initialData as any)?.hairstyle ||
      (initialData as any)?.hairStyle;
    const hairStyle =
      typeof hairstyleCandidate === 'string' && hairstyleCandidate
        ? (hairstyleCandidate.startsWith('hair_') ? hairstyleCandidate.replace(/^hair_/, '') : hairstyleCandidate)
        : undefined;

    // hair_color: 必填；优先用用户当前选择，其次用 initialData
    const hairColorCandidate =
      (hairColorRaw as any) ||
      (initialData as any)?.hairColor ||
      (initialData as any)?.hair_color;
    const mapHairColorToBackend = (v: any): string | undefined => {
      if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        // 与 personalize/preview 页一致：light -> blone, brown/original -> original, dark/black -> dark
        if (s === 'light') return 'blone';
        if (s === 'brown' || s === 'original') return 'original';
        if (s === 'dark' || s === 'black') return 'dark';
        // 如果后端本身就返回了 blone/original/dark，则直接透传
        if (s === 'blone' || s === 'dark') return s;
        return undefined;
      }
      const n = Number(v);
      if (n === 1) return 'blone';
      if (n === 2) return 'original';
      if (n === 3) return 'dark';
      return undefined;
    };
    const hairColor = mapHairColorToBackend(hairColorCandidate);

    if (!hairStyle || !hairColor) {
      console.error('Missing required attributes for regenerate-preview:', { hairStyle, hairColor });
      return;
    }

    const faceImages = (photosData && photosData.length > 0 ? photosData : [photoData.path]).filter(Boolean);

    const payload = {
      full_name: fullName,
      language: targetLang,
      gender: genderStr,
      relationship: relationshipRaw || 'Parent/Guardian',
      attributes: {
        ...(skinTone ? { skin_tone: skinTone } : {}),
        // 后端校验必填
        hair_style: hairStyle,
        hair_color: hairColor,
      },
      texts: {},
      face_images: faceImages,
    };

    let nextPreviewId: string = String(previewId);
    try {
      const resp = await api.post<any>(`/cart/${cartItemId}/regenerate-preview`, payload);
      // 兼容不同返回结构：优先取 batch_id / preview_id
      const bid =
        resp?.data?.batch_id ||
        resp?.data?.preview_id ||
        resp?.batch_id ||
        resp?.preview_id ||
        resp?.data?.batch?.batch_id ||
        resp?.data?.batch?.id;
      if (bid) nextPreviewId = String(bid);
    } catch (e) {
      console.error('Regenerate preview failed:', e);
      return;
    }

    // 不再“再次添加购物车”；跳转到 preview 展示结果，Add to cart 仅返回购物车
    router.push(`/preview?bookid=${encodeURIComponent(bookId)}&previewid=${encodeURIComponent(nextPreviewId)}&fromCartItemId=${encodeURIComponent(String(cartItemId))}`);
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