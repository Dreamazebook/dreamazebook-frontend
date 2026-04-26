import { useState, useCallback } from 'react';

const toAbsoluteUrl = (raw: string): string => {
  if (!raw) return raw as unknown as string;
  let path = raw;
  const trimmed = raw.trim();
  // 兼容 JSON 数组字符串，例如: "[\"https://...\"]" 或 "[\"user_uploads/...\"]"
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

interface UploadedImage {
  id: string;
  file?: File;
  previewUrl: string;
  dataUrl?: string; // inline base64 data URL for JSON sending
  isUploading?: boolean;
}

interface UploadOptions {
  allowedTypes?: string[];
  maxFileSize?: number; // bytes
}

const useMultiImageUpload = (maxImages: number = 1, options: UploadOptions = {}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    const allowedTypes = options.allowedTypes && options.allowedTypes.length > 0
      ? options.allowedTypes
      : [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp'
        ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPEG, JPG, PNG or WebP file only');
      return false;
    }

    const maxSize = typeof options.maxFileSize === 'number' ? options.maxFileSize : 20 * 1024 * 1024; // default 20MB
    if (file.size > maxSize) {
      setError('Pictures cannot exceed 20M');
      return false;
    }

    return true;
  };

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    try {
      const FRONTEND_PREVIEW = process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === 'true';
      if (FRONTEND_PREVIEW) {
        // 预览模式直接返回占位图绝对路径
        return toAbsoluteUrl('/personalize/face.png');
      }
      // 改为本地转 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return dataUrl;
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
          const dataUrl = await uploadSingleFile(file);
          
          if (dataUrl) {
            // 上传成功，更新对应图片的状态
            setImages(prev => prev.map(img => 
              img.id === imageId 
                ? { ...img, dataUrl, isUploading: false }
                : img
            ));
            successfulPaths.push(dataUrl);
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
        // 清理预览URL（仅对 blob: 链接执行）
        if (imageToDelete.previewUrl && imageToDelete.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageToDelete.previewUrl);
        }
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
      if (image.previewUrl && image.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
    setImages([]);
    setError(null);
  };

  // 获取所有上传的文件路径
  const getUploadedPaths = useCallback((): string[] => {
    return images
      .filter(img => img.dataUrl)
      .map(img => img.dataUrl!);
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
    // 使用已有 URL 初始化图片展示
    initializeWithUrls: (urls: string[]) => {
      const timestamp = Date.now();
      const initialImages: UploadedImage[] = urls.filter(Boolean).slice(0, maxImages).map((u, i) => {
        const absolute = toAbsoluteUrl(u);
        return {
          id: `${timestamp}-init-${i}`,
          previewUrl: absolute,
          uploadedFilePath: absolute,
          isUploading: false,
        } as UploadedImage;
      });
      setImages(initialImages);
      setError(null);
    },
  };
};

export default useMultiImageUpload;
export type { UploadedImage };