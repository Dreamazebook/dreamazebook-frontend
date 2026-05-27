'use client';

import React from 'react';
import AvatarCanvas from './AvatarCanvas';
import { PERSONALIZE_AVATAR_PREVIEW_CAPTION } from './BasicInfoForm';
import { DAD_SKIN_TONE_OPTIONS } from './DadCustomizeStep';

type MomCustomizeStepProps = {
  bookId: string;
  momCallsMe: string;
  momMakesBest: string;
  momSkinColor: string;
  onMomCallsMeChange: (value: string) => void;
  onMomMakesBestChange: (value: string) => void;
  onMomSkinColorChange: (value: string) => void;
  momCallsMeError?: string;
  momMakesBestError?: string;
  momSkinColorError?: string;
  momCallsMeTouched?: boolean;
  momMakesBestTouched?: boolean;
  momSkinColorTouched?: boolean;
};

export default function MomCustomizeStep({
  bookId,
  momCallsMe,
  momMakesBest,
  momSkinColor,
  onMomCallsMeChange,
  onMomMakesBestChange,
  onMomSkinColorChange,
  momCallsMeError,
  momMakesBestError,
  momSkinColorError,
  momCallsMeTouched,
  momMakesBestTouched,
  momSkinColorTouched,
}: MomCustomizeStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center w-full overflow-hidden">
        <h2 className="w-full text-center font-semibold text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] mb-2">
          About Mom
        </h2>
        <AvatarCanvas
          bookId={bookId || 'PICBOOK_MOM'}
          skinColor={momSkinColor || '#FFE2CF'}
          hairstyle="hair_1"
          hairColor="light"
          role="mom"
          width={900}
          height={375}
        />
      </div>
      <p className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#999999]">
        {PERSONALIZE_AVATAR_PREVIEW_CAPTION}
      </p>

      <div id="field-momSkinColor">
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 md:gap-0">
          <label className="font-semibold text-[#222222] text-[16px] leading-[24px] tracking-[0.15px]">
            Skin tone
          </label>
          <div className="flex gap-6">
            {DAD_SKIN_TONE_OPTIONS.map(color => (
              <button
                key={color.value}
                type="button"
                aria-label={color.label}
                className={`w-8 h-8 rounded-full ${momSkinColor === color.value ? 'ring-4' : ''}`}
                style={{
                  backgroundColor: color.value,
                  ...(momSkinColor === color.value
                    ? {
                        boxShadow: `0 0 0 4px ${
                          color.label === 'Light' ? '#FFCDAC' : `${color.value}80`
                        }`,
                      }
                    : {}),
                }}
                onClick={() => onMomSkinColorChange(color.value)}
              />
            ))}
          </div>
        </div>
        {momSkinColorTouched && momSkinColorError && (
          <p className="text-red-500 text-sm mt-1">{momSkinColorError}</p>
        )}
      </div>

      <div id="field-momCallsMe">
        <label className="block font-semibold text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] mb-2">
          What sweet name does Mom call your child?
        </label>
        <input
          type="text"
          value={momCallsMe}
          onChange={e => onMomCallsMeChange(e.target.value)}
          placeholder="Examples: Sweetie, Peanut, Little Bear"
          className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded text-[#222222] text-[16px] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#012CCE]"
          autoComplete="off"
        />
        {momCallsMeTouched && momCallsMeError && (
          <p className="text-red-500 text-sm mt-1">{momCallsMeError}</p>
        )}
      </div>

      <div id="field-momMakesBest">
        <label className="block text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] mb-2">
          <span className="font-semibold">What is Mom best at?</span>
          <span className="font-normal text-[#999999]"> (1-3 words work best)</span>
        </label>
        <input
          type="text"
          value={momMakesBest}
          onChange={e => onMomMakesBestChange(e.target.value)}
          placeholder="Examples: giving hugs /pancakes/LEGO"
          className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded text-[#222222] text-[16px] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#012CCE]"
          autoComplete="off"
        />
        {momMakesBestTouched && momMakesBestError && (
          <p className="text-red-500 text-sm mt-1">{momMakesBestError}</p>
        )}
      </div>
    </div>
  );
}
