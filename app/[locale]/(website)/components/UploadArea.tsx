import React from 'react';

interface UploadAreaProps {
  imageUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  isDragging: boolean;
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
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileUpload,
  handleDeleteImage,
}) => {
  return (
    <div
      className={`rounded-md p-8 text-center transition-colors min-h-[200px] flex flex-col items-center justify-center relative ${
        isDragging ? 'border-2 border-blue-500 bg-blue-100' : 'bg-gray-50'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {imageUrl ? (
        <>
          <div className="relative bg-gray-100 rounded overflow-hidden">
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="rounded max-h-[168px] object-contain"
            />
          </div>
          <button
            onClick={handleDeleteImage}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Delete Image
          </button>
        </>
      ) : (
        <>
          {isUploading ? (
            <div className="text-center w-full max-w-md mx-auto">
              <div className="w-[80%] mx-auto h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-blue-600 text-lg">Uploading...</p>
            </div>
          ) : (
            <>
              {isDragging ? (
                <p className="text-blue-600 text-lg">Please loosen</p>
              ) : (
                <div className="space-y-1 mb-3">
                  <p className="text-gray-600">Please drag the photo in</p>
                  <p className="text-gray-600">or</p>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="px-6 py-2 border border-gray-400 text-gray-600 rounded-md"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </>
      )}
      <input
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
