'use client';

import React from 'react';
import AvatarCanvas from './AvatarCanvas';
import { PERSONALIZE_AVATAR_PREVIEW_CAPTION } from './BasicInfoForm';
import type { DadQuestionConfig } from '@/utils/dadPersonalizeHelpers';

export const DAD_SKIN_TONE_OPTIONS = [
  { value: '#FFE2CF', label: 'Light' },
  { value: '#DCB593', label: 'Medium' },
  { value: '#665444', label: 'Dark' },
] as const;

type DadCustomizeStepProps = {
  bookId: string;
  dadTitle: string;
  dadSkinColor: string;
  dadQuestions?: DadQuestionConfig[];
  dadQuestionAnswers: Record<string, string>;
  onDadTitleChange: (value: string) => void;
  onDadSkinColorChange: (value: string) => void;
  onDadQuestionChange: (attributeName: string, value: string) => void;
  dadTitleError?: string;
  dadSkinColorError?: string;
  dadTitleTouched?: boolean;
  dadSkinColorTouched?: boolean;
  dadQuestionErrors?: Record<string, string>;
  dadQuestionTouched?: Record<string, boolean>;
};

export default function DadCustomizeStep({
  bookId,
  dadTitle,
  dadSkinColor,
  dadQuestions = [],
  dadQuestionAnswers,
  onDadTitleChange,
  onDadSkinColorChange,
  onDadQuestionChange,
  dadTitleError,
  dadSkinColorError,
  dadTitleTouched,
  dadSkinColorTouched,
  dadQuestionErrors,
  dadQuestionTouched,
}: DadCustomizeStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center w-full overflow-hidden">
        <h2 className="w-full text-center font-semibold text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] mb-2">
          About Dad
        </h2>
        <AvatarCanvas
          bookId={bookId || 'PICBOOK_DAD'}
          skinColor={dadSkinColor || '#FFE2CF'}
          hairstyle="hair_1"
          hairColor="light"
          role="dad"
          width={900}
          height={375}
        />
      </div>
      <p className="text-[14px] leading-[20px] tracking-[0.25px] md:text-[16px] md:leading-[24px] md:tracking-[0.5px] text-[#999999]">
        {PERSONALIZE_AVATAR_PREVIEW_CAPTION}
      </p>

      <div id="field-dadSkinColor">
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
                className={`w-8 h-8 rounded-full ${dadSkinColor === color.value ? 'ring-4' : ''}`}
                style={{
                  backgroundColor: color.value,
                  ...(dadSkinColor === color.value
                    ? {
                        boxShadow: `0 0 0 4px ${
                          color.label === 'Light' ? '#FFCDAC' : `${color.value}80`
                        }`,
                      }
                    : {}),
                }}
                onClick={() => onDadSkinColorChange(color.value)}
              />
            ))}
          </div>
        </div>
        {dadSkinColorTouched && dadSkinColorError && (
          <p className="text-red-500 text-sm mt-1">{dadSkinColorError}</p>
        )}
      </div>

      <div id="field-dadTitle">
        <label className="block font-semibold text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] mb-2">
          What do they call Dad?
        </label>
        <input
          type="text"
          value={dadTitle}
          onChange={e => onDadTitleChange(e.target.value)}
          placeholder="Examples: Dad, Papa, Daddy"
          className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded text-[#222222] text-[16px] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#012CCE]"
          autoComplete="off"
        />
        {dadTitleTouched && dadTitleError && (
          <p className="text-red-500 text-sm mt-1">{dadTitleError}</p>
        )}
      </div>

      {dadQuestions.map(q => (
        <div key={q.attribute_name} id={`field-${q.attribute_name}`}>
          <label className="block text-[#222222] text-[16px] leading-[24px] tracking-[0.15px] mb-1">
            <span className="font-semibold">{q.question}</span>
            <span className="font-normal text-[#999999]"> ({q.max_length} characters max)</span>
          </label>
          {q.example_answer ? (
            <p className="text-[#999999] text-[14px] leading-[20px] mb-2">
              {q.example_answer.startsWith('Examples:') ? q.example_answer : `Examples: ${q.example_answer}`}
            </p>
          ) : null}
          <input
            type="text"
            value={dadQuestionAnswers[q.attribute_name] ?? ''}
            maxLength={q.max_length}
            onChange={e => onDadQuestionChange(q.attribute_name, e.target.value.slice(0, q.max_length))}
            className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded text-[#222222] text-[16px] focus:outline-none focus:border-[#012CCE]"
            autoComplete="off"
          />
          {dadQuestionTouched?.[q.attribute_name] && dadQuestionErrors?.[q.attribute_name] && (
            <p className="text-red-500 text-sm mt-1">{dadQuestionErrors[q.attribute_name]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
