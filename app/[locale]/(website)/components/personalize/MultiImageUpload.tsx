import React, { useRef, useState } from 'react';
import { IoCloudUploadOutline, FaRegTrashAlt } from '@/utils/icons';
import type { UploadedImage } from '../../hooks/useMultiImageUpload';
import PersonalizePhotoUploadTips from './PersonalizePhotoUploadTips';

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
  const uploadSubtitle = isSingle ? 'Upload a photo' : `Upload up to ${maxImages} photos`;

  return (
    <div className="space-y-4">
      <PersonalizePhotoUploadTips subtitle={uploadSubtitle} />

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