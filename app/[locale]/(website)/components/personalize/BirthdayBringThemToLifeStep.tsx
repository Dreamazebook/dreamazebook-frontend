/** @jsxImportSource react */
'use client';

import React, { useEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FaHeart,BsCheck } from '@/utils/icons';
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
  /** 递增时触发「Select 4…」提示闪烁（用于 Next step 校验未选满） */
  traitsSelectHintFlashNonce?: number;
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
  traitsSelectHintFlashNonce = 0,
}) => {
  const traitsHintRef = useRef<HTMLParagraphElement>(null);
  const lastTraitsFlashNonce = useRef(0);

  const season: BirthSeason | null = birthDate ? getBirthSeasonFromDate(birthDate) : null;
  const turning = birthDate ? getTurningAgeOnNextBirthday(birthDate) : null;

  useEffect(() => {
    if (traitsSelectHintFlashNonce <= 0 || traitsSelectHintFlashNonce === lastTraitsFlashNonce.current) return;
    lastTraitsFlashNonce.current = traitsSelectHintFlashNonce;
    const el = traitsHintRef.current;
    if (!el) return;
    el.classList.remove('personality-traits-hint-flash');
    void el.offsetWidth;
    el.classList.add('personality-traits-hint-flash');
    const onEnd = () => el.classList.remove('personality-traits-hint-flash');
    el.addEventListener('animationend', onEnd, { once: true });
    const t = window.setTimeout(onEnd, 2200);
    return () => window.clearTimeout(t);
  }, [traitsSelectHintFlashNonce]);

  /* 标题与副标题在 personalize 页顶栏；此处与 BasicInfoForm 字段块对齐 */
  return (
    <div className="flex flex-col gap-3 md:gap-6">
      <div id="field-birthDate">
        <label className="block mb-2 font-medium text-[#222222]">Birth date</label>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={birthDate}
            maxDate={new Date()}
            onChange={newValue => onBirthDateChange(newValue)}
            slots={{ textField: TextField }}
            slotProps={{
              day: {
                sx: {
                  borderRadius: 0,

                  '&.Mui-selected': {
                    backgroundColor: '#FCF2F2!important',
                    border: '1px solid #222222',
                    color: '#222222',
                  },
                  '&:hover': {
                    backgroundColor: '#F8F8F8',
                  },
                  '&.MuiPickersDay-today': {},
                },
              },
            }}
          />
        </LocalizationProvider>
        {birthDate && season !== null && turning !== null && (
          <p className={`${HELPER} mt-2 mb-0`}>
            Turning <span>[{turning}]</span>
            <span className="mx-1">•</span>
            Born in{' '}
            <span>
              [{birthSeasonLabel(season)}] {birthSeasonEmoji(season)}
            </span>
          </p>
        )}
        {birthDateTouched && birthDateError && (
          <p className="text-red-500 text-sm mt-1">{birthDateError}</p>
        )}
      </div>

      <div id="field-personalityTraits">
        <label className="block font-medium text-[#222222]">Personality traits</label>
        <p ref={traitsHintRef} className={`${HELPER} mt-1 mb-3`}>
          Select 4 that best describe your child
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {BIRTHDAY_PERSONALITY_TRAITS.map((trait) => {
            const selected = selectedTraitIds.includes(trait.id);
            return (
              <button
                key={trait.id}
                type="button"
                onClick={() => onToggleTrait(trait.id)}
                className={`relative text-left rounded-[4px] border-1 px-[16px] py-[8px] min-h-[64px] ${
                  selected
                    ? 'border-[#000000] bg-[#FCF2F2]'
                    : 'border-transparent bg-[#F8F8F8]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selected && <FaHeart className="text-[#CF0F02] w-4 h-4" aria-hidden />}
                  <span className="text-[18px] tracking-[0.15px] font-medium text-[#222222]">
                    {trait.label}
                  </span>
                </div>
                {selected && (
                  <div className="text-[16px] tracking-[0.5px] font-normal text-[#666666]">{trait.description}</div>
                )}
                {selected && (
                  <span
                    className="absolute bottom-0 right-0 bg-black text-white flex items-center justify-center rounded-tl-[4px]"
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

export default BirthdayBringThemToLifeStep;
