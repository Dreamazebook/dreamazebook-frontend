/** @jsxImportSource react */
'use client';

import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { BsCheck } from 'react-icons/bs';
import {
  BIRTHDAY_PERSONALITY_TRAITS,
  birthSeasonEmoji,
  birthSeasonLabel,
  getBirthSeasonFromDate,
  getTurningAgeOnNextBirthday,
  type BirthSeason,
} from '@/utils/birthdayPersonalizeHelpers';

export type { BirthdayPersonalityTraitId } from '@/utils/birthdayPersonalizeHelpers';
export { BIRTHDAY_PERSONALITY_TRAITS };

const HELPER =
  'text-[#999999] text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px]';

export interface BirthdayBringThemToLifeStepProps {
  birthDate: Date | null;
  onBirthDateChange: (value: Date | null) => void;
  selectedTraitIds: string[];
  onToggleTrait: (id: string) => void;
  birthDateError?: string;
  traitsError?: string;
  birthDateTouched?: boolean;
  traitsTouched?: boolean;
}

const BirthdayBringThemToLifeStep: React.FC<BirthdayBringThemToLifeStepProps> = ({
  birthDate,
  onBirthDateChange,
  selectedTraitIds,
  onToggleTrait,
  birthDateError,
  traitsError,
  birthDateTouched,
  traitsTouched,
}) => {
  const season: BirthSeason | null = birthDate ? getBirthSeasonFromDate(birthDate) : null;
  const turning = birthDate ? getTurningAgeOnNextBirthday(birthDate) : null;

  const dateInputValue =
    birthDate && !Number.isNaN(birthDate.getTime())
      ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`
      : '';

  /* 标题与副标题在 personalize 页顶栏；此处与 BasicInfoForm 字段块对齐 */
  return (
    <div className="flex flex-col gap-3 md:gap-6">
      <div id="field-birthDate">
        <label className="block font-medium text-[#222222]">Birth date</label>
        <input
          type="date"
          className="w-full p-2 border border-[#E5E5E5] rounded text-[#222222] bg-white placeholder:text-[#BBBBBB] focus:outline-none focus:border-[#012CCE]"
          value={dateInputValue}
          max={formatMaxDate()}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              onBirthDateChange(null);
              return;
            }
            const [y, m, d] = v.split('-').map(Number);
            onBirthDateChange(new Date(y, m - 1, d));
          }}
        />
        {birthDate && season !== null && turning !== null && (
          <p className={`${HELPER} mt-2 mb-0`}>
            Turning <span className="text-[#222222] font-medium">{turning}</span>
            <span className="mx-1">•</span>
            Born in{' '}
            <span className="text-[#222222] font-medium">
              {birthSeasonLabel(season)} {birthSeasonEmoji(season)}
            </span>
          </p>
        )}
        {birthDateTouched && birthDateError && (
          <p className="text-red-500 text-sm mt-1">{birthDateError}</p>
        )}
      </div>

      <div id="field-personalityTraits">
        <label className="block font-medium text-[#222222]">Personality traits</label>
        <p className={`${HELPER} mt-1 mb-3`}>Select 4 that best describe your child</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {BIRTHDAY_PERSONALITY_TRAITS.map((trait) => {
            const selected = selectedTraitIds.includes(trait.id);
            return (
              <button
                key={trait.id}
                type="button"
                onClick={() => onToggleTrait(trait.id)}
                className={`relative text-left rounded-lg border-2 bg-[#F8F8F8] px-2 pt-3 pb-3 min-h-[88px] transition-colors ${
                  selected ? 'border-[#012CCE]' : 'border-transparent'
                }`}
              >
                {selected && <FaHeart className="text-[#E85A5A] w-4 h-4 mb-1" aria-hidden />}
                <div className="text-[13px] sm:text-[14px] font-medium leading-tight text-[#222222]">
                  {trait.label}
                </div>
                {selected && (
                  <div className="text-[12px] text-[#666666] mt-1 leading-snug">{trait.description}</div>
                )}
                {selected && (
                  <span
                    className="absolute bottom-2 right-2 bg-black text-white flex items-center justify-center rounded-sm"
                    style={{ width: '20px', height: '16px' }}
                  >
                    <BsCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {traitsTouched && traitsError && <p className="text-red-500 text-sm mt-2">{traitsError}</p>}
      </div>
    </div>
  );
};

function formatMaxDate(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

export default BirthdayBringThemToLifeStep;
