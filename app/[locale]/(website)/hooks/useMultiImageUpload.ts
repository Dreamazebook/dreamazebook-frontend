import { useState, useCallback } from 'react';
import { uploadApi } from '@/utils/api.js';
import type { AxiosProgressEvent, AxiosResponse } from 'axios';

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadedFilePath?: string;
}

interface UploadResponse {
  path: string;
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

      return response.data.path;
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

  const handleImageUpload = async (files: File[]) => {
    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    // 检查是否超过最大数量
    const remainingSlots = maxImages - images.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const newImages: UploadedImage[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const uploadedFilePath = await uploadSingleFile(file);
        
        if (uploadedFilePath) {
          const previewUrl = URL.createObjectURL(file);
          newImages.push({
            id: `${Date.now()}-${i}`,
            file,
            previewUrl,
            uploadedFilePath
          });
        }
      }

      setImages(prev => [...prev, ...newImages]);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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