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
          <span className="text-gray-400 inline-flex items-center group relative font-normal">
            <FaQuestionCircle className="w-4 h-4 ml-2" />
            <div className="hidden group-hover:block absolute left-0 top-6 w-64 p-2 bg-white/80 text-gray-800 text-sm rounded shadow-lg z-10 backdrop-blur">
              <p className="mb-2">
                Upload photos so we can create a unique image of you. Your privacy is ensured.
              </p>
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