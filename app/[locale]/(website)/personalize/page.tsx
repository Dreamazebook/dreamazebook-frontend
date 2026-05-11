'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, Link, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { IoIosArrowBack } from '@/utils/icons';
import api from '@/utils/api';
import { fbTrack, getContentIdBySpu, trackViewItem } from '@/utils/track';
import SingleCharacterForm1, { SingleCharacterForm1Handle } from '../components/personalize/SingleCharacterForm1';
import SingleCharacterForm2, { SingleCharacterForm2Handle } from '../components/personalize/SingleCharacterForm2';
import SingleCharacterForm3, { SingleCharacterForm3Handle } from '../components/personalize/SingleCharacterForm3';
import { buildProductSchema, extractFieldOptions, resolveSkuPrice } from '@/utils/productAdapter';
import { mapAgeStageUiToBackend } from '@/utils/mapAgeStageToBackend';
import usePreviewStore from '@/stores/previewStore';
import { isPicbookBirthday } from '@/utils/isPicbookBirthday';
import { formatBirthDateIso, mapPersonalityTraitIdsToCharacterTraits } from '@/utils/birthdayPersonalizeHelpers';
import { isPicbookMom } from '@/utils/isPicbookMom';
import { buildPicbookPreviewFacePayload } from '@/utils/faceImagePayload';

type AttributeOption = { value: string; label?: string; is_default?: boolean; price_diff?: number | string };
type Attribute = { name: string; options: AttributeOption[]; default?: string };

// Keep the mobile personalize title aligned with book detail and Our Books.
const BOOK_NAME_OVERRIDES: Record<string, string> = {
  PICBOOK_GOODNIGHT3: 'Good Night to You',
  PICBOOK_MOM: 'The Way I See You, Mama',
  PICBOOK_BRAVEY: "Little One, You're Brave in Many Ways",
  PICBOOK_BIRTHDAY: 'Birthday Book for You',
  PICBOOK_MELODY: 'Your Melody',
  PICBOOK_SANTA: "Santa's Letter for You",
};

const resolveBookDisplayName = (product: any, fallbackBookId: string) => {
  const idOrCode = String(
    product?.spu_code ?? product?.id ?? product?.code ?? fallbackBookId ?? ''
  ).trim();
  const originalName = product?.name ?? product?.default_name ?? '';

  return BOOK_NAME_OVERRIDES[idOrCode] || originalName;
};

// Track ViewContent only once per page load
let viewContentTracked = false;

export default function PersonalizeApiDrivenPage() {
  const searchParams = useSearchParams();
  // Accept multiple identifiers: book name, spu_code, or legacy id
  const bookId =
    searchParams.get('book') ||
    searchParams.get('name') ||
    searchParams.get('spu') ||
    searchParams.get('bookid') ||
    '';
  const mockParam = searchParams.get('mock');
  const useForm3 = searchParams.get('form3') === '1' || searchParams.get('form') === '3';
  const isKs = searchParams.get('ks') === '1';
  const ksPackageItemId = searchParams.get('package_item_id') || '';
  const ksPackageId = searchParams.get('package_id') || '';
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const isBirthdayPersonalize = isPicbookBirthday(bookId);
  const isMomBookPersonalize = isPicbookMom(bookId);
  const personalizeAvatarAssetSpu = isBirthdayPersonalize
    ? 'PICBOOK_BIRTHDAY'
    : String(bookId || '').trim().toUpperCase() === 'PICBOOK_MOM'
      ? 'PICBOOK_MOM'
      : 'PICBOOK_GOODNIGHT';

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formType, setFormType] = useState<'SINGLE1' | 'SINGLE2'>('SINGLE1');
  const [currentStep, setCurrentStep] = useState<number>(1); // 手机端步骤管理：1 或 2

  const [skinToneValues, setSkinToneValues] = useState<string[] | undefined>(undefined);
  const [hairStyleValues, setHairStyleValues] = useState<string[] | undefined>(undefined);
  const [hairColorValues, setHairColorValues] = useState<string[] | undefined>(undefined);

  const [initials, setInitials] = useState<{ skinColor?: string; hairstyle?: string; hairColor?: string }>({});
  const [productSchema, setProductSchema] = useState<any>(null);
  const [rawApi, setRawApi] = useState<any>(null);
  const [uploadOptions, setUploadOptions] = useState<{ allowedTypes?: string[]; maxFileSize?: number; maxImages?: number } | undefined>(undefined);
  const [bookName, setBookName] = useState<string>('');

  const form1Ref = useRef<SingleCharacterForm1Handle>(null);
  const form2Ref = useRef<SingleCharacterForm2Handle>(null);
  const form3Ref = useRef<SingleCharacterForm3Handle>(null);

  const viewContentTrackedRef = useRef(false);

  // 跟踪是否正在添加图片（裁剪器是否打开）
  const [isAddingImage, setIsAddingImage] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true' || mockParam === '1';
      try {
        if (FRONTEND_PREVIEW) {
          // 预览模式
          setFormType(bookId === '2' ? 'SINGLE2' : 'SINGLE1');
          setUploadOptions({
            allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
            maxFileSize: 20 * 1024 * 1024,
            maxImages: isMomBookPersonalize ? 2 : 1,
          });
          setLoading(false);
          return;
        }
        // Backend supports querying by name or spu_code; use unified endpoint with identifier as path
        if (!bookId) throw new Error('Missing book identifier');
        // 根据 URL 路径决定请求语言，确保 /en 下显示英文，/zh 下显示中文
        const requestLang = locale === 'zh' ? 'zh' : 'en';
        const res = await api.get<any>(`/products/${encodeURIComponent(String(bookId))}`, { params: { language: requestLang } });
        setRawApi(res?.data || res);
        const product = res?.data?.data || res?.data || {};
        // 获取书籍名称，保持和详情页 / Our Books 的前端覆盖逻辑一致
        const name = resolveBookDisplayName(product, bookId);
        setBookName(name);
        const attributes: Attribute[] = Array.isArray(product.attributes) ? product.attributes : [];

        const pick = (name: string) => attributes.find(a => a?.name === name);
        const skin = pick('skin_tone');
        const hairStyle = pick('hair_style');
        const hairColor = pick('hair_color');

        // Values
        setSkinToneValues(skin?.options?.map(o => o.value) || undefined);
        setHairStyleValues(hairStyle?.options?.map(o => o.value) || undefined);
        setHairColorValues(hairColor?.options?.map(o => o.value) || undefined);

        // Defaults → map to existing UI's internal values
        const defaultSkin = (skin?.default || skin?.options?.find(o => o.is_default)?.value || '').toString();
        const defaultHairStyle = (hairStyle?.default || hairStyle?.options?.find(o => o.is_default)?.value || '').toString();
        const defaultHairColor = (hairColor?.default || hairColor?.options?.find(o => o.is_default)?.value || '').toString();

        const mapSkinToColor = (s: string) => {
          const v = (s || '').toLowerCase();
          if (v === 'white' || v === 'fair' || v === 'light') return '#FFE2CF';
          if (v === 'original' || v === 'medium' || v === 'tan') return '#DCB593';
          if (v === 'black' || v === 'dark') return '#665444';
          return '#FFE2CF';
        };
        const mapHairStyle = (s: string) => (s ? `hair_${s}` : 'hair_1');
        const mapHairColor = (s: string) => {
          const v = (s || '').toLowerCase();
          if (v === 'blone' || v === 'blonde' || v === 'light') return 'light';
          if (v === 'dark' || v === 'black') return 'dark';
          // 其余（包括 original/brown）统一视为 brown
          return 'brown';
        };

        setInitials({
          skinColor: defaultSkin ? mapSkinToColor(defaultSkin) : undefined,
          hairstyle: defaultHairStyle ? mapHairStyle(defaultHairStyle) : undefined,
          hairColor: defaultHairColor ? mapHairColor(defaultHairColor) : undefined,
        });

        setFormType(bookId === '2' ? 'SINGLE2' : 'SINGLE1');

        // Build normalized schema and derive options
        const schema = buildProductSchema(res?.data || res);
        setProductSchema(schema);
        setSkinToneValues(extractFieldOptions(schema, 'skin_tone'));
        setHairStyleValues(extractFieldOptions(schema, 'hair_style'));
        setHairColorValues(extractFieldOptions(schema, 'hair_color'));

        // Upload constraints
        try {
          const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
          const maxSize = 20 * 1024 * 1024; // 20MB
          setUploadOptions({
            allowedTypes: allowed,
            maxFileSize: maxSize,
            maxImages: isMomBookPersonalize ? 2 : 1,
          });
        } catch {}
      } catch (e) {
        setFormType(bookId === '2' ? 'SINGLE2' : 'SINGLE1');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [bookId, locale, mockParam]);

  // Track ViewContent when personalize page loads
  useEffect(() => {
    if (viewContentTrackedRef.current || loading) return;
    
    viewContentTrackedRef.current = true;
    const contentId = getContentIdBySpu(bookId);
    
    if (contentId) {
      console.log(contentId);
      // Meta Pixel: ViewContent
      fbTrack('ViewContent', {
        content_name: 'editor_open',
        content_category: 'book',
        content_ids: [contentId],
        content_type: 'product',
        contents: [{ id: contentId }]
      });
    }
  }, [loading, bookId]);

  // GA4: Track view_item event
  useEffect(() => {
    if (bookId && bookName && !loading) {
      trackViewItem(bookId, bookName);
    }
  }, [bookId, bookName, loading]);

  useEffect(() => {
    setCurrentStep(1);
  }, [bookId]);

  // 处理裁剪器状态变化
  const handleCropperOpenChange = (isOpen: boolean) => {
    setIsAddingImage(isOpen);
  };

  // 滚动到错误字段的函数
  const scrollToErrorField = (fieldName: string | null) => {
    if (!fieldName) return;
    
    // 对于 photo 字段，使用上传区域的特殊 id
    const elementId = fieldName === 'photo' ? 'upload-area-photo' : `field-${fieldName}`;
    const element = document.getElementById(elementId);
    
    if (element) {
      // 计算偏移量：考虑手机端吸底栏高度（76px）和顶部导航栏高度（56px）
      const isMobile = window.innerWidth < 768; // md breakpoint
      const stickyBarHeight = isMobile ? 76 : 0;
      const headerHeight = 56; // h-14 = 56px
      const offset = stickyBarHeight + headerHeight + 20; // 额外 20px 间距
      
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // 手机端：处理下一步按钮点击
  const handleNextStep = () => {
    if (formType === 'SINGLE1' && form1Ref.current) {
      if (currentStep === 1) {
        let hasError = false;
        let firstErrorField: string | null = null;

        const formData = form1Ref.current.getFormData();
        if (!formData.fullName?.trim()) {
          hasError = true;
          firstErrorField = 'fullName';
        } else if (!formData.gender) {
          hasError = true;
          firstErrorField = 'gender';
        } else if (!formData.skinColor) {
          hasError = true;
          firstErrorField = 'skinColor';
        } else if (!formData.ageStage) {
          hasError = true;
          firstErrorField = 'ageStage';
        } else if (!String(formData.fromWhom || '').trim()) {
          hasError = true;
          firstErrorField = 'fromWhom';
        } else if (!formData.hairstyle) {
          hasError = true;
          firstErrorField = 'hairstyle';
        } else if (!formData.hairColor) {
          hasError = true;
          firstErrorField = 'hairColor';
        }

        if (hasError && firstErrorField) {
          form1Ref.current.validateForm({ scope: 'step1' });
          setTimeout(() => {
            const elementId = firstErrorField === 'photo' ? 'upload-area-photo' : `field-${firstErrorField}`;
            const element = document.getElementById(elementId);
            if (element) {
              const isMobile = window.innerWidth < 768;
              const stickyBarHeight = isMobile ? 76 : 0;
              const headerHeight = 56;
              const offset = stickyBarHeight + headerHeight + 20;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - offset;
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
          }, 100);
          return;
        }
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (isBirthdayPersonalize && currentStep === 2) {
        const validationResult = form1Ref.current.validateForm({ scope: 'stepBirthday' });
        if (!validationResult.isValid) {
          setTimeout(() => scrollToErrorField(validationResult.firstErrorField), 100);
          return;
        }
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (isMomBookPersonalize && currentStep === 2) {
        const validationResult = form1Ref.current.validateForm({ scope: 'stepMomLove' });
        if (!validationResult.isValid) {
          setTimeout(() => scrollToErrorField(validationResult.firstErrorField), 100);
          return;
        }
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else if (formType === 'SINGLE2') {
      if (useForm3 && form3Ref.current) {
        const validationResult = form3Ref.current.validateForm({ scope: 'step1' });
        if (!validationResult.isValid) {
          setTimeout(() => scrollToErrorField(validationResult.firstErrorField), 100);
          return;
        }
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // SINGLE2（Form2）表单的处理逻辑：直接进入第二步
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleContinue = async () => {
    // 防止重复提交
    if (isSubmitting) return;

    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    if (formType === 'SINGLE1' && isBirthdayPersonalize && currentStep === 2) {
      handleNextStep();
      return;
    }
    if (formType === 'SINGLE1' && isMomBookPersonalize && currentStep === 2) {
      handleNextStep();
      return;
    }

    let fullName = '';
    let genderRaw: '' | 'boy' | 'girl' = '';
    let skinColorRaw = '';
    let hairstyleRaw = '';
    let hairColorRaw = '';
    let relationshipRaw: string | undefined;
    let photosData: string[] = [];
    let ageStageRaw: string | undefined;
    let fromWhomRaw = '';

    if (formType === 'SINGLE1' && form1Ref.current) {
      const validationResult = form1Ref.current.validateForm();
      if (!validationResult.isValid) {
        // 滚动到第一个错误字段
        setTimeout(() => scrollToErrorField(validationResult.firstErrorField), 100);
        return;
      }
      const f = form1Ref.current.getFormData();
      fullName = f.fullName;
      genderRaw = f.gender as any;
      skinColorRaw = f.skinColor;
      hairstyleRaw = f.hairstyle;
      hairColorRaw = f.hairColor;
      relationshipRaw = (f as any).relationship;
      photosData = (f as any).photos || [];
      ageStageRaw = f.ageStage;
      fromWhomRaw = String(f.fromWhom || '').trim();
    } else if (formType === 'SINGLE2' && (useForm3 ? !!form3Ref.current : !!form2Ref.current)) {
      const activeRef = useForm3 ? form3Ref : form2Ref;
      const validationResult = activeRef.current?.validateForm();
      if (!validationResult?.isValid) {
        setTimeout(() => scrollToErrorField(validationResult?.firstErrorField || null), 100);
        return;
      }
      const f = activeRef.current!.getFormData();
      fullName = f.fullName;
      genderRaw = f.gender as any;
      skinColorRaw = f.skinColor;
      hairstyleRaw = f.hairstyle;
      hairColorRaw = f.hairColor;
      relationshipRaw = (f as any).relationship;
      photosData = (f as any).photos || [];
      ageStageRaw = (f as any).ageStage;
      fromWhomRaw = String((f as any).fromWhom || '').trim();
    } else {
      return;
    }

    // 开始提交，设置 loading 状态
    setIsSubmitting(true);

    try {
      const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true' || mockParam === '1';
      if ((!photosData || photosData.length === 0) && FRONTEND_PREVIEW) {
        photosData = isMomBookPersonalize
          ? ['/personalize/face.png', '/personalize/face.png']
          : ['/personalize/face.png'];
      }

      const genderCode = genderRaw === 'boy' ? 1 : genderRaw === 'girl' ? 2 : 0;
      const skinColors = ['#FFE2CF', '#DCB593', '#665444'];
      const idx = skinColors.findIndex(c => c === skinColorRaw);
      const skinColorCode = idx >= 0 ? idx + 1 : 0; // 1..3
      const hairstyleCode = hairstyleRaw ? parseInt(hairstyleRaw.replace('hair_', '')) : 1;
      const hairColorMapping: Record<string, number> = { light: 1, brown: 2, dark: 3 };
      const hairColorCode = hairColorMapping[hairColorRaw] || 1;

      // Build backend attributes payload values
      const mapSkinToBackend = (hex: string): string => {
        const i = skinColors.findIndex(c => c === hex);
        if (i === 0) return 'white';
        if (i === 1) return 'original';
        if (i === 2) return 'black';
        return 'original';
      };
      const mapHairColorToBackend = (key: string | number): string => {
        const v = typeof key === 'number' ? key : ({ light: 1, brown: 2, dark: 3 } as any)[key] || 1;
        if (v === 1) return 'blone';
        // UI 中的 brown（v === 2）应回传 original
        if (v === 2) return 'original';
        if (v === 3) return 'dark';
        return 'dark';
      };
      const mapHairstyleToBackend = (code: number | string): string => {
        if (typeof code === 'number') return String(code);
        const m = String(code).replace('hair_', '');
        return m || '1';
      };
      
      if (!genderCode || !skinColorCode) {
        setIsSubmitting(false);
        return;
      }

      const ageStageBackend = mapAgeStageUiToBackend(ageStageRaw);

      const f1 = formType === 'SINGLE1' && form1Ref.current ? form1Ref.current.getFormData() : null;
      const birthDate = f1?.birthDate && !Number.isNaN(f1.birthDate.getTime()) ? f1.birthDate : null;
      const birthdayStr = birthDate ? formatBirthDateIso(birthDate) : undefined;
      const traitUiIds =
        isBirthdayPersonalize && Array.isArray(f1?.personalityTraitIds) ? f1!.personalityTraitIds! : [];
      const characterTraits =
        traitUiIds.length === 4 ? mapPersonalityTraitIdsToCharacterTraits(traitUiIds) : [];
      const characterTraitsOk = characterTraits.length === 4;

      const userData = {
        characters: [
          {
            full_name: fullName,
            language: searchParams.get('language') || 'en',
            // 为了兼容新后端校验，gender 使用 boy/girl 字符串，
            // gender_code 仅用于内部逻辑（如数值枚举）
            gender: genderRaw || '',
            gender_code: genderCode,
            relationship: relationshipRaw || undefined,
            // 赠送人/创作者姓名（书中 Created by）
            ...(fromWhomRaw ? { giver_name: fromWhomRaw } : {}),
            skincolor: skinColorCode,
            hairstyle: hairstyleCode,
            haircolor: hairColorCode,
            photo: (isMomBookPersonalize ? photosData[1] : photosData[0]) || '',
            photos: photosData,
            attributes: {
              skin_tone: mapSkinToBackend(skinColorRaw),
              hair_style: mapHairstyleToBackend(hairstyleCode),
              hair_color: mapHairColorToBackend(hairColorRaw || hairColorCode),
              ...(ageStageBackend ? { age_stage: ageStageBackend } : {}),
              ...(isBirthdayPersonalize && birthdayStr
                ? {
                    birthday: birthdayStr,
                    ...(characterTraitsOk ? { character_traits: characterTraits } : {}),
                  }
                : {}),
              ...(isMomBookPersonalize && f1
                ? {
                    mom_calls_me: String(f1.momCallsMe ?? '').trim(),
                    mom_makes_best: String(f1.momMakesBest ?? '').trim(),
                  }
                : {}),
              ...buildPicbookPreviewFacePayload(bookId || '', photosData).faceAttributes,
            },
          },
        ],
      };
      // Optionally compute SKU + price for downstream steps (not altering UI)
      if (rawApi && productSchema) {
        const selections: Record<string, string> = {
          language: (searchParams.get('language') || 'en') as string,
        };
        const resolved = resolveSkuPrice(rawApi, selections);
        if (resolved?.sku) localStorage.setItem('previewSkuCode', String(resolved.sku));
        localStorage.setItem('previewPrice', String(resolved.price));
      }
      // 使用全局内存状态存储，避免 localStorage 配额限制
      try {
        const { setUserData, setBookId } = usePreviewStore.getState();
        setUserData(userData);
        setBookId(bookId || '');
      } catch {}
      
      const qs = new URLSearchParams();
      const selectedLanguage = (searchParams.get('language') || 'en') as string;
      if (bookId) qs.set('bookid', bookId);
      if (selectedLanguage) qs.set('lang', selectedLanguage);
      if (isKs) qs.set('ks', '1');
      if (isKs && ksPackageItemId) qs.set('package_item_id', ksPackageItemId);
      if (isKs && ksPackageId) qs.set('package_id', ksPackageId);
      // 圣诞 bundle：把购物车子项 id 透传给 preview，用于 regenerate-preview 更新该子项
      const fromCartItemId = searchParams.get('fromCartItemId');
      if (fromCartItemId) qs.set('fromCartItemId', fromCartItemId);
      // 圣诞 bundle：preview 页面不展示 option tab
      const isHideOptions = searchParams.get('hideOptions') === '1';
      if (isHideOptions) qs.set('hideOptions', '1');
      // 购物车 create mode：在 preview 页不要预选 Options（封面/装订/礼盒）
      const skipPrefillOptions = searchParams.get('skipPrefillOptions') === '1';
      if (skipPrefillOptions) qs.set('skipPrefillOptions', '1');
      // 透传封面类型（圣诞 bundle：用于 preview 默认封面选择）
      const coverType = searchParams.get('cover_type');
      if (coverType) qs.set('cover_type', coverType);
      // 透传装订类型（圣诞 bundle：用于 preview 默认选中 binding）
      const bindingType = searchParams.get('binding_type');
      if (bindingType) qs.set('binding_type', bindingType);

      // 关键修复：从购物车的 bundle/占位条目（mode=create）进入 personalize 时，不应该在 preview 里再次新增一条购物车记录。
      // 做法：在此处先用 regenerate-preview 把生成的 preview 绑定到原 cart item，然后带 previewid 进入 preview 页。
      if (fromCartItemId && !isHideOptions) {
        try {
          const ch: any = (userData as any)?.characters?.[0] || {};
          const faceImages = (Array.isArray(ch?.photos) ? ch.photos : (ch?.photo ? [ch.photo] : [])).filter(Boolean);
          const fb = buildPicbookPreviewFacePayload(bookId || '', faceImages);
          const skinTone = ch?.attributes?.skin_tone || ch?.attributes?.skinTone;
          const skincolor =
            ch?.skincolor ??
            (skinTone === 'white' ? 1 : skinTone === 'original' ? 2 : skinTone === 'black' ? 3 : undefined);
          const payload: any = {
            picbook_id: bookId,
            face_images: fb.face_images,
            full_name: ch?.full_name || '',
            language: ch?.language || selectedLanguage || 'en',
            gender: ch?.gender || '',
            relationship: ch?.relationship || 'Parent/Guardian',
            ...(String(ch?.giver_name || ch?.created_by || '').trim()
              ? { giver_name: String(ch?.giver_name || ch?.created_by || '').trim() }
              : {}),
            skincolor,
            attributes: {
              ...(ch?.attributes || {}),
              ...fb.faceAttributes,
            },
          };

          const resp: any = await api.post<any>(
            `/cart/${encodeURIComponent(String(fromCartItemId))}/regenerate-preview`,
            payload
          );
          const responseData = resp?.data || {};
          const bid =
            responseData?.preview_batch_id ||
            responseData?.batch_id ||
            responseData?.preview_id ||
            resp?.preview_batch_id ||
            resp?.batch_id ||
            resp?.preview_id ||
            responseData?.batch?.batch_id ||
            responseData?.batch?.id ||
            resp?.batch?.batch_id ||
            resp?.batch?.id;
          if (bid) qs.set('previewid', String(bid));
          if (responseData?.reused_preview === true || resp?.reused_preview === true) qs.set('skipRender', '1');
        } catch (e) {
          console.error('[CartCreateFlow] regenerate-preview failed:', e);
          setIsSubmitting(false);
          return;
        }
      }
      router.push(`/preview?${qs.toString()}`);
    } catch (error) {
      console.error('Failed to continue:', error);
      // 发生错误时重置 loading 状态，允许用户重试
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <div className="relative flex items-center justify-between w-full sm:hidden">
          <Link href={`/books/${bookId}`} className="flex items-center text-gray-700 hover:text-blue-500">
            <IoIosArrowBack size={24} />
          </Link>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <span className="text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] font-medium text-center truncate max-w-[200px]">
              {bookName || 'Personalize'}
            </span>
          </div>
          <div className="w-6"></div>
        </div>
        <Link href={`/books/${bookId}`} className="hidden sm:flex items-center text-sm">
          <span className="mr-2">←</span> Back to the product page
        </Link>
      </div>

      <div className="mx-auto pb-20 md:pb-0">
        {isBirthdayPersonalize && formType === 'SINGLE1' && currentStep === 2 ? (
          <div className="text-center pt-3 md:pt-0 md:my-6 my-0">
            <h1 className="text-[22px] leading-[28px] md:text-[28px] md:leading-[36px] text-[#222222]">Bring them to life</h1>
            <p className="text-[#999999] text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] mt-2 max-w-xl mx-auto px-4">
              Tell us a little more — we&apos;ll turn it into their story.
            </p>
          </div>
        ) : isMomBookPersonalize && formType === 'SINGLE1' && currentStep === 2 ? (
          <h1 className="text-[22px] leading-[28px] md:text-[28px] md:leading-[36px] text-center pt-3 md:pt-0 md:my-6 my-0 text-[#222222]">
            From your child, with love
          </h1>
        ) : isMomBookPersonalize && formType === 'SINGLE1' && currentStep === 3 ? (
          <h1 className="text-[22px] leading-[28px] md:text-[28px] md:leading-[36px] text-center pt-3 md:pt-0 md:my-6 my-0 text-[#222222]">
            Upload photos of Mom and child
          </h1>
        ) : (
          <h1 className="text-[22px] leading-[28px] md:text-[28px] md:leading-[36px] text-center pt-3 md:pt-0 md:my-6 my-0">
            Tell Us About Your Child
          </h1>
        )}
        {formType === 'SINGLE1' ? (
          <SingleCharacterForm1
            ref={form1Ref}
            bookId={bookId}
            initialData={{
              skinColor: initials.skinColor,
              hairstyle: initials.hairstyle,
              hairColor: initials.hairColor,
            }}
            apiSkinToneValues={skinToneValues}
            apiHairStyleValues={hairStyleValues}
            apiHairColorValues={hairColorValues}
            uploadOptions={uploadOptions}
            assetSpuCode={personalizeAvatarAssetSpu}
            currentStep={currentStep}
            onCropperOpenChange={handleCropperOpenChange}
          />
        ) : (
          <>
            {useForm3 ? (
              <SingleCharacterForm3
                ref={form3Ref}
                bookId={bookId}
                initialData={{
                  skinColor: initials.skinColor,
                  hairstyle: initials.hairstyle,
                  hairColor: initials.hairColor,
                }}
                apiSkinToneValues={skinToneValues}
                apiHairStyleValues={hairStyleValues}
                apiHairColorValues={hairColorValues}
                uploadOptions={uploadOptions}
                assetSpuCode={personalizeAvatarAssetSpu}
                currentStep={currentStep}
                onCropperOpenChange={handleCropperOpenChange}
              />
            ) : (
              <SingleCharacterForm2
                ref={form2Ref}
                bookId={bookId}
                initialData={{
                  skinColor: initials.skinColor,
                  hairstyle: initials.hairstyle,
                  hairColor: initials.hairColor,
                }}
                apiSkinToneValues={skinToneValues}
                apiHairStyleValues={hairStyleValues}
                apiHairColorValues={hairColorValues}
                uploadOptions={uploadOptions}
                assetSpuCode={personalizeAvatarAssetSpu}
              />
            )}
          </>
        )}
        {/* 桌面端按钮 */}
        <div className="hidden md:flex justify-center">
          {(currentStep === 1 && (formType === 'SINGLE1' || (formType === 'SINGLE2' && useForm3))) ||
          (formType === 'SINGLE1' && isBirthdayPersonalize && currentStep === 2) ||
          (formType === 'SINGLE1' && isMomBookPersonalize && currentStep === 2) ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{ width: '220px' }}
              className="bg-black text-[#F5E3E3] py-3  text-[16px] leading-[24px] tracking-[0.5px] mb-16 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {formType === 'SINGLE1' && isBirthdayPersonalize && currentStep === 1
                ? 'Next Step (1/3)'
                : formType === 'SINGLE1' && isBirthdayPersonalize && currentStep === 2
                  ? 'Next Step (2/3)'
                  : formType === 'SINGLE1' && isMomBookPersonalize && currentStep === 1
                    ? 'Next Step (1/3)'
                    : formType === 'SINGLE1' && isMomBookPersonalize && currentStep === 2
                      ? 'Next Step (2/3)'
                      : 'Next Step (1/2)'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              style={{ width: '180px' }}
              className="bg-black text-[#F5E3E3] mb-16 py-3 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>
          )}
        </div>
      </div>
      {/* 手机端吸底按钮 */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#F8F8F8] z-50 md:hidden border-t border-gray-200 transition-transform duration-300 ${isAddingImage ? 'translate-y-full' : ''}`}>
        <div className="flex items-center justify-center h-[76px] px-[12px] py-[16px] gap-[10px]">
          {(currentStep === 1 && (formType === 'SINGLE1' || (formType === 'SINGLE2' && useForm3))) ||
          (formType === 'SINGLE1' && isBirthdayPersonalize && currentStep === 2) ||
          (formType === 'SINGLE1' && isMomBookPersonalize && currentStep === 2) ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-black text-[#F5E3E3] h-[44px] rounded hover:bg-gray-800 transition-colors text-[16px] leading-[24px] tracking-[0.5px] flex items-center justify-center gap-2"
            >
              {formType === 'SINGLE1' && isBirthdayPersonalize && currentStep === 1
                ? 'Next Step (1/3)'
                : formType === 'SINGLE1' && isBirthdayPersonalize && currentStep === 2
                  ? 'Next Step (2/3)'
                  : formType === 'SINGLE1' && isMomBookPersonalize && currentStep === 1
                    ? 'Next Step (1/3)'
                    : formType === 'SINGLE1' && isMomBookPersonalize && currentStep === 2
                      ? 'Next Step (2/3)'
                      : 'Next Step (1/2)'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="w-full bg-black text-[#F5E3E3] h-[44px] rounded hover:bg-gray-800 transition-colors text-[16px] leading-[24px] tracking-[0.5px] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#F5E3E3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



