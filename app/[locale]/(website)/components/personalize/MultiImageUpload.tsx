import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { FaRegTrashAlt, FaQuestionCircle } from 'react-icons/fa';

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadedFilePath?: string;
}

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
  maxImages = 3,
  onImageUpload,
  onImageDelete,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const remainingSlots = maxImages - images.length;
      const filesToUpload = selectedFiles.slice(0, remainingSlots);
      onImageUpload(filesToUpload);
    }
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* 标题和说明 */}
      <div>
        <label className="block mb-2 flex items-center">
          <span className="font-medium">Upload 1–3 Clear Photos</span>
          <span className="text-gray-400 inline-flex items-center group relative font-normal ml-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.58178 0 0 3.58178 0 8C0 12.4182 3.58178 16 8 16C12.4182 16 16 12.4182 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0ZM8 14.6667C4.31822 14.6667 1.33333 11.6818 1.33333 8C1.33333 4.31822 4.31822 1.33333 8 1.33333C11.6818 1.33333 14.6667 4.31822 14.6667 8C14.6667 8.87548 14.4942 9.74239 14.1592 10.5512C13.8242 11.3601 13.3331 12.095 12.714 12.714C12.095 13.3331 11.3601 13.8242 10.5512 14.1592C9.74239 14.4942 8.87548 14.6667 8 14.6667ZM8 3.45333C7.29276 3.45333 6.61448 3.73428 6.11438 4.23438C5.61428 4.73448 5.33333 5.41276 5.33333 6.12C5.33333 6.29681 5.40357 6.46638 5.5286 6.5914C5.65362 6.71643 5.82319 6.78667 6 6.78667C6.17681 6.78667 6.34638 6.71643 6.4714 6.5914C6.59643 6.46638 6.66667 6.29681 6.66667 6.12C6.66667 5.85629 6.74486 5.59851 6.89137 5.37924C7.03788 5.15997 7.24612 4.98908 7.48976 4.88816C7.73339 4.78724 8.00148 4.76084 8.26012 4.81229C8.51876 4.86373 8.75634 4.99072 8.94281 5.17719C9.12928 5.36366 9.25627 5.60124 9.30771 5.85988C9.35916 6.11852 9.33276 6.38661 9.23184 6.63024C9.13092 6.87388 8.96003 7.08212 8.74076 7.22863C8.52149 7.37513 8.26371 7.45333 8 7.45333C7.82319 7.45333 7.65362 7.52357 7.5286 7.6486C7.40357 7.77362 7.33333 7.94319 7.33333 8.12V9.86C7.33333 10.0368 7.40357 10.2064 7.5286 10.3314C7.65362 10.4564 7.82319 10.5267 8 10.5267C8.17681 10.5267 8.34638 10.4564 8.4714 10.3314C8.59643 10.2064 8.66667 10.0368 8.66667 9.86V8.7C9.29333 8.53622 9.83897 8.14996 10.2017 7.61333C10.5644 7.0767 10.7194 6.4264 10.6378 5.78385C10.5561 5.1413 10.2434 4.55043 9.75801 4.12157C9.27261 3.69271 8.64771 3.45518 8 3.45333ZM7.33333 11.9267C7.33333 12.1035 7.40357 12.273 7.5286 12.3981C7.65362 12.5231 7.82319 12.5933 8 12.5933C8.17681 12.5933 8.34638 12.5231 8.4714 12.3981C8.59643 12.273 8.66667 12.1035 8.66667 11.9267C8.66667 11.7499 8.59643 11.5803 8.4714 11.4553C8.34638 11.3302 8.17681 11.26 8 11.26C7.82319 11.26 7.65362 11.3302 7.5286 11.4553C7.40357 11.5803 7.33333 11.7499 7.33333 11.9267Z" fill="#666666"/>
            </svg>

            <div className="hidden group-hover:block absolute left-1/2 transform -translate-x-1/2 bottom-6 w-64 p-2 bg-white text-gray-800 text-sm rounded shadow-lg z-10 backdrop-blur">
              <p>
                Upload a photo so we can create a unique image of you.
                Photos are only generated from user images. We have an independent database to ensure that your privacy will not be leaked.
              </p>
              {/* 箭头 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </span>
        </label>
        <p className="text-gray-600 mb-4">
          To get the best result, please use photos that meet the following:
        </p>
      </div>

      {/* 图片要求示例 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-[#F8F8F8] rounded">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <Image
              src="/personalize/face.png"
              alt="Face clearly visible"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <p className="text-sm text-gray-600">Face clearly<br />visible</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <Image
              src="/personalize/face.png"
              alt="Frontal or slight angle"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <p className="text-sm text-gray-600">Frontal or slight angle</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <Image
              src="/personalize/face.png"
              alt="Neutral expression"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <p className="text-sm text-gray-600">Neutral<br />expression</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <Image
              src="/personalize/face.png"
              alt="Well-lit and high resolution"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <p className="text-sm text-gray-600">Well-lit and<br />high resolution</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <Image
              src="/personalize/face.png"
              alt="Centered face"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <p className="text-sm text-gray-600">Centered face</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center relative">
            <Image
              src="/personalize/face.png"
              alt="Avoid group photos"
              width={64}
              height={64}
              className="w-16 h-16"
            />
            <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✕</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Avoid group photos</p>
        </div>
      </div>

      {/* 上传区域 - 借鉴UploadArea组件的UI */}
      {canUploadMore && (
        <div
          className={`rounded p-4 text-center transition-colors h-[128px] flex flex-col items-center justify-center relative ${
            isDragging ? 'border-2 border-[#012CCE]' : 'bg-[#F8F8F8]'
          }`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {isUploading ? (
            <div className="text-center w-full max-w-md mx-auto">
              <div className="w-[80%] mx-auto h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
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
                <div className="space-y-2 text-[#222222]">
                  <p>Please drag the photo in</p>
                  <p>or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 border border-[#222222] rounded"
                  >
                    Browse Files
                  </button>
                  {/* <p className="text-sm text-gray-500 mt-2">
                    {images.length === 0 ? 'Upload 1-3 photos' : `Upload ${maxImages - images.length} more photo${maxImages - images.length > 1 ? 's' : ''}`}
                  </p> */}
                </div>
              )}
            </>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {/* 已上传的图片显示 */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative">
              <div
                className="relative bg-gray-100 rounded overflow-hidden"
                style={{
                  maxWidth: '100%',
                  maxHeight: '128px',
                }}
              >
                <Image
                  src={image.previewUrl}
                  alt={`Uploaded image ${index + 1}`}
                  width={200}
                  height={200}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '128px',
                    objectFit: 'contain',
                  }}
                  className="rounded-lg"
                />
                <button
                  onClick={() => onImageDelete(image.id)}
                  className="absolute top-0 right-0 bg-white shadow-md flex items-center justify-center"
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

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default MultiImageUpload;