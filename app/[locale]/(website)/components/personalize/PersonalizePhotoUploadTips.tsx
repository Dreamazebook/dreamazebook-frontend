'use client';

import React from 'react';
import Image from 'next/image';

export const PERSONALIZE_PHOTO_UPLOAD_PROMPT =
  'For the best result, please use photos that meet the following:';

export const PERSONALIZE_PHOTO_CONSENT_PREFIX =
  'I confirm I have permission to use these photos and agree to the';

export const PERSONALIZE_PHOTO_PRIVACY_DESKTOP =
  '🔒Secure & Private: Used solely for your preview and custom book.';

export const PERSONALIZE_PHOTO_PRIVACY_MOBILE = '🔒Private photos. Preview only.';

export const PERSONALIZE_PHOTO_GUIDELINES = [
  'High-quality photo',
  'Natural expression',
  'Face clearly visible',
  'Avoid hats or sunglasses',
] as const;

type PersonalizePhotoUploadTipsProps = {
  subtitle: string;
};

export default function PersonalizePhotoUploadTips({ subtitle }: PersonalizePhotoUploadTipsProps) {
  return (
    <>
      <div>
        <div className="mb-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 md:block">
            <h2 className="font-semibold text-[#222222] text-[16px] leading-[24px] tracking-[0.15px]">
              {subtitle}
            </h2>
            <p className="text-[#1E5651] font-semibold text-[12px] leading-[16px] tracking-[0.5px] md:hidden">
              {PERSONALIZE_PHOTO_PRIVACY_MOBILE}
            </p>
          </div>
          <p className="hidden md:block text-[#1E5651] font-semibold text-[12px] leading-[16px] tracking-[0.5px] mt-2">
            {PERSONALIZE_PHOTO_PRIVACY_DESKTOP}
          </p>
        </div>
        <p className="text-[#999999] text-[16px] leading-[24px] tracking-[0.5px] mb-4">
          {PERSONALIZE_PHOTO_UPLOAD_PROMPT}
        </p>
      </div>

      <div className="flex flex-row items-center gap-4 bg-[#F8F8F8] py-3 px-4 rounded-[4px]">
        <div className="flex-shrink-0 max-w-[102px] md:max-w-[80px]">
          <Image
            src="/personalize/face.png"
            alt="Example photo"
            width={200}
            height={200}
            className="w-full h-auto object-contain rounded-[4px] bg-gray-100"
            sizes="(max-width: 768px) 80px, 102px"
          />
        </div>
        <div className="flex-1 flex items-center">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[#666666] text-[14px] leading-[20px] tracking-[0.5px] w-full">
            {PERSONALIZE_PHOTO_GUIDELINES.map(item => (
              <li key={item} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
