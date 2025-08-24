import { useState, useCallback } from 'react';
import { uploadApi } from '@/utils/api.js';
import type { AxiosProgressEvent, AxiosResponse } from 'axios';

const toAbsoluteUrl = (path: string): string => {
  if (!path) return path;
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

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadedFilePath?: string;
  isUploading?: boolean;
}

interface UploadResponse {
  path: string;
  url?: string;
}

const useMultiImageUpload = (maxImages: number = 3) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
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

    return true;
  };

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    try {
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
            }
          }
        }
      );

      if (!response.data || !response.data.path) {
        throw new Error('Invalid server response');
      }

      // 优先使用后端返回的完整 URL，其次回退到 path→绝对地址
      const directUrl = response.data.url;
      const absoluteUrl = directUrl || toAbsoluteUrl(response.data.path);
      return absoluteUrl;
    } catch (err: unknown) {
      let errorMessage = 'Upload failed';
      
      if (err instanceof Error) {
        if (err.message === 'ECONNABORTED') {
          errorMessage = 'Upload timed out, please try again';
        } else {
          errorMessage = err.message;
        }
      } else if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { errors?: { file?: string[] }, message?: string } } };
        console.error('Server error response:', errorResponse.response?.data);
        if (errorResponse.response?.data?.errors?.file) {
          errorMessage = errorResponse.response.data.errors.file[0];
        } else {
          errorMessage = errorResponse.response?.data?.message || 'Server Error';
        }
      } else if (err && typeof err === 'object' && 'request' in err) {
        console.error('Request error:', err.request);
        errorMessage = 'Network error, please check the network connection';
      }
      
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return [];

    // 检查是否超过最大数量
    const remainingSlots = maxImages - images.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // 生成唯一的时间戳
    const timestamp = Date.now();
    
    // 立即添加图片到列表，但标记为上传中
    const pendingImages: UploadedImage[] = filesToUpload.map((file, i) => ({
      id: `${timestamp}-${i}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true
    }));

    setImages(prev => [...prev, ...pendingImages]);

    const successfulPaths: string[] = [];

    try {
      // 逐个上传文件并更新状态
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const imageId = `${timestamp}-${i}`;
        
        try {
          const uploadedFilePath = await uploadSingleFile(file);
          
          if (uploadedFilePath) {
            // 上传成功，更新对应图片的状态
            setImages(prev => prev.map(img => 
              img.id === imageId 
                ? { ...img, uploadedFilePath, isUploading: false }
                : img
            ));
            successfulPaths.push(uploadedFilePath);
          } else {
            // 上传失败，移除该图片
            setImages(prev => prev.filter(img => img.id !== imageId));
          }
        } catch (error) {
          // 上传失败，移除该图片
          setImages(prev => prev.filter(img => img.id !== imageId));
        }
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
    return successfulPaths;
  };

  const handleImageDelete = (id: string) => {
    setImages(prev => {
      const imageToDelete = prev.find(img => img.id === id);
      if (imageToDelete) {
        // 清理预览URL
        URL.revokeObjectURL(imageToDelete.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
    setError(null);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      handleImageUpload(files);
    }
  };

  const clearAllImages = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setImages([]);
    setError(null);
  };

  // 获取所有上传的文件路径
  const getUploadedPaths = useCallback((): string[] => {
    return images
      .filter(img => img.uploadedFilePath)
      .map(img => img.uploadedFilePath!);
  }, [images]);

  return {
    images,
    isUploading,
    uploadProgress,
    error,
    isDragging,
    maxImages,
    canUploadMore: images.length < maxImages,
    handleImageUpload,
    handleImageDelete,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    clearAllImages,
    getUploadedPaths,
  };
};

export default useMultiImageUpload;
export type { UploadedImage };