'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, Link, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { IoIosArrowBack } from 'react-icons/io';
import api from '@/utils/api';
import SingleCharacterForm1, { SingleCharacterForm1Handle } from '../components/personalize/SingleCharacterForm1';
import SingleCharacterForm2, { SingleCharacterForm2Handle } from '../components/personalize/SingleCharacterForm2';
import { buildProductSchema, extractFieldOptions, resolveSkuPrice } from '@/utils/productAdapter';

type AttributeOption = { value: string; label?: string; is_default?: boolean; price_diff?: number | string };
type Attribute = { name: string; options: AttributeOption[]; default?: string };

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
  const isKs = searchParams.get('ks') === '1';
  const ksPackageItemId = searchParams.get('package_item_id') || '';
  const ksPackageId = searchParams.get('package_id') || '';
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState<'SINGLE1' | 'SINGLE2'>('SINGLE1');

  const [skinToneValues, setSkinToneValues] = useState<string[] | undefined>(undefined);
  const [hairStyleValues, setHairStyleValues] = useState<string[] | undefined>(undefined);
  const [hairColorValues, setHairColorValues] = useState<string[] | undefined>(undefined);

  const [initials, setInitials] = useState<{ skinColor?: string; hairstyle?: string; hairColor?: string }>({});
  const [productSchema, setProductSchema] = useState<any>(null);
  const [rawApi, setRawApi] = useState<any>(null);
  const [uploadOptions, setUploadOptions] = useState<{ allowedTypes?: string[]; maxFileSize?: number; maxImages?: number } | undefined>(undefined);

  const form1Ref = useRef<SingleCharacterForm1Handle>(null);
  const form2Ref = useRef<SingleCharacterForm2Handle>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true' || mockParam === '1';
      try {
        if (FRONTEND_PREVIEW) {
          // 预览模式
          setFormType(bookId === '2' ? 'SINGLE2' : 'SINGLE1');
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
          const cfg = product?.customization_config || {};
          const allowed = ['image/jpeg','image/png','image/jpg','image/webp'];
          const maxSize = 20 * 1024 * 1024; // 20MB
          const maxFiles = typeof cfg?.max_face_images === 'number' ? cfg.max_face_images : 3;
          setUploadOptions({ allowedTypes: allowed, maxFileSize: maxSize, maxImages: maxFiles });
        } catch {}
      } catch (e) {
        setFormType(bookId === '2' ? 'SINGLE2' : 'SINGLE1');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [bookId, locale, mockParam]);

  const handleContinue = async () => {
    let fullName = '';
    let genderRaw: '' | 'boy' | 'girl' = '';
    let skinColorRaw = '';
    let hairstyleRaw = '';
    let hairColorRaw = '';
    let photosData: string[] = [];

    if (formType === 'SINGLE1' && form1Ref.current) {
      const isValid = form1Ref.current.validateForm();
      if (!isValid) return;
      const f = form1Ref.current.getFormData();
      fullName = f.fullName; genderRaw = f.gender as any; skinColorRaw = f.skinColor; hairstyleRaw = f.hairstyle; hairColorRaw = f.hairColor; photosData = (f as any).photos || [];
    } else if (formType === 'SINGLE2' && form2Ref.current) {
      const isValid = form2Ref.current.validateForm();
      if (!isValid) return;
      const f = form2Ref.current.getFormData();
      fullName = f.fullName; genderRaw = f.gender as any; skinColorRaw = f.skinColor; hairstyleRaw = f.hairstyle; hairColorRaw = f.hairColor; photosData = [];
    } else {
      return;
    }

    const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true' || mockParam === '1';
    if ((!photosData || photosData.length === 0) && FRONTEND_PREVIEW) {
      photosData = ['/personalize/face.png'];
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
      if (v === 3) return 'dark';
      return 'dark';
    };
    const mapHairstyleToBackend = (code: number | string): string => {
      if (typeof code === 'number') return String(code);
      const m = String(code).replace('hair_', '');
      return m || '1';
    };
    if (!genderCode || !skinColorCode) return;

    const userData = {
      characters: [
        {
          full_name: fullName,
          language: searchParams.get('language') || 'en',
          gender: genderCode,
          skincolor: skinColorCode,
          hairstyle: hairstyleCode,
          haircolor: hairColorCode,
          photo: photosData[0] || '',
          photos: photosData,
          attributes: {
            skin_tone: mapSkinToBackend(skinColorRaw),
            hair_style: mapHairstyleToBackend(hairstyleCode),
            hair_color: mapHairColorToBackend(hairColorRaw || hairColorCode),
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
    localStorage.setItem('previewUserData', JSON.stringify(userData));
    localStorage.setItem('previewBookId', bookId || '');
    const qs = new URLSearchParams();
    const selectedLanguage = (searchParams.get('language') || 'en') as string;
    if (bookId) qs.set('bookid', bookId);
    if (selectedLanguage) qs.set('lang', selectedLanguage);
    if (isKs) qs.set('ks', '1');
    if (isKs && ksPackageItemId) qs.set('package_item_id', ksPackageItemId);
    if (isKs && ksPackageId) qs.set('package_id', ksPackageId);
    router.push(`/preview?${qs.toString()}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="h-14 bg-white flex items-center px-4 sm:px-32">
        <div className="flex items-center justify-between w-full sm:hidden">
          <Link href={`/books/${bookId}`} className="flex items-center text-gray-700 hover:text-blue-500">
            <IoIosArrowBack size={24} />
          </Link>
          <Link href="/" className="flex items-center justify-center flex-grow p-2">
            <Image src="/logo.png" alt="Home" width={115} height={40} priority className="w-[114.29px] h-[40px]" />
          </Link>
        </div>
        <Link href={`/books/${bookId}`} className="hidden sm:flex items-center text-sm">
          <span className="mr-2">←</span> Back to the product page
        </Link>
      </div>

      <div className="mx-auto">
        <h1 className="text-2xl text-center my-6">Please fill in the basic information</h1>
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
            assetSpuCode={'PICBOOK_GOODNIGHT2'}
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
            assetSpuCode={'PICBOOK_GOODNIGHT2'}
          />
        )}
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



