import React, { useRef } from 'react';
import Image from 'next/image';
import { FaRegTrashAlt } from 'react-icons/fa';

interface UploadAreaProps {
  imageUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  isDragging: boolean;
  imageSize: { width: number; height: number };
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteImage: () => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  imageUrl,
  isUploading,
  uploadProgress,
  error,
  isDragging,
  imageSize,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileUpload,
  handleDeleteImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    handleDeleteImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`rounded p-4 text-center transition-colors min-h-[200px] flex flex-col items-center justify-center relative ${
        isDragging ? 'border-2 border-[#012CCE]' : 'bg-[#F8F8F8]'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {imageUrl ? (
        <>
          <div
            className="relative bg-gray-100 rounded overflow-hidden"
            style={{
              maxWidth: '80%',
              maxHeight: '144px',
            }}
          >
            <Image
              src={imageUrl}
              alt="Uploaded preview"
              width={imageSize.width}
              height={imageSize.height}
              style={{
                maxWidth: '100%',
                maxHeight: '144px',
                objectFit: 'contain',
              }}
              className="rounded-lg"
            />
            <button
              onClick={handleDelete}
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
        </>
      ) : (
        <>
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
                </div>
              )}
            </>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default UploadArea;
