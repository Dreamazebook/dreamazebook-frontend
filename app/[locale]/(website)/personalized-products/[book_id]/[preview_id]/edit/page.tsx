'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, usePathname, useRouter } from 'next/navigation';
import { IoIosArrowBack } from "react-icons/io";
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/api';
import { API_CART_LIST } from '@/constants/api';
import { CartItems } from '@/app/[locale]/(website)/shopping-cart/components/types';
import SingleCharacterForm1, { SingleCharacterForm1Handle } from '@/app/[locale]/(website)/components/personalize/SingleCharacterForm1';
import SingleCharacterForm2, { SingleCharacterForm2Handle } from '@/app/[locale]/(website)/components/personalize/SingleCharacterForm2';

interface ApiResponse<T=any> { success: boolean; code: number; message: string; data: T }
interface DetailedBook { character_count: number }

const skinColors = ['#FFE2CF', '#DCB593', '#665444'];

export default function EditPersonalizedProductPage() {
  const params = useParams();
  const qs = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const bookId = params.book_id as string;
  const previewId = Number(params.preview_id as string);
  const locale = pathname.split('/')[1] || 'en';

  const [formType, setFormType] = useState<'SINGLE1'|'SINGLE2'|'DOUBLE'|null>(null);
  const [initialData, setInitialData] = useState<any>();

  const form1Ref = useRef<SingleCharacterForm1Handle>(null);
  const form2Ref = useRef<SingleCharacterForm2Handle>(null);

  // 1) 根据 bookId 获取书籍信息，决定表单类型
  useEffect(() => {
    let ignore = false;
    const fetchBook = async () => {
      try {
        const { data } = await api.get<ApiResponse<DetailedBook>>(`/picbooks/${bookId}`);
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

  // 2) 解析 query 作为优先的初始值；否则用 previewId 从购物车拉取预览补全
  useEffect(() => {
    const qGender = qs.get('gender');
    const qSkin = qs.get('skin_color');
    const qPhoto = qs.get('photo_url');
    const qRecipientName = qs.get('recipient_name');

    if (qGender || qSkin || qPhoto || qRecipientName) {
      setInitialData({
        fullName: qRecipientName || '',
        gender: qGender === '1' ? 'boy' : qGender === '2' ? 'girl' : '',
        skinColor: qSkin ? skinColors[(parseInt(qSkin) - 1) || 0] : '',
        photo: qPhoto ? { path: qPhoto } : null,
      });
      return;
    }

    // fallback: 从购物车列表中查找 previewId
    (async () => {
      try {
        const { data } = await api.get<ApiResponse<CartItems>>(`${API_CART_LIST}`);
        const item = data.cart_items.find(ci => ci.preview_id === previewId);
        const p = item?.preview;
        if (!p) return;
        setInitialData({
          fullName: p.recipient_name || '',
          gender: p.gender === '1' ? 'boy' : p.gender === '2' ? 'girl' : '',
          skinColor: p.skin_color?.length ? skinColors[(p.skin_color[0] - 1) || 0] : '',
          photo: p.face_image ? { path: p.face_image } : null,
        });
      } catch {}
    })();
  }, [qs, previewId]);

  const renderForm = () => {
    if (!formType) return null;
    if (formType === 'SINGLE1') return <SingleCharacterForm1 ref={form1Ref} initialData={initialData} />;
    if (formType === 'SINGLE2') return <SingleCharacterForm2 ref={form2Ref} initialData={initialData} />;
    return <SingleCharacterForm1 ref={form1Ref} initialData={initialData} />;
  };

  const handleContinue = async () => {
    let fullName: string;
    let genderRaw: '' | 'boy' | 'girl';
    let skinColorRaw: string;
    let photoData: { file?: File; path: string } | null = null;

    if (formType === 'SINGLE1' && form1Ref.current) {
      const isValid = form1Ref.current.validateForm();
      if (!isValid) return;
      const form1 = form1Ref.current.getFormData();
      fullName = form1.fullName;
      genderRaw = form1.gender;
      skinColorRaw = form1.skinColor;
      photoData = form1.photo;
    } else if (formType === 'SINGLE2' && form2Ref.current) {
      const isValid = form2Ref.current.validateForm();
      if (!isValid) return;
      const form2 = form2Ref.current.getFormData();
      fullName = form2.fullName;
      genderRaw = form2.gender;
      skinColorRaw = form2.skinColor;
      photoData = form2.photo;
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

    const userData = {
      characters: [
        {
          full_name: fullName,
          language: locale,
          gender: genderCode,
          skincolor: skinColorCode,
          photo: photoData.path,
        },
      ],
    };
    localStorage.setItem('previewUserData', JSON.stringify(userData));
    localStorage.setItem('previewBookId', String(bookId));
    router.push(`/${locale}/personalized-products/${bookId}/${previewId}/preview`);
  };

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
        <Link href={`/shopping-cart`} className="hidden sm:flex items-center text-sm">
          <span className="mr-2">←</span> Back to shopping cart
        </Link>
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