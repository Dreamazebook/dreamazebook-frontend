import { useState } from 'react';
import { uploadApi } from '@/utils/api.js';
import type { AxiosProgressEvent, AxiosResponse } from 'axios';

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dreamazebook.com/api';
  let origin = 'https://api.dreamazebook.com';
  try { origin = new URL(apiUrl).origin; } catch {}
  return `${origin}/${cleanPath}`;
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
      const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true';
      // 仅前端预览：跳过上传，直接生成本地 blob 预览和伪路径
      if (FRONTEND_PREVIEW) {
        const previewUrl = URL.createObjectURL(file);
        setImageUrl(previewUrl);
        return {
          file,
          previewUrl,
          uploadedFilePath: '/personalize/face.png',
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'aiface');

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const response: AxiosResponse<UploadResponse> = await uploadApi.post(
        '/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (e: AxiosProgressEvent) => {
            if (e.total) {
              const progress = Math.round((e.loaded * 100) / e.total);
              setUploadProgress(progress);
              console.log(`Upload progress: ${progress}%`);
            }
          }
        }
      );

      console.log('Upload response:', response);

      if (!response.data || !response.data.path) {
        throw new Error('Invalid server response');
      }

      // 保存上传后的文件路径
      const uploadedFilePath = response.data.path;
      
      // 创建本地预览URL
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);

      // 返回上传的文件信息
      return {
        file,
        previewUrl,
        uploadedFilePath
      };
    } catch (err: unknown) {
      let errorMessage = 'Upload failed';
      
      if (err instanceof Error) {
        if (err.message === 'ECONNABORTED') {
        errorMessage = 'Upload timed out, please try again';
        } else {
          errorMessage = err.message;
        }
      } else if (err && typeof err === 'object' && 'response' in err) {
        // 服务器返回错误
        const errorResponse = err as { response?: { data?: { errors?: { file?: string[] }, message?: string } } };
        console.error('Server error response:', errorResponse.response?.data);
        if (errorResponse.response?.data?.errors?.file) {
          errorMessage = errorResponse.response.data.errors.file[0];
        } else {
          errorMessage = errorResponse.response?.data?.message || 'Server Error';
        }
      } else if (err && typeof err === 'object' && 'request' in err) {
        // 请求发送失败
        console.error('Request error:', err.request);
        errorMessage = 'Network error, please check the network connection';
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