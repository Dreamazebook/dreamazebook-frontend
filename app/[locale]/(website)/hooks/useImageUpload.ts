import { useState } from 'react';
import { getApiOrigin } from '@/utils/apiBaseUrl';
// Switched to inline data URL approach (no direct upload)

interface UploadResponse {
  path: string;
}

const toAbsoluteUrl = (raw: string): string => {
  if (!raw) return raw as unknown as string;
  let path = raw;
  const trimmed = raw.trim();
  // 兼容 JSON 数组字符串
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        path = arr[0];
      }
    } catch {}
  }
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (cleanPath.startsWith('user_uploads/')) {
    return `https://s3-pro-dre002.s3.us-east-1.amazonaws.com/${cleanPath}`;
  }
  return `${getApiOrigin()}/${cleanPath}`;
}

const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPEG, JPG, PNG or WebP file only');
      return false;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError('Pictures cannot exceed 20M');
      return false;
    }

    setError(null);
    return true;
  };

  const handleUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 统一改为读取 Data URL
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return {
        file,
        previewUrl,
        uploadedFilePath: dataUrl,
      };
    } catch (err: unknown) {
      let errorMessage = 'Upload failed';
      
      if (err instanceof Error) {
        if (err.message === 'ECONNABORTED') {
        errorMessage = 'Upload timed out, please try again';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, onFileSelect: (file: File) => void) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, onFileSelect: (file: File) => void) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      onFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDeleteImage = () => {
    setImageUrl(null);
  };

  return {
    imageUrl,
    isUploading,
    uploadProgress,
    error,
    isDragging,
    handleUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileUpload,
    handleDeleteImage,
    initializeWithUrl: (url: string | null | undefined) => {
      if (!url) return;
      const absolute = toAbsoluteUrl(url);
      setImageUrl(absolute);
      setError(null);
    }
  };
};

export default useImageUpload;