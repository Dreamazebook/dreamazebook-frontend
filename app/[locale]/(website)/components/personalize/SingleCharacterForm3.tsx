/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import BasicInfoForm, { BasicInfoData, AgeStage } from './BasicInfoForm';
import MultiImageUpload from './MultiImageUpload';
import useMultiImageUpload from '../../hooks/useMultiImageUpload';
// Date of Birth 组件已移除
import GiverAvatarCropper from '../../preview/components/GiverAvatarCropper';

export interface PersonalizeFormData3 extends BasicInfoData {
  ageStage: AgeStage;
  photos: string[]; // 添加多图片支持
  relationship?: string; // Relationship to the child
  consent?: boolean; // Consent checkbox
}

export interface SingleCharacterForm3Handle {
  validateForm: (options?: { scope?: 'step1' | 'all' }) => { isValid: boolean; firstErrorField: string | null };
  formData: PersonalizeFormData3;
  getFormData: () => PersonalizeFormData3;
  isCropperOpen: boolean; // 是否正在添加/裁剪图片
}

interface FormErrors {
  fullName?: string;
  gender?: string;
  skinColor?: string;
  hairstyle?: string;
  hairColor?: string;
  photo?: string;
  ageStage?: string;
  relationship?: string;
  consent?: string;
}

interface SingleCharacterForm3Props {
  initialData?: {
    fullName?: string;
    gender?: '' | 'boy' | 'girl';
    skinColor?: string;
    hairstyle?: string;
    hairColor?: string;
    photo?: { path: string } | null;
    photos?: string[]; // 支持多张图片初始化
  };
  bookId?: string;
  // Relationship/consent defaults（用于 personalized-products 等场景）
  defaultConsentChecked?: boolean;
  // Optional backend-driven values
  apiSkinToneValues?: string[];
  apiHairStyleValues?: string[];
  apiHairColorValues?: string[];
  // Optional upload constraints from backend
  uploadOptions?: {
    allowedTypes?: string[];
    maxFileSize?: number;
    maxImages?: number;
  };
  assetSpuCode?: string;
  // 分步显示
  currentStep?: number; // 1 或 2
  // 裁剪器状态变化回调
  onCropperOpenChange?: (isOpen: boolean) => void;
}

const SingleCharacterForm3 = forwardRef<SingleCharacterForm3Handle, SingleCharacterForm3Props>(
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
  const [formData, setFormData] = useState<PersonalizeFormData3>({
    fullName: initialData?.fullName ?? '',
    gender: initialData?.gender ?? '',
    skinColor: initialData?.skinColor ?? '#FFE2CF',
    hairstyle: initialData?.hairstyle ?? 'hair_1', // 默认选择头发样式1
    hairColor: initialData?.hairColor ?? 'light', // 默认选择浅色头发
    photo: initialData?.photo ? ({ path: initialData.photo.path } as any) : null,
    ageStage: '',
    fromWhom: '',
    photos: [],
    relationship: 'Parent/Guardian',
    consent: !!defaultConsentChecked,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PersonalizeFormData3, boolean>>>({});
  // 裁剪相关状态
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  const ageStages: { label: string; value: PersonalizeFormData3['ageStage']; src: string }[] = [
    { label: 'Infant (0–1 year)', value: 'infant', src: '/season-spring.png' },
    { label: 'Toddler (1–3 years)', value: 'toddler', src: '/season-spring.png' },
    { label: 'Preschooler (3–5 years)', value: 'preschooler', src: '/season-spring.png' },
    { label: 'Early school age (5–8 years)', value: 'early_school_age', src: '/season-spring.png' },
  ];

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
  } = useMultiImageUpload(uploadOptions?.maxImages ?? 3, { allowedTypes: uploadOptions?.allowedTypes, maxFileSize: uploadOptions?.maxFileSize });

  // 书籍2的品质选择移至 select-book-content 页面

  // 当某张图片上传成功后，自动把第一张已上传图片设置为主图（兼容 dataUrl / uploadedFilePath）
  // 同时，如果所有图片都被删除，确保清除 formData.photo
  useEffect(() => {
    const firstUploaded = images.find((img: any) => img.dataUrl || img.uploadedFilePath);
    const picked = (firstUploaded as any)?.dataUrl || (firstUploaded as any)?.uploadedFilePath;

    if (picked && !formData.photo) {
      // 如果有图片但 formData.photo 为空，设置第一张为主图
      handleBasicInfoChange('photo', { path: picked });
      handleErrorChange('photo', '');
    } else if (!picked && formData.photo) {
      // 如果所有图片都被删除，清除 formData.photo
      handleBasicInfoChange('photo', null);
      handleErrorChange('photo', 'Please upload a photo');
    }
  }, [images, formData.photo]);

  // 初始化：如果传入了 initialData.photo.path 或 photos 数组，则作为已有图片显示
  useEffect(() => {
    // 优先使用 photos 数组，如果没有则使用 photo.path
    const photosToInit = initialData?.photos && initialData.photos.length > 0 ? initialData.photos : initialData?.photo?.path ? [initialData.photo.path] : [];

    if (photosToInit.length > 0) {
      initializeWithUrls(photosToInit);
      // 设置第一张为主图
      const firstPhoto = photosToInit[0];
      if (firstPhoto) {
        handleBasicInfoChange('photo', { path: firstPhoto });
        handleErrorChange('photo', '');
      }
    }
    // 仅在初次挂载或 initialData 变化时运行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.photo?.path, initialData?.photos]);

  // Update basic info fields and mark as touched
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: string | { file?: File; path: string } | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Update error for a given field
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // Handle multiple photos upload（与书籍1一致，增加裁剪逻辑）
  const handlePhotosUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const maxImages = uploadOptions?.maxImages ?? 3;
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

  // 处理删除
  const handlePhotoDelete = (id: string) => {
    const remainingImages = images.filter(img => img.id !== id);

    // 计算剩余路径（兼容 dataUrl 和 uploadedFilePath）
    const remainingPaths = remainingImages
      .map(img => (img as any).dataUrl || (img as any).uploadedFilePath)
      .filter(Boolean) as string[];

    // 删除图片
    handleImageDelete(id);

    // 更新表单数据
    if (remainingPaths.length > 0) {
      handleBasicInfoChange('photo', { path: remainingPaths[0] });
    } else {
      handleBasicInfoChange('photo', null);
      handleErrorChange('photo', 'Please upload a photo');
    }
    // 同步更新 photos 字段
    setFormData(prev => ({ ...prev, photos: remainingPaths }));
  };

  // 监听 images 变化，同步更新 photos 字段
  useEffect(() => {
    const uploadedPaths = getUploadedPaths();
    setFormData(prev => ({ ...prev, photos: uploadedPaths }));
  }, [getUploadedPaths]);

  const handleAgeStageClick = (value: PersonalizeFormData3['ageStage']) => {
    setFormData(prev => ({ ...prev, ageStage: value }));
    setTouched(prev => ({ ...prev, ageStage: true }));
    setErrors(prev => ({ ...prev, ageStage: '' }));
  };

  useImperativeHandle(ref, () => ({
    validateForm(options?: { scope?: 'step1' | 'all' }) {
      const scope = options?.scope ?? 'all';
      const validateStep1 = true;
      const validateStep2 = scope === 'all';
      // Mark fields as touched to trigger validations
      setTouched({
        fullName: true,
        gender: true,
        skinColor: true,
        hairstyle: true,
        hairColor: true,
        ageStage: true,
        ...(validateStep2 ? { photo: true, relationship: true, consent: true } : {}),
      });

      const newErrors: FormErrors = {};
      if (validateStep1) {
        if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the first name';
        if (!formData.gender) newErrors.gender = 'Please select gender';
        if (!formData.skinColor) newErrors.skinColor = 'Please select skin color';
        if (!formData.hairstyle) newErrors.hairstyle = 'Please select hairstyle';
        if (!formData.hairColor) newErrors.hairColor = 'Please select hair color';
        if (!formData.ageStage) newErrors.ageStage = 'Please select an age stage';
      }
      if (validateStep2) {
        if (!formData.photo) newErrors.photo = 'Please upload a photo';
        if (!formData.relationship) newErrors.relationship = 'Please select your relationship to the child';
        if (!formData.consent) newErrors.consent = 'Please confirm your consent';
      }

      setErrors(newErrors);

      // 返回第一个错误字段的 key，如果没有错误则返回 null
      const firstErrorKey = Object.keys(newErrors)[0] || null;
      return { isValid: Object.keys(newErrors).length === 0, firstErrorField: firstErrorKey };
    },
    formData,
    getFormData() {
      const currentPaths = getUploadedPaths();
      return { ...formData, photos: currentPaths } as any;
    },
    isCropperOpen,
  }));

  // 根据关系返回对应的 consent 文本
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[120px] bg-[#F8F8F8] relative pb-8">
      {/* 表单区域 */}
      <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto">
        <div className="bg-white rounded p-6 shadow-sm">
          <form className="space-y-6">
            {/* Step 1 */}
            {currentStep === 1 && (
              <>
                <BasicInfoForm
                  data={{
                    fullName: formData.fullName,
                    gender: formData.gender,
                    skinColor: formData.skinColor,
                    hairstyle: formData.hairstyle,
                    hairColor: formData.hairColor,
                    photo: formData.photo,
                  }}
                  errors={{
                    fullName: errors.fullName,
                    gender: errors.gender,
                    skinColor: errors.skinColor,
                    hairstyle: errors.hairstyle,
                    hairColor: errors.hairColor,
                    photo: errors.photo,
                  }}
                  touched={{
                    fullName: touched.fullName,
                    gender: touched.gender,
                    skinColor: touched.skinColor,
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
                />

                <div id="field-ageStage">
                  <label className="block mb-[2px] font-medium">Age stage</label>
                  <p className="text-[#999999] text-[14px] leading-[20px] tracking-[0.5px] mb-1 md:text-[16px] md:leading-[24px] md:tracking-[0.5px]">
                    Choose the age range this story is made for.
                  </p>
                  <div
                    className="flex flex-wrap gap-2 sm:gap-3"
                    tabIndex={0}
                    onBlur={() => {
                      if (!formData.ageStage) {
                        setErrors(prev => ({ ...prev, ageStage: 'Please select an age stage' }));
                      } else {
                        setErrors(prev => ({ ...prev, ageStage: '' }));
                      }
                    }}
                  >
                    {ageStages.map(stage => (
                      <button
                        key={stage.value}
                        type="button"
                        onClick={() => handleAgeStageClick(stage.value)}
                        className={`relative border p-2 rounded flex flex-col items-center gap-[10px] 
                      w-[80px] bg-[#F8F8F8] sm:w-[126px] sm:bg-transparent ${
                        formData.ageStage === stage.value ? 'border-[#012CCE]' : 'border-transparent'
                      }`}
                      >
                        <Image src={stage.src} alt={stage.label} width={122} height={110} className="rounded" />
                        <span>{stage.label}</span>
                      </button>
                    ))}
                  </div>
                  {touched.ageStage && errors.ageStage && <p className="text-red-500 text-sm mt-1">{errors.ageStage}</p>}
                </div>
              </>
            )}

            {/* Step 2: Photo Upload */}
            {currentStep === 2 && (
              <div id="field-photo">
                <MultiImageUpload
                  images={images as any}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  error={uploadError}
                  isDragging={isDragging}
                  maxImages={uploadOptions?.maxImages ?? 3}
                  onImageUpload={handlePhotosUpload}
                  onImageDelete={handlePhotoDelete}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
                {touched.photo && errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Relationship and Consent Section - 在 Step 2 时显示 */}
      {currentStep === 2 && (
        <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto mt-4">
          <div className="bg-white rounded p-6 shadow-sm">
            <div className="space-y-4">
              {/* Relationship to the child */}
              <div id="field-relationship">
                <label className="block mb-2 font-medium text-[#222222] text-[16px] leading-[24px] tracking-[0.15px]">
                  What is your relationship to the child?
                </label>
                <div className="relative">
                  <select
                    value={formData.relationship || ''}
                    onChange={e => {
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
                {touched.relationship && errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
              </div>

              {/* Consent checkbox */}
              <div id="field-consent">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent || false}
                    onChange={e => {
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
                {touched.consent && errors.consent && <p className="text-red-500 text-sm mt-1 ml-8">{errors.consent}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 裁剪弹窗：复用 Preview 页 Giver 的裁剪组件，但改为返回裁剪后的 File */}
      {isCropperOpen && pendingPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[860px] max-w-[95vw] rounded-sm pt-6 pr-6 pb-4 pl-6 flex flex-col gap-4">
            <GiverAvatarCropper
              resultMode="file"
              initialSrc={pendingPreviewUrl}
              aspectRatio={1}
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
});

SingleCharacterForm3.displayName = 'SingleCharacterForm3';

export default SingleCharacterForm3;


