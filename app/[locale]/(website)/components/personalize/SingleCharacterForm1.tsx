/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import BasicInfoForm, { BasicInfoData } from './BasicInfoForm';
import MultiImageUpload from './MultiImageUpload';
import useMultiImageUpload from '../../hooks/useMultiImageUpload';
import GiverAvatarCropper from '../../preview/components/GiverAvatarCropper';
import BirthdayBringThemToLifeStep from './BirthdayBringThemToLifeStep';
import { isPicbookBirthday } from '@/utils/isPicbookBirthday';
import { getDefaultAgeStageForPersonalize } from '@/utils/personalizeAgeStagePolicy';
import { parseBirthDateIso } from '@/utils/birthdayPersonalizeHelpers';

const BIRTHDAY_TRAITS_REQUIRED = 4;

export interface PersonalizeFormData extends BasicInfoData {
  photos: string[];
  relationship?: string;
  consent?: boolean;
  /** PICBOOK_BIRTHDAY：生日与特质 */
  birthDate?: Date | null;
  personalityTraitIds?: string[];
}

export interface SingleCharacterForm1Handle {
  validateForm: (options?: { scope?: 'step1' | 'stepBirthday' | 'all' }) => {
    isValid: boolean;
    firstErrorField: string | null;
  };
  formData: PersonalizeFormData;
  getFormData: () => PersonalizeFormData;
  isCropperOpen: boolean;
}

interface FormErrors {
  fullName?: string;
  gender?: string;
  skinColor?: string;
  ageStage?: string;
  fromWhom?: string;
  hairstyle?: string;
  hairColor?: string;
  photo?: string;
  relationship?: string;
  consent?: string;
  birthDate?: string;
  personalityTraits?: string;
}

interface SingleCharacterForm1Props {
  initialData?: {
    fullName?: string;
    gender?: '' | 'boy' | 'girl';
    skinColor?: string;
    hairstyle?: string;
    hairColor?: string;
    ageStage?: BasicInfoData['ageStage'];
    fromWhom?: string;
    photo?: { path: string } | null;
    photos?: string[];
    birthDate?: string;
    personalityTraitIds?: string[];
  };
  bookId?: string;
  defaultConsentChecked?: boolean;
  apiSkinToneValues?: string[];
  apiHairStyleValues?: string[];
  apiHairColorValues?: string[];
  uploadOptions?: {
    allowedTypes?: string[];
    maxFileSize?: number;
    maxImages?: number;
  };
  assetSpuCode?: string;
  currentStep?: number;
  onCropperOpenChange?: (isOpen: boolean) => void;
}

const SingleCharacterForm1 = forwardRef<SingleCharacterForm1Handle, SingleCharacterForm1Props>(
  (
    {
      initialData,
      bookId = '1',
      defaultConsentChecked = false,
      apiSkinToneValues,
      apiHairStyleValues,
      apiHairColorValues,
      uploadOptions,
      assetSpuCode,
      currentStep = 1,
      onCropperOpenChange,
    },
    ref
  ) => {
    const isBirthdayBook = isPicbookBirthday(bookId);
    const photoStep = isBirthdayBook ? 3 : 2;

    const [formData, setFormData] = useState<PersonalizeFormData>({
      fullName: initialData?.fullName ?? '',
      gender: initialData?.gender ?? '',
      skinColor: initialData?.skinColor ?? '#FFE2CF',
      hairstyle: initialData?.hairstyle ?? 'hair_1',
      hairColor: initialData?.hairColor ?? 'light',
      ageStage: initialData?.ageStage ?? getDefaultAgeStageForPersonalize(bookId),
      fromWhom: initialData?.fromWhom ?? '',
      photo: initialData?.photo ? ({ path: initialData.photo.path } as any) : null,
      photos: [],
      relationship: 'Parent/Guardian',
      consent: !!defaultConsentChecked,
      birthDate: parseBirthDateIso(initialData?.birthDate) ?? null,
      personalityTraitIds: initialData?.personalityTraitIds?.length
        ? [...initialData.personalityTraitIds]
        : [],
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ [K in keyof PersonalizeFormData]?: boolean }>({});
    const [traitsHintFlashNonce, setTraitsHintFlashNonce] = useState(0);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [currentCropIndex, setCurrentCropIndex] = useState(0);
    const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

    const {
      images,
      isUploading,
      uploadProgress,
      error: uploadError,
      isDragging,
      handleImageUpload,
      handleImageDelete,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      getUploadedPaths,
      initializeWithUrls,
    } = useMultiImageUpload(uploadOptions?.maxImages ?? 1, {
      allowedTypes: uploadOptions?.allowedTypes,
      maxFileSize: uploadOptions?.maxFileSize,
    });

    useEffect(() => {
      const photosToInit =
        initialData?.photos && initialData.photos.length > 0
          ? initialData.photos
          : initialData?.photo?.path
            ? [initialData.photo.path]
            : [];

      if (photosToInit.length > 0) {
        initializeWithUrls(photosToInit);
        const firstPhoto = photosToInit[0];
        if (firstPhoto) {
          handleBasicInfoChange('photo', { path: firstPhoto });
          handleErrorChange('photo', '');
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData?.photo?.path, initialData?.photos]);

    useEffect(() => {
      const firstUploaded = images.find(img => (img as any).dataUrl || (img as any).uploadedFilePath);
      const picked = (firstUploaded as any)?.dataUrl || (firstUploaded as any)?.uploadedFilePath;

      if (picked && !formData.photo) {
        handleBasicInfoChange('photo', { path: picked });
        handleErrorChange('photo', '');
      } else if (!picked && formData.photo) {
        handleBasicInfoChange('photo', null);
        handleErrorChange('photo', 'Please upload a photo');
      }
    }, [images, formData.photo]);

    const handleBasicInfoChange = useCallback((field: keyof BasicInfoData, value: string | { file?: File; path: string } | null) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const handleErrorChange = useCallback((field: keyof BasicInfoData, errorMsg: string) => {
      setErrors(prev => ({ ...prev, [field]: errorMsg }));
    }, []);

    const handlePhotosUpload = async (files: File[]) => {
      if (!files || files.length === 0) return;
      const maxImages = uploadOptions?.maxImages ?? 1;
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) return;

      const filesToProcess = files.slice(0, remainingSlots);
      setPendingFiles(filesToProcess);
      setCurrentCropIndex(0);

      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
      const firstUrl = URL.createObjectURL(filesToProcess[0]);
      setPendingPreviewUrl(firstUrl);
      setIsCropperOpen(true);
      onCropperOpenChange?.(true);
    };

    const handleCroppedFile = async (file: File) => {
      const newlyUploadedPaths = await handleImageUpload([file]);

      if (newlyUploadedPaths.length > 0 && !formData.photo) {
        handleBasicInfoChange('photo', { path: newlyUploadedPaths[0] });
        handleErrorChange('photo', '');
      }

      const existing = new Set(getUploadedPaths());
      newlyUploadedPaths.forEach(p => existing.add(p));
      const allPaths = Array.from(existing);
      setFormData(prev => ({ ...prev, photos: allPaths }));
      setTouched(prev => ({ ...prev, photo: true }));

      const nextIndex = currentCropIndex + 1;
      if (nextIndex < pendingFiles.length) {
        setCurrentCropIndex(nextIndex);
        if (pendingPreviewUrl) {
          URL.revokeObjectURL(pendingPreviewUrl);
        }
        const nextUrl = URL.createObjectURL(pendingFiles[nextIndex]);
        setPendingPreviewUrl(nextUrl);
        setIsCropperOpen(true);
        onCropperOpenChange?.(true);
      } else {
        setIsCropperOpen(false);
        onCropperOpenChange?.(false);
        setPendingFiles([]);
        if (pendingPreviewUrl) {
          URL.revokeObjectURL(pendingPreviewUrl);
          setPendingPreviewUrl(null);
        }
      }
    };

    const handleCropperCancel = () => {
      setIsCropperOpen(false);
      onCropperOpenChange?.(false);
      setPendingFiles([]);
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
        setPendingPreviewUrl(null);
      }
    };

    const handlePhotoDelete = (id: string) => {
      const remainingImages = images.filter(img => img.id !== id);
      const remainingPaths = remainingImages
        .map(img => (img as any).dataUrl || (img as any).uploadedFilePath)
        .filter(Boolean) as string[];

      handleImageDelete(id);

      if (remainingPaths.length > 0) {
        handleBasicInfoChange('photo', { path: remainingPaths[0] });
      } else {
        handleBasicInfoChange('photo', null);
        handleErrorChange('photo', 'Please upload a photo');
      }
      setFormData(prev => ({ ...prev, photos: remainingPaths }));
    };

    useEffect(() => {
      const uploadedPaths = getUploadedPaths();
      setFormData(prev => ({ ...prev, photos: uploadedPaths }));
    }, [getUploadedPaths]);

    const runStep1Validation = (form: PersonalizeFormData, newErrors: FormErrors) => {
      if (!form.fullName.trim()) newErrors.fullName = 'Please enter the first name';
      if (!form.gender) newErrors.gender = 'Please select gender';
      if (!form.skinColor) newErrors.skinColor = 'Please select skin color';
      if (!form.ageStage) newErrors.ageStage = 'Please select an age stage';
      if (!String(form.fromWhom || '').trim()) newErrors.fromWhom = 'Please enter a name';
    };

    const runBirthdayValidation = (form: PersonalizeFormData, newErrors: FormErrors) => {
      if (!form.birthDate || Number.isNaN(form.birthDate.getTime())) {
        newErrors.birthDate = 'Please select a birth date';
      }
      const n = form.personalityTraitIds?.length ?? 0;
      if (n !== BIRTHDAY_TRAITS_REQUIRED) {
        newErrors.personalityTraits = `Please select exactly ${BIRTHDAY_TRAITS_REQUIRED} traits`;
      }
    };

    const runFinalValidation = (form: PersonalizeFormData, newErrors: FormErrors) => {
      if (!form.photo) newErrors.photo = 'Please upload a photo';
      if (!form.relationship) newErrors.relationship = 'Please select your relationship to the child';
      if (!form.consent) newErrors.consent = 'Please confirm your consent';
    };

    useImperativeHandle(ref, () => ({
      validateForm(options?: { scope?: 'step1' | 'stepBirthday' | 'all' }) {
        const scope = options?.scope ?? 'all';
        const newErrors: FormErrors = {};
        const nextTouched: { [K in keyof PersonalizeFormData]?: boolean } = {
          fullName: true,
          gender: true,
          skinColor: true,
          ageStage: true,
          fromWhom: true,
        };

        if (scope === 'step1') {
          runStep1Validation(formData, newErrors);
        } else if (scope === 'stepBirthday') {
          nextTouched.birthDate = true;
          nextTouched.personalityTraitIds = true;
          runBirthdayValidation(formData, newErrors);
          const n = formData.personalityTraitIds?.length ?? 0;
          if (n !== BIRTHDAY_TRAITS_REQUIRED) {
            setTraitsHintFlashNonce(v => v + 1);
          }
        } else {
          runStep1Validation(formData, newErrors);
          if (isBirthdayBook) {
            nextTouched.birthDate = true;
            nextTouched.personalityTraitIds = true;
            runBirthdayValidation(formData, newErrors);
          }
          nextTouched.photo = true;
          nextTouched.relationship = true;
          nextTouched.consent = true;
          runFinalValidation(formData, newErrors);
        }

        setTouched(prev => ({ ...prev, ...nextTouched }));
        setErrors(newErrors);
        const firstErrorKey = Object.keys(newErrors)[0] || null;
        return { isValid: Object.keys(newErrors).length === 0, firstErrorField: firstErrorKey };
      },
      formData,
      getFormData() {
        const currentPaths = getUploadedPaths();
        return {
          ...formData,
          photos: currentPaths,
        } as PersonalizeFormData;
      },
      isCropperOpen,
    }));

    const getConsentText = (relationship: string | undefined) => {
      switch (relationship) {
        case 'Parent/Guardian':
          return "I confirm that I am this child's parent or legal guardian, I am over 18, and I give my consent to use these details and photos to create their personalized storybook, in line with the";
        case 'Grandparent':
        case 'Aunt/Uncle':
        case 'Family Friend':
          return "I confirm that I am over 18 and that the child's parent or guardian has given me permission to share these details and photos so we can create their personalized storybook, in line with the";
        case 'Other':
          return "I confirm that I am over 18 and that the child's parent or guardian has given me consent to share these details and photos so we can create their personalized storybook, in line with the";
        default:
          return "I confirm that I am this child's parent or legal guardian, I am over 18, and I give my consent to use these details and photos to create their personalized storybook, in line with the";
      }
    };

    const handleToggleTrait = (id: string) => {
      setFormData(prev => {
        const cur = prev.personalityTraitIds ?? [];
        if (cur.includes(id)) {
          return { ...prev, personalityTraitIds: cur.filter(x => x !== id) };
        }
        if (cur.length >= BIRTHDAY_TRAITS_REQUIRED) {
          return { ...prev, personalityTraitIds: [...cur.slice(1), id] };
        }
        return { ...prev, personalityTraitIds: [...cur, id] };
      });
      setTouched(prev => ({ ...prev, personalityTraitIds: true }));
      setErrors(prev => ({ ...prev, personalityTraits: '' }));
    };

    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 pt-4 md:pt-0 md:px-[120px] bg-[#F8F8F8] relative pb-8 flex flex-col gap-2 md:gap-3">
        <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto">
          <div className="bg-white rounded p-6 shadow-sm">
            <form className="space-y-6">
              {currentStep === 1 && (
                <BasicInfoForm
                  data={{
                    fullName: formData.fullName,
                    gender: formData.gender,
                    skinColor: formData.skinColor,
                    hairstyle: formData.hairstyle,
                    hairColor: formData.hairColor,
                    ageStage: formData.ageStage,
                    fromWhom: formData.fromWhom,
                    photo: formData.photo,
                  }}
                  errors={{
                    fullName: errors.fullName,
                    gender: errors.gender,
                    skinColor: errors.skinColor,
                    ageStage: errors.ageStage,
                    fromWhom: errors.fromWhom,
                    hairstyle: errors.hairstyle,
                    hairColor: errors.hairColor,
                    photo: errors.photo,
                  }}
                  touched={{
                    fullName: touched.fullName,
                    gender: touched.gender,
                    skinColor: touched.skinColor,
                    ageStage: touched.ageStage,
                    fromWhom: touched.fromWhom,
                    hairstyle: touched.hairstyle,
                    hairColor: touched.hairColor,
                    photo: touched.photo,
                  }}
                  onChange={handleBasicInfoChange}
                  onErrorChange={handleErrorChange}
                  bookId={bookId}
                  apiSkinToneValues={apiSkinToneValues}
                  apiHairStyleValues={apiHairStyleValues}
                  apiHairColorValues={apiHairColorValues}
                  assetSpuCode={assetSpuCode}
                  hideHairstyleAndHairColor
                  showAgeStageAndFromWhom
                />
              )}

              {isBirthdayBook && currentStep === 2 && (
                <BirthdayBringThemToLifeStep
                  birthDate={formData.birthDate ?? null}
                  onBirthDateChange={(d) => {
                    setFormData(prev => ({ ...prev, birthDate: d }));
                    setTouched(prev => ({ ...prev, birthDate: true }));
                    setErrors(prev => ({ ...prev, birthDate: '' }));
                  }}
                  selectedTraitIds={formData.personalityTraitIds ?? []}
                  onToggleTrait={handleToggleTrait}
                  birthDateError={errors.birthDate}
                  traitsError={errors.personalityTraits}
                  birthDateTouched={touched.birthDate}
                  traitsTouched={touched.personalityTraitIds}
                  traitsSelectHintFlashNonce={traitsHintFlashNonce}
                />
              )}

              {currentStep === photoStep && (
                <div id="field-photo">
                  <MultiImageUpload
                    images={images as any}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    error={uploadError}
                    isDragging={isDragging}
                    maxImages={uploadOptions?.maxImages ?? 1}
                    onImageUpload={handlePhotosUpload}
                    onImageDelete={handlePhotoDelete}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                  {touched.photo && errors.photo && (
                    <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {currentStep === photoStep && (
          <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto">
            <div className="bg-white rounded p-6 shadow-sm">
              <div className="space-y-4">
                <div id="field-relationship">
                  <label className="block mb-2 font-medium text-[#222222] text-[16px] leading-[24px] tracking-[0.15px]">
                    What is your relationship to them?
                  </label>
                  <div className="relative">
                    <select
                      value={formData.relationship || ''}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, relationship: e.target.value }));
                        setTouched(prev => ({ ...prev, relationship: true }));
                        setErrors(prev => ({ ...prev, relationship: '' }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, relationship: true }))}
                      className="w-full p-2 border border-[#E5E5E5] rounded appearance-none bg-white text-[#222222] pr-8 focus:outline-none focus:border-[#012CCE]"
                    >
                      <option value="Parent/Guardian">Parent/Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Aunt/Uncle">Aunt/Uncle</option>
                      <option value="Family Friend">Family Friend</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {touched.relationship && errors.relationship && (
                    <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>
                  )}
                </div>

                <div id="field-consent">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consent || false}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, consent: e.target.checked }));
                        setTouched(prev => ({ ...prev, consent: true }));
                        setErrors(prev => ({ ...prev, consent: '' }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, consent: true }))}
                      className="w-5 h-5 min-w-[20px] min-h-[20px] border border-[#D9D9D9] rounded-full mt-[2px] cursor-pointer bg-transparent appearance-none flex-shrink-0 focus:ring-[#222222] focus:ring-1 checked:bg-[#012CCE] checked:border-[#012CCE]"
                      style={{
                        backgroundImage: formData.consent
                          ? "url(\"data:image/svg+xml,%3Csvg width='12' height='9' viewBox='0 0 12 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4.5L4.5 8L11 1' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"
                          : 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                      }}
                    />
                    <span className="text-[#666666] text-[14px] leading-[20px] tracking-[0.5px]">
                      {getConsentText(formData.relationship)}{' '}
                      <Link href="/privacy-policy" className="text-[#012CCE] underline">
                        Privacy Policy.
                      </Link>
                    </span>
                  </label>
                  {touched.consent && errors.consent && (
                    <p className="text-red-500 text-sm mt-1 ml-8">{errors.consent}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isCropperOpen && pendingPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-[860px] max-w-[95vw] rounded-sm pt-6 pr-6 pb-4 pl-6 flex flex-col gap-4">
              <GiverAvatarCropper
                resultMode="file"
                uiVariant="personalize"
                initialSrc={pendingPreviewUrl}
                maxSize={1024}
                exportMime="image/jpeg"
                exportQuality={0.92}
                spu={undefined}
                page={undefined}
                batchId={undefined}
                onCancel={handleCropperCancel}
                onDone={() => {}}
                onDoneFile={handleCroppedFile}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

SingleCharacterForm1.displayName = 'SingleCharacterForm1';

export default SingleCharacterForm1;
