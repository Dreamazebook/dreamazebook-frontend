/** @jsxImportSource react */
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { BsCheck } from 'react-icons/bs';
import BasicInfoForm, { BasicInfoData } from './BasicInfoForm';
import MultiImageUpload from './MultiImageUpload';
import useMultiImageUpload from '../../hooks/useMultiImageUpload';

export interface PersonalizeFormData extends BasicInfoData {
  singleChoice: string; // Single choice feature
  multipleChoice: string[]; // Multiple choice features
  photos: string[]; // 添加多图片支持
}

export interface SingleCharacterForm1Handle {
  validateForm: () => { isValid: boolean; firstErrorField: string | null }; // Method to validate form data
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
}

interface SingleCharacterForm1Props {
  initialData?: {
    fullName?: string;
    gender?: '' | 'boy' | 'girl';
    skinColor?: string;
    hairstyle?: string;
    hairColor?: string;
    photo?: { path: string } | null;
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
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [touched, setTouched] = useState<{ [K in keyof PersonalizeFormData]?: boolean }>({});

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

  // 初始化：如果传入了 initialData.photo.path，则作为已有图片显示
  useEffect(() => {
    const url = initialData?.photo?.path;
    if (url) {
      initializeWithUrls([url]);
      handleBasicInfoChange('photo', { path: url });
      handleErrorChange('photo', '');
    }
  // 仅在初次挂载或 initialData 变化时运行
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.photo?.path]);

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

  // Handle multiple photos upload
  const handlePhotosUpload = async (files: File[]) => {
    // 使用 hook 返回的新上传成功路径，避免依赖异步 state 造成的时序问题
    const newlyUploadedPaths = await handleImageUpload(files);

    // 如果不存在 photo，则把第一张新上传图设为主图；否则保持已有主图
    if (newlyUploadedPaths.length > 0 && !formData.photo) {
      handleBasicInfoChange('photo', { path: newlyUploadedPaths[0] });
      handleErrorChange('photo', '');
    }

    // 组合已有路径与新路径，作为 photos 字段（去重）
    const existing = new Set(getUploadedPaths());
    newlyUploadedPaths.forEach(p => existing.add(p));
    const allPaths = Array.from(existing);

    setFormData(prev => ({ ...prev, photos: allPaths }));
    setTouched(prev => ({ ...prev, photo: true }));
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
    validateForm() {
      // 是否需要校验"特征"字段（仅书籍2需要）
      const shouldValidateFeatures = bookId === '2';

      // Mark all fields as touched for validation feedback
      setTouched({
        fullName: true,
        gender: true,
        skinColor: true,
        hairstyle: true,
        hairColor: true,
        photo: true,
        ...(shouldValidateFeatures ? { singleChoice: true, multipleChoice: true } : {}),
      });

      const newErrors: FormErrors = {};
      if (!formData.fullName.trim()) newErrors.fullName = 'Please enter the full name';
      if (!formData.gender) newErrors.gender = 'Please select gender';
      if (!formData.skinColor) newErrors.skinColor = 'Please select skin color';
      if (!formData.hairstyle) newErrors.hairstyle = 'Please select hairstyle';
      if (!formData.hairColor) newErrors.hairColor = 'Please select hair color';
      if (!formData.photo) newErrors.photo = 'Please upload a photo';
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 pt-4 md:pt-0 md:px-[120px] bg-[#F8F8F8] relative pb-8">
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
    </div>
  );
});

SingleCharacterForm1.displayName = 'SingleCharacterForm1';

export default SingleCharacterForm1;
