/** @jsxImportSource react */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';
import {
  getAgeStageMismatchHint,
  getPersonalizeAgeStagePolicy,
} from '@/utils/personalizeAgeStagePolicy';
import {
  PERSONALIZE_AGE_RANGE_0_3,
  PERSONALIZE_AGE_RANGE_3_6,
  PERSONALIZE_AGE_RANGE_6_PLUS,
} from '@/constants/cdn';
import HairstyleSelector from './HairstyleSelector';
import HairColorSelector from './HairColorSelector';
import AvatarCanvas from './AvatarCanvas';
//import UploadArea from './UploadArea';
//import useImageUpload from '../../hooks/useImageUpload';

export type AgeStage = '' | 'infant' | 'toddler' | 'preschooler' | 'early_school_age';

export interface BasicInfoData {
  fullName: string;
  gender: '' | 'boy' | 'girl';
  skinColor: string;
  hairstyle: string;
  hairColor: string;
  photo: { file?: File; path: string } | null;
  /** 年龄段（SingleCharacterForm1 / Form3 等） */
  ageStage?: AgeStage;
  /** 书中 “Created by” 显示名 */
  fromWhom?: string;
}

interface BasicInfoFormProps {
  data: BasicInfoData;
  errors: Partial<Record<keyof BasicInfoData, string>>;
  touched: Partial<Record<keyof BasicInfoData, boolean>>;
  onChange: (field: keyof BasicInfoData, value: string | { file?: File; path: string } | null) => void;
  // 用于更新指定字段的错误状态
  onErrorChange?: (field: keyof BasicInfoData, error: string) => void;
  // 书籍ID，用于获取发型图片
  bookId?: string;
  // Optional backend-driven values
  apiSkinToneValues?: string[]; // e.g. ["black","original","white"]
  apiHairStyleValues?: string[]; // e.g. ["1","2","3","4"]
  apiHairColorValues?: string[]; // e.g. ["blone","dark"]
  // Optional: override hairstyle icon assets spu code
  assetSpuCode?: string;
  /** 为 true 时不展示发型/发色选择器，由性别与肤色自动推导（用于 SingleCharacterForm1） */
  hideHairstyleAndHairColor?: boolean;
  /** 为 true 时在肤色下方展示 Age stage 与 From whom（SingleCharacterForm1） */
  showAgeStageAndFromWhom?: boolean;
}

const FORM1_AGE_OPTIONS: {
  value: Exclude<AgeStage, '' | 'toddler'>;
  title: string;
  image: string;
}[] = [
  { value: 'infant', title: 'Infant', image: PERSONALIZE_AGE_RANGE_0_3 },
  { value: 'preschooler', title: 'Preschooler', image: PERSONALIZE_AGE_RANGE_3_6 },
  { value: 'early_school_age', title: 'Early school age', image: PERSONALIZE_AGE_RANGE_6_PLUS },
];

const mapBackendHairToInternal = (val: string): 'light' | 'brown' | 'dark' => {
  const s = (val || '').toLowerCase();
  if (s === 'blone' || s === 'blonde' || s === 'light' || s === 'fair' || s === 'light_brown') return 'light';
  if (s === 'brown' || s === 'dark_brown' || s === 'original') return 'brown';
  if (s === 'dark' || s === 'black') return 'dark';
  return 'light';
};

/** 肤色（界面 hex）→ Avatar 使用的发色档位 */
const deriveHairColorFromSkin = (skinHex: string, apiHairColorValues?: string[]): 'light' | 'brown' | 'dark' => {
  const h = (skinHex || '').toLowerCase();
  let internal: 'light' | 'brown' | 'dark' = 'light';
  if (h === '#ffe2cf') internal = 'light';
  else if (h === '#dcb593') internal = 'brown';
  else if (h === '#665444') internal = 'dark';

  if (!apiHairColorValues || apiHairColorValues.length === 0) return internal;
  const allowed = new Set(apiHairColorValues.map(mapBackendHairToInternal));
  if (allowed.has(internal)) return internal;
  for (const c of ['light', 'brown', 'dark'] as const) {
    if (allowed.has(c)) return c;
  }
  return internal;
};

const getDefaultHairstyleForGender = (
  gender: 'boy' | 'girl',
  bookId: string,
  apiHairStyleValues?: string[]
): string => {
  const availableHairIds =
    apiHairStyleValues && apiHairStyleValues.length > 0
      ? Array.from(new Set(apiHairStyleValues.map(v => `hair_${String(v)}`)))
      : ['hair_1', 'hair_2', 'hair_3', 'hair_4'];

  const bid = String(bookId || '').trim().toUpperCase();
  const isGoodnight3 = bid === 'PICBOOK_GOODNIGHT3';
  const preferred = isGoodnight3
    ? (gender === 'boy' ? 'hair_4' : 'hair_1')
    : (gender === 'boy' ? 'hair_1' : 'hair_4');
  if (availableHairIds.includes(preferred)) return preferred;
  if (availableHairIds.includes('hair_1')) return 'hair_1';
  return availableHairIds[0] || preferred;
};

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  errors,
  touched,
  onChange,
  onErrorChange,
  bookId = '1', // 默认使用书籍ID 1
  apiSkinToneValues,
  apiHairStyleValues,
  apiHairColorValues,
  assetSpuCode,
  hideHairstyleAndHairColor = false,
  showAgeStageAndFromWhom = false,
}) => {
  const [showSkinColorTooltip, setShowSkinColorTooltip] = useState(false);
  const ageStagePolicy = getPersonalizeAgeStagePolicy(bookId);
  const ageStageMismatchHint =
    showAgeStageAndFromWhom ? getAgeStageMismatchHint(ageStagePolicy, data.ageStage) : null;
  // 图片上传相关的变量和函数已移至父组件 SingleCharacterForm1 和 SingleCharacterForm2
  /* 
  const {
    imageUrl,
    isUploading,
    uploadProgress,
    error: uploadError,
    isDragging,
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDeleteImage,
  } = useImageUpload();

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageUrl) {
      const img: HTMLImageElement = document.createElement('img');
      img.src = imageUrl;
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    }
  }, [imageUrl]);
  */

  // Skin tones: map backend labels to existing UI color circles while preserving UI
  const mapSkinToneToColor = (val: string) => {
    const s = (val || '').toLowerCase();
    if (s === 'white' || s === 'fair' || s === 'light') return { value: '#FFE2CF', label: 'Fair' };
    if (s === 'original' || s === 'medium' || s === 'tan') return { value: '#DCB593', label: 'Medium' };
    if (s === 'black' || s === 'dark') return { value: '#665444', label: 'Dark' };
    return { value: '#FFE2CF', label: 'Fair' };
  };

  const defaultSkinColors = [
    { value: '#FFE2CF', label: 'Fair' },
    { value: '#DCB593', label: 'Medium' },
    { value: '#665444', label: 'Dark' },
  ];

  const skinColors = (apiSkinToneValues && apiSkinToneValues.length > 0)
    ? Array.from(new Map(apiSkinToneValues.map(v => [mapSkinToneToColor(v).value, mapSkinToneToColor(v)])).values())
    : defaultSkinColors;

  // fullName 的 onChange 与 onBlur 处理
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    // 仅允许拉丁字母、空格、撇号与连字符
    const raw = input.value;
    const sanitized = raw.replace(/[^A-Za-z '\-]/g, '');
    // 长度限制：按 code point 计数
    const codePoints = Array.from(sanitized);
    let next = sanitized;
    if (codePoints.length > 13) {
      next = codePoints.slice(0, 13).join('');
      if (onErrorChange) onErrorChange('fullName', 'First name cannot exceed 13 Latin characters.');
    } else if (sanitized !== raw) {
      if (onErrorChange) onErrorChange('fullName', 'Only Latin letters, space, hyphen and apostrophe are allowed.');
    } else if (onErrorChange && errors.fullName) {
      onErrorChange('fullName', '');
    }
    onChange('fullName', next);
  };

  const handleFullNameBlur = () => {
    if (!data.fullName.trim()) {
      if (onErrorChange) onErrorChange('fullName', 'Please enter the first name');
    }
  };

  // gender 的 onChange 与 onBlur 处理
  const handleGenderChange = (value: 'boy' | 'girl') => {
    onChange('gender', value);
    if (onErrorChange) onErrorChange('gender', '');

    const nextHairstyle = getDefaultHairstyleForGender(value, bookId, apiHairStyleValues);
    onChange('hairstyle', nextHairstyle);
    if (onErrorChange) onErrorChange('hairstyle', '');
  };

  const handleGenderBlur = () => {
    if (!data.gender) {
      if (onErrorChange) onErrorChange('gender', 'Please select gender');
    }
  };

  // skinColor 的 onChange 与 onBlur 处理
  const handleSkinColorSelect = (colorValue: string) => {
    onChange('skinColor', colorValue);
    if (onErrorChange) onErrorChange('skinColor', '');
    if (hideHairstyleAndHairColor) {
      const nextHair = deriveHairColorFromSkin(colorValue, apiHairColorValues);
      onChange('hairColor', nextHair);
      if (onErrorChange) onErrorChange('hairColor', '');
    }
  };

  const handleSkinColorBlur = () => {
    if (!data.skinColor) {
      if (onErrorChange) onErrorChange('skinColor', 'Please select skin color');
    }
  };

  const handleAgeStageSelect = (value: AgeStage) => {
    onChange('ageStage', value);
    if (onErrorChange) onErrorChange('ageStage', '');
  };

  const handleFromWhomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextWhom = e.target.value.slice(0, 60);
    onChange('fromWhom', nextWhom);
    if (onErrorChange) onErrorChange('fromWhom', '');
  };

  const handleFromWhomBlur = () => {
    if (!String(data.fromWhom || '').trim()) {
      if (onErrorChange) onErrorChange('fromWhom', 'Please enter a name');
    }
  };

  // hairstyle 的 onChange 与 onBlur 处理
  const handleHairstyleSelect = (hairstyleValue: string) => {
    onChange('hairstyle', hairstyleValue);
    if (onErrorChange) onErrorChange('hairstyle', '');
  };

  const handleHairstyleBlur = () => {
    if (!data.hairstyle) {
      if (onErrorChange) onErrorChange('hairstyle', 'Please select hairstyle');
    }
  };

  // hairColor 的 onChange 与 onBlur 处理
  const handleHairColorSelect = (hairColorValue: string) => {
    onChange('hairColor', hairColorValue);
    if (onErrorChange) onErrorChange('hairColor', '');
  };

  const handleHairColorBlur = () => {
    if (!data.hairColor) {
      if (onErrorChange) onErrorChange('hairColor', 'Please select hair color');
    }
  };

  // 隐藏发型/发色，与肤色、性别保持派生值一致
  useEffect(() => {
    if (!hideHairstyleAndHairColor) return;
    const nextHair = deriveHairColorFromSkin(data.skinColor, apiHairColorValues);
    if (nextHair !== data.hairColor) {
      onChange('hairColor', nextHair);
      if (onErrorChange) onErrorChange('hairColor', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅在肤色/发色不一致时同步，避免把不稳定的 onChange 放进依赖
  }, [hideHairstyleAndHairColor, data.skinColor, apiHairColorValues, data.hairColor]);

  useEffect(() => {
    if (!hideHairstyleAndHairColor) return;
    if (data.gender !== 'boy' && data.gender !== 'girl') return;
    const nextStyle = getDefaultHairstyleForGender(data.gender, bookId, apiHairStyleValues);
    if (nextStyle !== data.hairstyle) {
      onChange('hairstyle', nextStyle);
      if (onErrorChange) onErrorChange('hairstyle', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideHairstyleAndHairColor, data.gender, data.hairstyle, bookId, apiHairStyleValues]);

  // photo 的 onChange（文件上传通常不使用 onBlur，此处仅在 onChange 后清除错误）
  // const handleUploadPhoto = (file: File) => {
  //   onChange('photo', { file, path: '' });
  //   if (onErrorChange) onErrorChange('photo', '');
  // };

  return (
    <div className="flex flex-col gap-3 md:gap-6">
      {/* 预览图 */}
      <div className="flex justify-center -mt-6 -mb-3 md:-mt-0 md:-mb-0 w-full overflow-hidden">
        <AvatarCanvas
          bookId={bookId}
          skinColor={data.skinColor || '#FFE2CF'}
          hairstyle={data.hairstyle || 'hair_1'}
          hairColor={data.hairColor || 'light'}
          gender={data.gender}
          width={900}
          height={375}
        />
      </div>
      <p className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#999999]">
        Customize a look close to your child — we'll tailor every detail with their photo later.
      </p>

      {/* First name */}
      <div id="field-fullName">
        <label className="block font-medium">First name</label>
        <input
          type="text"
          placeholder="please enter..."
          className="w-full p-2 border border-[#E5E5E5] rounded"
          value={data.fullName}
          onChange={handleFullNameChange}
          onBlur={handleFullNameBlur}
          // 仅允许拉丁字符
          inputMode="text"
          pattern="[A-Za-z '\-]{1,13}"
          title="Use Latin letters, spaces, hyphen (-) and apostrophe (') only"
        />
        {touched.fullName && errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* Gender */}
      <div id="field-gender">
        <div className="flex items-center flex-col items-start gap-2 md:gap-0 md:flex-row md:justify-between">
          <label className="font-medium">Choose their character</label>
          <div className="flex gap-4" onBlur={handleGenderBlur} tabIndex={0}>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="boy"
                checked={data.gender === 'boy'}
                onChange={() => handleGenderChange('boy')}
                className="hidden"
              />
              <div
                className={`w-6 h-6 rounded-full border-2 mr-2 flex items-center justify-center ${
                  data.gender === 'boy' ? 'border-[#012CCE] bg-[#012CCE]' : 'border-gray-300'
                }`}
              >
                {data.gender === 'boy' && <FaCheck className="w-3 h-3 text-white" />}
              </div>
              Boy
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={data.gender === 'girl'}
                onChange={() => handleGenderChange('girl')}
                className="hidden"
              />
              <div
                className={`w-6 h-6 rounded-full border-2 mr-2 flex items-center justify-center ${
                  data.gender === 'girl' ? 'border-[#012CCE] bg-[#012CCE]' : 'border-gray-300'
                }`}
              >
                {data.gender === 'girl' && <FaCheck className="w-3 h-3 text-white" />}
              </div>
              Girl
            </label>
          </div>
        </div>
        {touched.gender && errors.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
        )}
      </div>

      {/* Skin color */}
      <div id="field-skinColor">
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2 md:gap-0" tabIndex={0} onBlur={handleSkinColorBlur}>
          <div className="flex flex-col">
            <div className="flex items-center">
              <label className="font-medium">Skin color</label>
              <span className="text-gray-400 inline-flex items-center group relative font-normal ml-2">
                <div 
                  className="w-4 h-4 rounded-full border border-[#666666] flex items-center justify-center cursor-pointer"
                  onClick={() => setShowSkinColorTooltip(!showSkinColorTooltip)}
                >
                  <span className="text-[#666666] text-[10px] leading-none font-medium">?</span>
                </div>
                <div className={`${showSkinColorTooltip ? 'block' : 'hidden'} md:group-hover:block absolute left-1/2 transform -translate-x-1/2 bottom-6 w-64 p-2 bg-white text-gray-800 text-sm rounded shadow-lg z-10 backdrop-blur`}>
                  <p>
                    For reference only, the final look will reflect your child's photo.
                  </p>
                  {/* 箭头 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              </span>
            </div>
          </div>
          <div className="flex gap-6">
            {skinColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-8 h-8 rounded-full ${data.skinColor === color.value ? 'ring-4' : ''}`}
                style={{
                  backgroundColor: color.value,
                  ...(data.skinColor === color.value
                    ? { boxShadow: `0 0 0 4px ${color.label === 'Fair' ? '#FFCDAC' : color.value + '80'}` }
                    : {}),
                }}
                onClick={() => handleSkinColorSelect(color.value)}
              />
            ))}
          </div>
        </div>
        {touched.skinColor && errors.skinColor && (
          <p className="text-red-500 text-sm mt-1">{errors.skinColor}</p>
        )}
      </div>

      {/* Age stage + From whom（仅 SingleCharacterForm1 开启） */}
      {showAgeStageAndFromWhom && (
        <>
          <div id="field-ageStage">
            <label className="block font-medium text-[#222222]">Age stage</label>
            <p className="text-[#999999] text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] mt-1 mb-3">
              Choose the age range this story is made for.
            </p>
            <div className="flex gap-2 sm:gap-3 w-full" tabIndex={0}>
              {FORM1_AGE_OPTIONS.map((opt) => {
                const selected = data.ageStage === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAgeStageSelect(opt.value)}
                    className={`flex-1 min-w-0 flex flex-col items-center rounded-[4px] border-1 bg-[#F5F5F7] p-2 transition-colors ${
                      selected ? 'border-[#012CCE] bg-transparent' : 'border-transparent bg-[#F5F5F7]'
                    }`}
                  >
                    <div className="relative w-full max-w-[170px] aspect-[6/5] mx-auto mb-2">
                      <Image src={opt.image} alt="" fill className="object-contain" sizes="108px" />
                    </div>
                    <span className="text-[16px] tracking-[0.5px] sm:text-[14px] text-[#222222] text-center leading-[24px]">{opt.title}</span>
                  </button>
                );
              })}
            </div>
            {ageStageMismatchHint && (
              <div className="px-3 py-2.5 text-[14px] leading-[20px] text-[#444444]">
                <p className="font-medium text-[#222222]">
                  <span aria-hidden>⭐</span> {ageStageMismatchHint.headline}
                </p>
                <p className="mt-1 text-[#666666]">{ageStageMismatchHint.detail}</p>
              </div>
            )}
            {touched.ageStage && errors.ageStage && (
              <p className="text-red-500 text-sm mt-2">{errors.ageStage}</p>
            )}
          </div>

          <div id="field-fromWhom">
            <label className="block font-medium text-[#222222]">From whom</label>
            <p className="text-[#999999] text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] mt-1 mb-2">
              This will appear as Created by inside the book.
            </p>
            <input
              type="text"
              placeholder="please enter..."
              className="w-full p-2 border border-[#E5E5E5] rounded text-[#222222] placeholder:text-[#BBBBBB]"
              value={data.fromWhom ?? ''}
              onChange={handleFromWhomChange}
              onBlur={handleFromWhomBlur}
              maxLength={60}
            />
            {touched.fromWhom && errors.fromWhom && (
              <p className="text-red-500 text-sm mt-1">{errors.fromWhom}</p>
            )}
          </div>
        </>
      )}

      {/* Hairstyle - 某些书籍隐藏（如 bookId === '5'）；SingleCharacterForm1 可通过 hideHairstyleAndHairColor 隐藏 */}
      {!hideHairstyleAndHairColor && bookId !== '5' && (
        <div id="field-hairstyle">
          <HairstyleSelector
            bookId={bookId}
            selectedHairstyle={data.hairstyle}
            onChange={handleHairstyleSelect}
            onBlur={handleHairstyleBlur}
            error={errors.hairstyle}
            touched={touched.hairstyle}
            hairStyleValues={apiHairStyleValues}
            assetSpuCode={assetSpuCode}
            currentHairColor={data.hairColor}
          />
        </div>
      )}

      {/* Hair Color - 某些书籍隐藏（如 bookId === '5'） */}
      {!hideHairstyleAndHairColor && bookId !== '5' && (
        <div id="field-hairColor">
          <HairColorSelector
            selectedHairColor={data.hairColor}
            onChange={handleHairColorSelect}
            onBlur={handleHairColorBlur}
            error={errors.hairColor}
            touched={touched.hairColor}
            hairColorValues={apiHairColorValues}
          />
        </div>
      )}

      {/* Photo Upload
      <div>
        <label className="block mb-2 flex items-center">
          <span className="font-medium">Photo</span>
          <span className="text-gray-400 inline-flex items-center group relative font-normal">
            <FaQuestionCircle className="w-4 h-4 ml-1" />
            <div className="hidden group-hover:block absolute left-0 top-6 w-64 p-2 bg-white/80 text-gray-800 text-sm rounded shadow-lg z-10 backdrop-blur">
              <p className="mb-2">
                Upload a photo so we can create a unique image of you. Your privacy is ensured.
              </p>
            </div>
          </span>
        </label>
        <p className="text-sm mb-2 text-gray-800">Please upload a photo of your character!</p>
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
          <UploadArea
            imageUrl={imageUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            error={uploadError}
            isDragging={isDragging}
            imageSize={imageSize}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDragOver={handleDragOver}
            handleDrop={(e) => handleDrop(e, (file) => handleUploadPhoto(file))}
            handleFileUpload={(e) => handleFileUpload(e, (file) => handleUploadPhoto(file))}
            handleDeleteImage={() => {
              handleDeleteImage();
              onChange('photo', null);
              if (onErrorChange) onErrorChange('photo', 'Please upload a photo');
            }}
          />
          {touched.photo && errors.photo && (
            <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default BasicInfoForm;
