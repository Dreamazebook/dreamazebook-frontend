import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { IoCloudUploadOutline, FaRegTrashAlt } from '@/utils/icons';
import type { UploadedImage } from '../../hooks/useMultiImageUpload';

interface MultiImageUploadProps {
  images: UploadedImage[];
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  isDragging: boolean;
  maxImages?: number;
  onImageUpload: (files: File[]) => void;
  onImageDelete: (id: string) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  isUploading,
  uploadProgress,
  error,
  isDragging,
  maxImages = 1,
  onImageUpload,
  onImageDelete,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (images.length >= maxImages) {
        showToastMessage();
        e.target.value = ''; // 清空input
        return;
      }
      
      const remainingSlots = maxImages - images.length;
      const filesToUpload = selectedFiles.slice(0, remainingSlots);
      onImageUpload(filesToUpload);
      
      // 处理完文件后清空 input，允许重新选择相同的文件
      e.target.value = '';
    }
  };

  const handleUploadAreaClick = () => {
    if (images.length >= maxImages) {
      showToastMessage();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDragEvents = {
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
      if (images.length >= maxImages) {
        e.preventDefault();
        showToastMessage();
        return;
      }
      onDragEnter(e);
    },
    onDragLeave: onDragLeave,
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      if (images.length >= maxImages) {
        e.preventDefault();
        return;
      }
      onDragOver(e);
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      if (images.length >= maxImages) {
        e.preventDefault();
        showToastMessage();
        return;
      }
      onDrop(e);
    }
  };

  const canUploadMore = images.length < maxImages;
  const isSingle = maxImages <= 1;

  return (
    <div className="space-y-4">
      {/* 标题和说明 */}
      <div className="">
        <div className="flex items-center mb-2">
          <label className="block font-medium text-[#222222] text-[16px] leading-[24px] tracking-[0.15px]">
            {isSingle ? 'Upload a Clear Photo' : `Upload 1–${maxImages} Clear Photos`}
          </label>
          <span className="text-gray-400 inline-flex items-center group relative font-normal ml-2">
            <div 
              className="w-4 h-4 rounded-full border border-[#666666] flex items-center justify-center cursor-pointer"
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <span className="text-[#666666] text-[10px] leading-none font-medium">?</span>
            </div>
            <div className={`${showTooltip ? 'block' : 'hidden'} md:group-hover:block absolute left-1/2 transform -translate-x-1/2 bottom-6 w-64 p-2 bg-white text-gray-800 text-sm rounded shadow-lg z-10 backdrop-blur`}>
              <p>
                Upload a clear photo so we can create a unique image of you.
                {isSingle
                  ? ' Your image is only used for this book; we use secure storage to help protect your privacy.'
                  : ' Photos are only generated from user images. We have an independent database to ensure that your privacy will not be leaked.'}
              </p>
              {/* 箭头 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </span>
        </div>
        <p className="text-[#999999] text-[16px] leading-[24px] tracking-[0.5px] mb-4">
          {isSingle
            ? 'To get the best result, please use a photo that meets the following:'
            : 'To get the best result, please use photos that meet the following:'}
        </p>
      </div>

      {/* 图片要求示例 - 左右布局 */}
      <div className="flex flex-row gap-4 mb-6 bg-[#F8F8F8] py-3 px-4 rounded-[4px]">
        {/* 左侧：示例图片 */}
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
        
        {/* 右侧：指南列表 */}
        <div className="flex-1 flex items-start">
          <ul className="space-y-2 text-[#666666] text-[14px] leading-[20px] tracking-[0.5px]">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Solo photo, front-facing, natural look</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Bright & clear image</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>No pacifier, hat, or cap</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 上传区域 - 始终显示，达到张数上限时禁用 */}
      <div
        id="upload-area-photo"
        className={`rounded p-4 gap-1 text-center transition-colors ${error ? 'h-[148px]' : 'h-[120px]'} flex flex-col items-center justify-center relative ${
          !canUploadMore 
            ? 'bg-[#F8F8F8] cursor-not-allowed text-[#999999]' 
            : isDragging 
              ? 'border-2 border-[#012CCE] cursor-pointer' 
              : 'bg-[#F8F8F8] cursor-pointer'
        }`}
        style={{
          backgroundColor: isDragging && canUploadMore ? 'rgba(1, 44, 206, 0.05)' : undefined
        }}
        onDragEnter={handleDragEvents.onDragEnter}
        onDragLeave={handleDragEvents.onDragLeave}
        onDragOver={handleDragEvents.onDragOver}
        onDrop={handleDragEvents.onDrop}
        onClick={handleUploadAreaClick}
      >
          {isUploading ? (
            <div className="text-center w-full max-w-md mx-auto">
              <div className="w-[80%] mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#012CCE] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-gray-700 text-lg">Uploading...</p>
            </div>
          ) : (
            <>
              {isDragging ? (
                <p className="text-gray-700 text-lg">Please loosen</p>
              ) : (
                <div className="space-y-1">
                  {/* 云朵上传图标 */}
                  <IoCloudUploadOutline className={`mx-auto text-2xl ${canUploadMore ? 'text-[#222222]' : 'text-[#999999] cursor-not-allowed'}`} />
                  
                  {/* 主要文字 */}
                  <div className="">
                    <p className={`text-[#222222] text-base ${canUploadMore ? 'text-[#012CCE]' : 'text-[#999999] cursor-not-allowed'}`}>
                      {isSingle ? 'Drag your file here or ' : 'Drag your file(s) here or '}
                      <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡，避免触发父元素的点击
                            handleUploadAreaClick();
                          }}
                          className={`${canUploadMore ? 'text-[#012CCE]' : 'text-[#999999] cursor-not-allowed'}`}
                        >
                        Browse
                      </button>
                    </p>
                    
                    
                    {/* 文件信息 */}
                    <p className="text-[#999999] text-sm">
                      Supports: jpeg, png, webp
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          {error && <p className="text-[#CF0F02] text-sm">{error}</p>}
        </div>

      {/* 已上传的图片显示 */}
      {images.length > 0 && (
        <div
          className={`grid gap-2 sm:gap-3 mb-4 ${
            isSingle
              ? 'grid-cols-1 w-28 sm:w-32'
              : 'grid-cols-3 w-full max-w-[280px] sm:max-w-xs mx-auto'
          }`}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative flex min-w-0 w-full ${
                isSingle ? 'justify-start' : 'justify-center'
              }`}
            >
              <div className="relative inline-block max-w-full">
                <img
                  src={image.previewUrl}
                  alt={`Uploaded image ${index + 1}`}
                  className="block h-auto w-auto max-h-[240px] max-w-full rounded-lg bg-gray-100 object-contain"
                />
                {image.isUploading && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(248, 248, 248, 0.4)' }}
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#012CCE] border-t-transparent" />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDelete(image.id);
                  }}
                  type="button"
                  className="absolute top-0 right-0 z-20 flex items-center justify-center bg-white shadow-md"
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '0 0 0 4px',
                  }}
                >
                  <FaRegTrashAlt
                    style={{
                      color: 'white',
                      width: '18px',
                      height: '18px',
                    }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast 提示 */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {isSingle
            ? 'You can only upload 1 photo'
            : `You can only upload up to ${maxImages} photos`}
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={!isSingle}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default MultiImageUpload;