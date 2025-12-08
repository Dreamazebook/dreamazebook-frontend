/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { BsCheck } from 'react-icons/bs';
import { Link } from '@/i18n/routing';
import BasicInfoForm, { BasicInfoData } from './BasicInfoForm';
import MultiImageUpload from './MultiImageUpload';
import useMultiImageUpload from '../../hooks/useMultiImageUpload';
import GiverAvatarCropper from '../../preview/components/GiverAvatarCropper';

export interface PersonalizeFormData extends BasicInfoData {
  singleChoice: string; // Single choice feature
  multipleChoice: string[]; // Multiple choice features
  photos: string[]; // 添加多图片支持
  relationship?: string; // Relationship to the child
  consent?: boolean; // Consent checkbox
}

export interface SingleCharacterForm1Handle {
  validateForm: (options?: { scope?: 'step1' | 'all' }) => { isValid: boolean; firstErrorField: string | null }; // Method to validate form data
  formData: PersonalizeFormData;
  getFormData: () => PersonalizeFormData;
}

interface FormErrors {
  fullName?: string;
  gender?: string;
  skinColor?: string;
  hairstyle?: string;
  hairColor?: string;
  photo?: string;
  singleChoice?: string;
  multipleChoice?: string;
  relationship?: string;
  consent?: string;
}

interface SingleCharacterForm1Props {
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
}

const SingleCharacterForm1 = forwardRef<SingleCharacterForm1Handle, SingleCharacterForm1Props>(({ initialData, bookId = '1', apiSkinToneValues, apiHairStyleValues, apiHairColorValues, uploadOptions, assetSpuCode, currentStep = 1 }, ref) => {
  const [formData, setFormData] = useState<PersonalizeFormData>({
    fullName: initialData?.fullName ?? '',
    gender: initialData?.gender ?? '',
    skinColor: initialData?.skinColor ?? '#FFE2CF',
    hairstyle: initialData?.hairstyle ?? 'hair_1', // 默认选择头发样式1
    hairColor: initialData?.hairColor ?? 'light', // 默认选择浅色头发
    photo: initialData?.photo ? { path: initialData.photo.path } as any : null,
    singleChoice: '',
    multipleChoice: [],
    photos: [], // 新增多图片支持
    relationship: 'Parent/Guardian', // 默认关系
    consent: false, // 默认未同意
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [touched, setTouched] = useState<{ [K in keyof PersonalizeFormData]?: boolean }>({});
  // 裁剪相关状态
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
  } = useMultiImageUpload(uploadOptions?.maxImages ?? 3, { allowedTypes: uploadOptions?.allowedTypes, maxFileSize: uploadOptions?.maxFileSize });

  useEffect(() => {
    if (images.length > 0) {
      const img = new Image();
      img.src = images[0].previewUrl;
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    }
  }, [images]);

  // 初始化：如果传入了 initialData.photo.path 或 photos 数组，则作为已有图片显示
  useEffect(() => {
    // 优先使用 photos 数组，如果没有则使用 photo.path
    const photosToInit = initialData?.photos && initialData.photos.length > 0 
      ? initialData.photos 
      : (initialData?.photo?.path ? [initialData.photo.path] : []);
    
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

  // 当某张图片上传成功后，自动把第一张已上传图片设置为主图（兼容 dataUrl / uploadedFilePath）
  // 同时，如果所有图片都被删除，确保清除 formData.photo
  useEffect(() => {
    const firstUploaded = images.find(img => (img as any).dataUrl || (img as any).uploadedFilePath);
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

  // Update basic info fields
  const handleBasicInfoChange = (field: keyof BasicInfoData, value: string | { file?: File; path: string } | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Update errors for specific fields
  const handleErrorChange = (field: keyof BasicInfoData, errorMsg: string) => {
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // 触发裁剪弹窗：先缓存待处理文件，再逐个进入裁剪
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
  };

  // 裁剪完成后，调用原有上传逻辑，将裁剪结果作为新文件上传
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

    // 处理队列中的下一张
    const nextIndex = currentCropIndex + 1;
    if (nextIndex < pendingFiles.length) {
      setCurrentCropIndex(nextIndex);
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
      const nextUrl = URL.createObjectURL(pendingFiles[nextIndex]);
      setPendingPreviewUrl(nextUrl);
      setIsCropperOpen(true);
    } else {
      // 队列结束，关闭裁剪弹窗并清理
      setIsCropperOpen(false);
      setPendingFiles([]);
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
        setPendingPreviewUrl(null);
      }
    }
  };

  const handleCropperCancel = () => {
    setIsCropperOpen(false);
    setPendingFiles([]);
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
      setPendingPreviewUrl(null);
    }
  };

  // Handle photo deletion
  const handlePhotoDelete = (id: string) => {
    // 先计算删除后的剩余图片（基于当前 images 状态）
    const imageToDelete = images.find(img => img.id === id);
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
    // 同步更新photos字段
    setFormData(prev => ({ ...prev, photos: remainingPaths }));
  };

  // 监听images变化，同步更新photos字段
  useEffect(() => {
    const uploadedPaths = getUploadedPaths();
    setFormData(prev => ({ ...prev, photos: uploadedPaths }));
  }, [getUploadedPaths]);

  useImperativeHandle(ref, () => ({
    validateForm(options?: { scope?: 'step1' | 'all' }) {
      const scope = options?.scope ?? 'all';
      const validateStep1 = true;
      const validateStep2 = scope === 'all';
      // 是否需要校验"特征"字段（仅书籍2需要）
      const shouldValidateFeatures = validateStep2 && bookId === '2';

      // Mark fields as touched for validation feedback
      setTouched({
        fullName: true,
        gender: true,
        skinColor: true,
        hairstyle: true,
        hairColor: true,
        ...(validateStep2
          ? {
              photo: true,
              relationship: true,
              consent: true,
            }
          : {}),
        ...(shouldValidateFeatures ? { singleChoice: true, multipleChoice: true } : {}),
      });

      const newErrors: FormErrors = {};
      if (validateStep1) {
        if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the first name';
        if (!formData.gender) newErrors.gender = 'Please select gender';
        if (!formData.skinColor) newErrors.skinColor = 'Please select skin color';
        if (!formData.hairstyle) newErrors.hairstyle = 'Please select hairstyle';
        if (!formData.hairColor) newErrors.hairColor = 'Please select hair color';
      }
      if (validateStep2) {
        if (!formData.photo) newErrors.photo = 'Please upload a photo';
        if (!formData.relationship) newErrors.relationship = 'Please select your relationship to the child';
        if (!formData.consent) newErrors.consent = 'Please confirm your consent';
      }
      if (shouldValidateFeatures) {
        if (!formData.singleChoice) newErrors.singleChoice = 'Please select one feature';
        if (formData.multipleChoice.length === 0) newErrors.multipleChoice = 'Please select at least one feature';
      }

      setErrors(newErrors);
      
      // 返回第一个错误字段的 key，如果没有错误则返回 null
      const firstErrorKey = Object.keys(newErrors)[0] || null;
      return { isValid: Object.keys(newErrors).length === 0, firstErrorField: firstErrorKey };
    },
    formData,
    getFormData() {
      // 将多图片路径添加到返回数据中，以便后续处理
      const currentPaths = getUploadedPaths();
      return { 
        ...formData, 
        // 添加额外的photos字段用于存储所有图片路径
        photos: currentPaths 
      } as any;
    }
  }));

  // 判断是否显示第二步内容（Single Choice 和 Multiple Choice）
  const hasStep2Content = bookId === '2';

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
    <div className="w-full max-w-[1440px] mx-auto px-4 pt-4 md:pt-0 md:px-[120px] bg-[#F8F8F8] relative pb-8 flex flex-col gap-2 md:gap-3">
      {/* 表单区域 */}
      <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto">
        <div className="bg-white rounded p-6 shadow-sm">
          <form className="space-y-6">
            {/* Step 1: Basic information only */}
            {currentStep === 1 && (
              <>
                {/* Basic information part */}
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
              </>
            )}

            {/* Step 2: Photo Upload + Single Choice + Multiple Choice */}
            {currentStep === 2 && (
              <>
                {/* Photo Upload Section - 替换为多图片上传组件 */}
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
                  {touched.photo && errors.photo && (
                    <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
                  )}
                </div>

                {/* Single Choice + Multiple Choice (仅当 bookId === '2' 时显示) */}
                {hasStep2Content && (
                  <>
                    {/* Single Choice Section（默认隐藏于大多数书籍） */}
                    {bookId === '2' && (
                <div id="field-singleChoice">
                  <label className="block mb-2 font-medium">
                    Features <span className="ml-2 text-gray-500">(Single choice)</span>
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    tabIndex={0}
                    onBlur={() => {
                      if (!formData.singleChoice) {
                        setErrors(prev => ({ ...prev, singleChoice: 'Please select one feature' }));
                      } else {
                        setErrors(prev => ({ ...prev, singleChoice: '' }));
                      }
                    }}
                  >
                    {['lively', 'Quiet', 'kind hearted', 'cute', 'humor'].map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        className={`px-4 py-2 rounded border ${
                          formData.singleChoice === feature
                            ? 'bg-red-50 border-black text-black'
                            : 'bg-gray-100 border-transparent text-gray-800'
                        }`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, singleChoice: feature }));
                          setTouched(prev => ({ ...prev, singleChoice: true }));
                          setErrors(prev => ({ ...prev, singleChoice: '' }));
                        }}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                  {touched.singleChoice && errors.singleChoice && (
                    <p className="text-red-500 text-sm">{errors.singleChoice}</p>
                  )}
                </div>
                )}

                {/* Multiple Choice Section（默认隐藏于大多数书籍） */}
                {bookId === '2' && (
                <div id="field-multipleChoice">
                  <label className="block mb-2 font-medium">
                    Features <span className="ml-2 text-gray-500">(Multiple choice)</span>
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    tabIndex={0}
                    onBlur={() => {
                      if (formData.multipleChoice.length === 0) {
                        setErrors(prev => ({ ...prev, multipleChoice: 'Please select at least one feature' }));
                      } else {
                        setErrors(prev => ({ ...prev, multipleChoice: '' }));
                      }
                    }}
                  >
                    {['lively', 'Quiet', 'kind hearted', 'cute', 'humor'].map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        className={`relative px-4 py-2 rounded border ${
                          formData.multipleChoice.includes(feature)
                            ? 'border-black bg-[#FCF2F2] text-black'
                            : 'bg-gray-100 border-transparent text-gray-800'
                        }`}
                        onClick={() => {
                          setFormData(prev => {
                            const newArray = prev.multipleChoice.includes(feature)
                              ? prev.multipleChoice.filter(item => item !== feature)
                              : [...prev.multipleChoice, feature];
                            return { ...prev, multipleChoice: newArray };
                          });
                          setTouched(prev => ({ ...prev, multipleChoice: true }));
                          setErrors(prev => ({ ...prev, multipleChoice: '' }));
                        }}
                      >
                        {feature}
                        {formData.multipleChoice.includes(feature) && (
                          <span
                            className="absolute bottom-0 right-0 bg-black text-white flex items-center justify-center text-xs"
                            style={{ width: '18px', height: '12px', borderRadius: '4px 0 0 0' }}
                          >
                            <BsCheck className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                    {touched.multipleChoice && errors.multipleChoice && (
                      <p className="text-red-500 text-sm">{errors.multipleChoice}</p>
                    )}
                  </div>
                  )}
                  </>
                )}
              </>
            )}

          </form>
        </div>
      </div>

      {/* Relationship and Consent Section - 独立部分，在 Step 2 时显示 */}
      {currentStep === 2 && (
        <div className="w-[98%] md:w-[60%] max-w-[588px] mx-auto">
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
                      <path d="M1 1L6 6L11 1" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {touched.relationship && errors.relationship && (
                  <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>
                )}
              </div>

              {/* Consent checkbox */}
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
                      backgroundImage: formData.consent ? "url(\"data:image/svg+xml,%3Csvg width='12' height='9' viewBox='0 0 12 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4.5L4.5 8L11 1' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")" : 'none',
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

      {/* 裁剪弹窗：复用 Preview 页 Giver 的裁剪组件，但改为返回裁剪后的 File */}
      {isCropperOpen && pendingPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[860px] max-w-[95vw] rounded-sm pt-6 pr-6 pb-4 pl-6 flex flex-col gap-4">
            <GiverAvatarCropper
              // 个性化页：不走特殊上传接口，仅返回裁剪后的文件
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
              // 预览页使用 onDone(url)，这里仅使用 onDoneFile
              onDone={() => {}}
              onDoneFile={handleCroppedFile}
            />
          </div>
        </div>
      )}
    </div>
  );
});

SingleCharacterForm1.displayName = 'SingleCharacterForm1';

export default SingleCharacterForm1;
