'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useParams, useSearchParams } from 'next/navigation';
import { IoIosArrowBack } from "@/utils/icons";
import { Link } from "@/i18n/routing";
import Image from 'next/image';
import api from '@/utils/api';
import { mapAgeStageUiToBackend } from '@/utils/mapAgeStageToBackend';
import { API_CART_LIST } from '@/constants/api';
import { CartItems } from '@/types/cart';
import SingleCharacterForm1, { SingleCharacterForm1Handle } from '@/app/[locale]/(website)/components/personalize/SingleCharacterForm1';
import SingleCharacterForm2, { SingleCharacterForm2Handle } from '@/app/[locale]/(website)/components/personalize/SingleCharacterForm2';
import usePreviewStore from '@/stores/previewStore';
import { isPicbookBirthday } from '@/utils/isPicbookBirthday';
import { isPicbookMom } from '@/utils/isPicbookMom';
import {
  BIRTHDAY_PERSONALITY_TRAITS,
  formatBirthDateIso,
  mapPersonalityTraitIdsToCharacterTraits,
} from '@/utils/birthdayPersonalizeHelpers';
import { buildPicbookPreviewFacePayload } from '@/utils/faceImagePayload';
import { fbTrack, getContentIdBySpu, trackViewItem } from '@/utils/track';

// Track ViewContent only once per page load
let viewContentTracked = false;

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const bookId = params.spu_code as string;
  const birthdayBook = isPicbookBirthday(bookId);
  const momBook = isPicbookMom(bookId);
  const previewId = params.preview_id as string; // preview_id 是 UUID 字符串，不是数字
  const fromCartItemIdParam = searchParams.get('fromCartItemId');
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

  const normalizeAgeStage = (v: any): 'infant' | 'preschooler' | 'early_school_age' | '' => {
    if (v == null) return '';
    const s = String(v).trim().toLowerCase();
    if (!s) return '';
    if (s === 'infant' || s === '0-3' || s === '0–3' || s === '0_3') return 'infant';
    if (s === 'preschooler' || s === '3-6' || s === '3–6' || s === '3_6') return 'preschooler';
    if (s === 'early_school_age' || s === '6+' || s === '6_plus' || s === '6-plus') return 'early_school_age';
    return '';
  };

  const normalizeSkinColor = (v: any): string => {
    if (v == null) return '';
    if (Array.isArray(v)) return normalizeSkinColor(v[0]);
    const s = String(v).trim().toLowerCase();
    if (!s) return '';

    const skinNum = Number(s);
    if (!Number.isNaN(skinNum) && skinNum >= 1 && skinNum <= 3) return skinColors[skinNum - 1];
    if (s.startsWith('#')) return String(v);
    if (s === 'white' || s === 'fair' || s === 'light') return skinColors[0];
    if (s === 'original' || s === 'medium' || s === 'tan') return skinColors[1];
    if (s === 'black' || s === 'dark') return skinColors[2];
    return '';
  };

  const normalizeHairstyle = (v: any): string => {
    if (v == null) return '';
    const s = String(v).trim();
    if (!s) return '';
    return s.startsWith('hair_') ? s : `hair_${s}`;
  };

  const normalizeBirthDate = (v: any): string => {
    if (typeof v !== 'string') return '';
    const s = v.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
  };

  const normalizeBirthdayTraitIds = (...sources: any[]): string[] => {
    const ids = new Set(BIRTHDAY_PERSONALITY_TRAITS.map(t => t.id));
    const result: string[] = [];
    const push = (value: any) => {
      if (!value) return;
      if (typeof value === 'string') {
        const s = value.trim();
        if (!s) return;
        if (s.startsWith('[')) {
          try {
            push(JSON.parse(s));
            return;
          } catch {}
        }
        const traitsMatch = s.match(/^traits_(\d+)$/);
        if (traitsMatch) {
          const trait = BIRTHDAY_PERSONALITY_TRAITS[Number(traitsMatch[1]) - 1];
          if (trait && !result.includes(trait.id)) result.push(trait.id);
          return;
        }
        if (ids.has(s as any) && !result.includes(s)) result.push(s);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(push);
      }
    };

    sources.forEach(push);
    return result;
  };

  const normalizeHairColor = (v: any): string => {
    if (v == null) return '';
    const s = String(v).trim().toLowerCase();
    if (!s) return '';
    if (s === 'blone' || s === 'blonde' || s === 'light' || s === 'fair') return 'light';
    if (s === 'original' || s === 'brown' || s === 'dark_brown') return 'brown';
    if (s === 'dark' || s === 'black') return 'dark';
    return '';
  };

  const extractFaceImageUrls = (...sources: any[]): string[] => {
    const result: string[] = [];
    const push = (value: any) => {
      if (!value) return;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            push(JSON.parse(trimmed));
            return;
          } catch {}
        }
        result.push(trimmed);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(push);
        return;
      }
      if (typeof value === 'object') {
        const imageValue = value.url || value.path || value.data || value.uploadedFilePath;
        if (imageValue) push(imageValue);
      }
    };

    sources.forEach(push);
    return Array.from(new Set(result));
  };

  const [formType, setFormType] = useState<'SINGLE1'|'SINGLE2'|'DOUBLE'|null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [initialData, setInitialData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);
  // 绘本语言（与网页语言不同），必须从 cart/list 的 preview.language 获取
  const [bookLanguage, setBookLanguage] = useState<string | null>(null);
  // 该个性化商品对应的购物车条目 id：用于 regenerate-preview
  const [cartItemId, setCartItemId] = useState<number | null>(null);
  // 圣诞 bundle/套装子项：用于 regenerate-preview（/cart/package-items/:id/regenerate-preview）
  const [packageItemId, setPackageItemId] = useState<number | null>(null);

  const form1Ref = useRef<SingleCharacterForm1Handle>(null);
  const form2Ref = useRef<SingleCharacterForm2Handle>(null);
  const viewContentTrackedRef = useRef(false);

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

  // Track ViewContent when editor page loads
  useEffect(() => {
    if (viewContentTrackedRef.current || isLoading || !formType) return;
    
    viewContentTrackedRef.current = true;
    const contentId = getContentIdBySpu(bookId);
    
    if (contentId) {
      // Meta Pixel: ViewContent
      fbTrack('ViewContent', {
        content_name: 'editor_open',
        content_category: 'book',
        content_ids: [contentId],
        content_type: 'product',
        contents: [{ id: contentId }]
      });
    }
    
    // GA4: Track view_item event (entering editor)
    trackViewItem(bookId, bookId);
  }, [isLoading, formType, bookId]);

  // 从 preview/batches/{previewId} 或购物车中查找初始数据，用于回填个性化表单
  useEffect(() => {
    (async () => {
      // 1) 优先尝试从 /products/{spu_code}/preview/batches/{previewId} 获取 options
      try {
        const path = `/products/${bookId}/preview/batches/${previewId}`;
        // 客户端强制走同域 /api 代理，避免跨域下响应头（X-Guest-Session-Id）不可读
        const url = path;

        const res = await api.get(url) as any;
        const batch = res?.data?.batch || res?.batch || {};
        const options = batch?.options || {};

        if (options && (options.full_name || options.face_images || options.attributes)) {
          const attrs = options.attributes || {};
          const fullName = options.full_name || attrs.full_name || batch.recipient_name || '';
          const gender = normalizeGender(
            options.gender ??
              options.gender_code ??
              attrs.gender ??
              attrs.gender_code ??
              attrs.genderCode
          );

          const skinColor = normalizeSkinColor(attrs.skin_tone ?? attrs.skin_color ?? options.skin_tone ?? options.skin_color);
          const hairstyle = normalizeHairstyle(attrs.hair_style ?? attrs.hairstyle ?? options.hair_style ?? options.hairstyle);
          const hairColor = normalizeHairColor(attrs.hair_color ?? options.hair_color);
          const ageStage = normalizeAgeStage(attrs.age_stage ?? options.age_stage);
          const fromWhom = String(options.giver_name ?? attrs.giver_name ?? attrs.from_whom ?? attrs.created_by ?? '').trim();
          const faceImages = extractFaceImageUrls(options.face_images, attrs.face_images);
          const birthDate = normalizeBirthDate(attrs.birthday_context?.birthday);
          const personalityTraitIds = normalizeBirthdayTraitIds(attrs.birthday_context?.selected_traits);
          const giftMessage = String(attrs.gift_message || '').trim();

          setInitialData({
            fullName,
            // gender 可能在 options 或 options.attributes 中；缺失则留空交给用户选择
            gender,
            skinColor,
            photo: faceImages.length > 0 ? { path: faceImages[0] } : null,
            photos: faceImages,
            ...(hairstyle ? { hairstyle } : {}),
            ...(hairColor ? { hairColor } : {}),
            ...(ageStage ? { ageStage } : {}),
            ...(fromWhom ? { fromWhom } : {}),
            ...(birthDate ? { birthDate } : {}),
            ...(personalityTraitIds.length ? { personalityTraitIds } : {}),
            ...(giftMessage ? { giftMessage } : {}),
            ...(typeof attrs.mom_calls_me === 'string' ? { momCallsMe: attrs.mom_calls_me } : {}),
            ...(typeof attrs.mom_makes_best === 'string' ? { momMakesBest: attrs.mom_makes_best } : {}),
          });

          const lang = batch.language || options.language || attrs.language;
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
        const items: any[] = Array.isArray((data as any)?.items) ? (data as any).items : [];
        const itemByCartItemId = fromCartItemIdParam
          ? items.find((ci: any) => String(ci.id) === String(fromCartItemIdParam))
          : null;
        const itemByPreviewId = items.find((ci: any) => String(ci.preview_id) === String(previewId));
        const item = itemByCartItemId || itemByPreviewId;
        if (item?.id) setCartItemId(Number(item.id));
        // 圣诞 bundle：preview_id 可能在 package.items[].customization_data.preview_id
        if (!item) {
          for (const pkg of items) {
            const subItems: any[] = Array.isArray((pkg as any)?.items) ? (pkg as any).items : [];
            const match = subItems.find(
              (pi: any) =>
                (fromCartItemIdParam && String(pi?.id) === String(fromCartItemIdParam)) ||
                String(pi?.preview_id || pi?.customization_data?.preview_id) === String(previewId),
            );
            if (match?.id) {
              setPackageItemId(Number(match.id));
              // 尽力补齐绘本语言（如果 batch 没给 language）
              const lang =
                match?.customization_data?.language ||
                match?.preview?.language ||
                match?.language;
              if (lang) setBookLanguage(String(lang));
              break;
            }
          }
        }
        const p = item?.preview;
        if (!p && !item) {
          setIsLoading(false);
          return;
        }
        
        const cartAttrs = (p as any)?.attributes || (item as any)?.attributes || {};

        // 兼容 face_image/face_images 为 JSON 字符串、数组、对象或单值
        const faceImages = extractFaceImageUrls(
          p?.face_images,
          p?.face_image,
          (item as any)?.face_images,
          (item as any)?.face_image,
          cartAttrs.face_images,
        );
        
        // 获取hairstyle和hairColor
        // hair_style: 后端返回数字 id (如 "1")，需要转换为 "hair_1" 格式以匹配 HairstyleSelector
        const hairstyle = normalizeHairstyle(
          (p as any)?.hairstyle || (p as any)?.hair_style || (item as any)?.hairstyle || (item as any)?.hair_style || cartAttrs.hair_style || cartAttrs.hairstyle,
        );
        const hairColor = normalizeHairColor(
          (p as any)?.hairColor || (p as any)?.hair_color || (item as any)?.hairColor || (item as any)?.hair_color || cartAttrs.hair_color,
        );
        
        // 获取性别和肤色 (处理数字字符串或数字)
        const genderVal = p?.gender || (item as any)?.gender || cartAttrs.gender;
        const gender = normalizeGender(genderVal);
        
        const previewSkinColor = Array.isArray(p?.skin_color) ? p.skin_color[0] : p?.skin_color;
        const skinVal = previewSkinColor || (item as any)?.skin_color || cartAttrs.skin_tone || cartAttrs.skin_color;
        const skinColor = normalizeSkinColor(skinVal);

        const ageStage = normalizeAgeStage((p as any)?.age_stage || (item as any)?.age_stage || cartAttrs.age_stage);
        const fromWhom = String((p as any)?.giver_name || (item as any)?.giver_name || cartAttrs.giver_name || cartAttrs.from_whom || cartAttrs.created_by || '').trim();
        const birthDate = normalizeBirthDate(cartAttrs.birthday_context?.birthday);
        const personalityTraitIds = normalizeBirthdayTraitIds(cartAttrs.birthday_context?.selected_traits);
        const giftMessage = String(
          (item as any)?.attributes?.gift_message ||
          (item as any)?.customization_data?.attributes?.gift_message ||
          cartAttrs.gift_message ||
          (p as any)?.message ||
          (p as any)?.dedication ||
          ''
        ).trim();
        setInitialData({
          fullName: p?.recipient_name || p?.full_name || (item as any)?.full_name || cartAttrs.full_name || '',
          gender,
          skinColor,
          photo: faceImages.length > 0 ? { path: faceImages[0] } : null,
          // 预填多张照片（SingleCharacterForm1支持photos数组）
          photos: faceImages,
          // 预填hairstyle和hairColor（如果存在）
          ...(hairstyle ? { hairstyle } : {}),
          ...(hairColor ? { hairColor } : {}),
          ...(ageStage ? { ageStage } : {}),
          ...(fromWhom ? { fromWhom } : {}),
          ...(birthDate ? { birthDate } : {}),
          ...(personalityTraitIds.length ? { personalityTraitIds } : {}),
          ...(giftMessage ? { giftMessage } : {}),
          ...(typeof cartAttrs.mom_calls_me === 'string' ? { momCallsMe: cartAttrs.mom_calls_me } : {}),
          ...(typeof cartAttrs.mom_makes_best === 'string' ? { momMakesBest: cartAttrs.mom_makes_best } : {}),
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
  }, [bookId, previewId, fromCartItemIdParam, currentLang]);

  // 无论初始数据来自 batch 还是 cart，都需要 cartItemId；这里再兜底取一次
  useEffect(() => {
    if (cartItemId || packageItemId) return;
    (async () => {
      try {
        const { data } = await api.get<ApiResponse<CartItems>>(`${API_CART_LIST}`);
        const items: any[] = Array.isArray((data as any)?.items) ? (data as any).items : [];
        const itemByCartItemId = fromCartItemIdParam
          ? items.find((ci: any) => String(ci.id) === String(fromCartItemIdParam))
          : null;
        const itemByPreviewId = items.find((ci: any) => String(ci.preview_id) === String(previewId));
        const item = itemByCartItemId || itemByPreviewId;
        if (item?.id) setCartItemId(Number(item.id));
        if (!item) {
          for (const pkg of items) {
            const subItems: any[] = Array.isArray((pkg as any)?.items) ? (pkg as any).items : [];
            const match = subItems.find(
              (pi: any) =>
                (fromCartItemIdParam && String(pi?.id) === String(fromCartItemIdParam)) ||
                String(pi?.preview_id || pi?.customization_data?.preview_id) === String(previewId),
            );
            if (match?.id) {
              setPackageItemId(Number(match.id));
              break;
            }
          }
        }
      } catch {}
    })();
  }, [cartItemId, packageItemId, previewId, fromCartItemIdParam]);

  const renderForm = () => {
    if (isLoading) return <SkeletonLoader />;
    if (!formType) return null;
    const form1Asset = birthdayBook ? 'PICBOOK_BIRTHDAY' : momBook ? 'PICBOOK_MOM' : 'PICBOOK_GOODNIGHT';
    if (formType === 'SINGLE1')
      return (
        <SingleCharacterForm1
          ref={form1Ref}
          initialData={initialData}
          bookId={bookId}
          currentStep={currentStep}
          defaultConsentChecked
          assetSpuCode={form1Asset}
        />
      );
    if (formType === 'SINGLE2') return <SingleCharacterForm2 ref={form2Ref} initialData={initialData} bookId={bookId} />;
    return (
      <SingleCharacterForm1
        ref={form1Ref}
        initialData={initialData}
        bookId={bookId}
        currentStep={currentStep}
        defaultConsentChecked
        assetSpuCode={form1Asset}
      />
    );
  };

  const handleContinue = async () => {
    if (isContinuing) return;
    setIsContinuing(true);
    const stop = () => setIsContinuing(false);
    try {
      // Step 1 处理
      if (currentStep === 1) {
        if (formType === 'SINGLE1' && form1Ref.current) {
          const validationResult = form1Ref.current.validateForm({ scope: 'step1' });
          if (validationResult.isValid) {
            setCurrentStep(2);
            // 滚动到顶部
            window.scrollTo(0, 0);
            // Step1 只是翻到下一步，不需要 loading
            stop();
            return;
          }
          console.log('Step 1 validation failed:', validationResult);
          stop();
          return;
        } else if (formType === 'SINGLE2' && form2Ref.current) {
          // ...
          stop();
          return;
        } else {
          // 默认情况
          stop();
          return;
        }
      }

      if (birthdayBook && formType === 'SINGLE1' && currentStep === 2 && form1Ref.current) {
        const validationResult = form1Ref.current.validateForm({ scope: 'stepBirthday' });
        if (!validationResult.isValid) {
          stop();
          return;
        }
        setCurrentStep(3);
        window.scrollTo(0, 0);
        stop();
        return;
      }

      if (momBook && formType === 'SINGLE1' && currentStep === 2 && form1Ref.current) {
        const validationResult = form1Ref.current.validateForm({ scope: 'stepMomLove' });
        if (!validationResult.isValid) {
          stop();
          return;
        }
        setCurrentStep(3);
        window.scrollTo(0, 0);
        stop();
        return;
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
      let giverNameRaw = '';
      let ageStageUi: string | undefined;

      if (formType === 'SINGLE1' && form1Ref.current) {
        const validationResult = form1Ref.current.validateForm({ scope: 'all' });
        if (!validationResult.isValid) {
          stop();
          return;
        }
        const form1 = form1Ref.current.getFormData();
        fullName = form1.fullName;
        genderRaw = form1.gender;
        skinColorRaw = form1.skinColor;
        hairStyleRaw = (form1 as any).hairstyle || (form1 as any).hairStyle;
        hairColorRaw = (form1 as any).hairColor || (form1 as any).hair_color;
        photoData = form1.photo;
        photosData = (form1 as any).photos || [];
        relationshipRaw = (form1 as any).relationship;
        giverNameRaw = String((form1 as any).fromWhom || '').trim();
        ageStageUi = (form1 as any).ageStage;
      } else if (formType === 'SINGLE2' && form2Ref.current) {
        const validationResult = form2Ref.current.validateForm();
        if (!validationResult.isValid) {
          stop();
          return;
        }
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
        stop();
        return;
      }

      if (!photoData || !photoData.path) {
        console.error('Please upload photo');
        stop();
        return;
      }

      const genderCode = genderRaw === 'boy' ? 1 : genderRaw === 'girl' ? 2 : 0;
      const colors = ['#FFE2CF', '#DCB593', '#665444'];
      const idx = colors.findIndex(c => c === skinColorRaw);
      const skinColorCode = idx >= 0 ? idx + 1 : 0;
      if (!genderCode || !skinColorCode) {
        stop();
        return;
      }

      // 必须从购物车中获取绘本语言，且为2字符
      // 如果购物车中未指定，尝试使用当前网页语言或默认为 'en'
      let targetLang = bookLanguage;
      if (!targetLang || typeof targetLang !== 'string' || targetLang.length !== 2) {
        console.warn('Book language missing from cart, falling back to current locale or en');
        targetLang = currentLang || 'en';
      }

      // regenerate-preview：普通商品用 cartItemId；圣诞 bundle 子项用 packageItemId
      const effectiveItemId = cartItemId ?? packageItemId;
      const isPackageItem = !cartItemId && !!packageItemId;
      if (!effectiveItemId) {
        console.error('Missing cartItemId/packageItemId for regenerate-preview');
        stop();
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
        stop();
        return;
      }

      const faceImages = (photosData && photosData.length > 0 ? photosData : [photoData.path]).filter(Boolean);

      const ageStageBackend = mapAgeStageUiToBackend(ageStageUi);

      const form1Snap = formType === 'SINGLE1' && form1Ref.current ? form1Ref.current.getFormData() : null;
      const birthDate = form1Snap?.birthDate && !Number.isNaN(form1Snap.birthDate.getTime()) ? form1Snap.birthDate : null;
      const birthdayStr = birthDate ? formatBirthDateIso(birthDate) : undefined;
      const traitUiIds =
        birthdayBook && Array.isArray(form1Snap?.personalityTraitIds) ? form1Snap!.personalityTraitIds! : [];
      const characterTraits =
        traitUiIds.length === 4 ? mapPersonalityTraitIdsToCharacterTraits(traitUiIds) : [];
      const characterTraitsOk = characterTraits.length === 4;

      const fb = buildPicbookPreviewFacePayload(bookId, faceImages);
      const giftMessage = String((initialData as any)?.giftMessage || (initialData as any)?.gift_message || '').trim();

      const payload = {
        full_name: fullName,
        language: targetLang,
        gender: genderStr,
        relationship: relationshipRaw || 'Parent/Guardian',
        ...(giverNameRaw ? { giver_name: giverNameRaw } : {}),
        face_images: fb.face_images,
        attributes: {
          ...(skinTone ? { skin_tone: skinTone } : {}),
          // 后端校验必填
          hair_style: hairStyle,
          hair_color: hairColor,
          ...(ageStageBackend ? { age_stage: ageStageBackend } : {}),
          ...(giftMessage ? { gift_message: giftMessage } : {}),
          ...(birthdayBook && birthdayStr
            ? {
                birthday: birthdayStr,
                ...(characterTraitsOk ? { character_traits: characterTraits } : {}),
              }
            : {}),
          ...(momBook && form1Snap
            ? {
                mom_calls_me: String(form1Snap.momCallsMe ?? '').trim(),
                mom_makes_best: String(form1Snap.momMakesBest ?? '').trim(),
              }
            : {}),
          ...fb.faceAttributes,
        },
        texts: {},
      };

      let nextPreviewId: string = String(previewId);
      try {
        const endpoint = isPackageItem
          ? `/cart/package-items/${encodeURIComponent(String(effectiveItemId))}/regenerate-preview`
          : `/cart/${encodeURIComponent(String(effectiveItemId))}/regenerate-preview`;
        const resp = await api.post<any>(endpoint, payload);
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
        stop();
        return;
      }

      // 把最新的 full_name 写入 preview store / localStorage，避免 preview 页优先使用旧的 store 名字导致“改名无效”
      try {
        const userData = {
          characters: [
            {
              full_name: fullName,
              language: targetLang,
              gender: genderStr,
              relationship: relationshipRaw || 'Parent/Guardian',
              ...(giverNameRaw ? { giver_name: giverNameRaw } : {}),
              ...(giftMessage ? { gift_message: giftMessage } : {}),
              attributes: payload.attributes || {},
              photo: faceImages?.[0] || '',
              photos: faceImages || [],
            },
          ],
        };
        const { setUserData, setBookId } = usePreviewStore.getState();
        setUserData(userData);
        setBookId(bookId || '');
        localStorage.setItem('previewUserData', JSON.stringify(userData));
      } catch {}

      // 不再“再次添加购物车”；跳转到 preview 展示结果，Add to cart 仅返回购物车
      // 重要：圣诞 bundle 需要透传 packageItemId（preview 页会走 /cart/package-items/:id/regenerate-preview）
      router.push(
        `/preview?bookid=${encodeURIComponent(bookId)}&previewid=${encodeURIComponent(
          nextPreviewId,
        )}&fromCartItemId=${encodeURIComponent(String(effectiveItemId))}${
          isPackageItem ? '&hideOptions=1' : ''
        }`,
      );
      // 注意：成功 push 后保持 loading，直到页面卸载（与详情页 personalize 按钮一致）
    } catch (e) {
      console.error('Continue failed:', e);
      stop();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <div className="flex items-center justify-between w-full sm:hidden">
          <a 
            onClick={(e) => {
              e.preventDefault();
              if (birthdayBook && currentStep === 3) {
                setCurrentStep(2);
              } else if (momBook && currentStep === 3) {
                setCurrentStep(2);
              } else if (currentStep === 2) {
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
            if (birthdayBook && currentStep === 3) {
              setCurrentStep(2);
            } else if (momBook && currentStep === 3) {
              setCurrentStep(2);
            } else if (currentStep === 2) {
              setCurrentStep(1);
            } else {
              router.push(`/shopping-cart`);
            }
          }}
          className="hidden sm:flex items-center text-sm cursor-pointer"
        >
          <span className="mr-2">←</span>{' '}
          {currentStep === 2 || (birthdayBook && currentStep === 3) || (momBook && currentStep === 3)
            ? 'Back'
            : 'Back to shopping cart'}
        </a>
      </div>

      <div className="mx-auto">
        <h1 className="text-[28px] leading-[36px] text-center my-6">Please fill in the basic information</h1>
        {renderForm()}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            style={{ width: '180px' }}
            disabled={isContinuing}
            className={`bg-[#222222] text-[#F5E3E3] h-[44px] px-4 py-3 rounded-[4px] hover:bg-gray-800 text-[14px] leading-[20px] tracking-[0.25px] transition-colors flex items-center justify-center whitespace-nowrap mb-16 ${
              isContinuing ? 'opacity-75 cursor-wait pointer-events-none' : ''
            }`}
          >
            {isContinuing ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}