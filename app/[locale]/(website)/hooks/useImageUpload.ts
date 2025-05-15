import { useState } from 'react';
import { uploadApi } from '@/utils/api.js';
import type { AxiosProgressEvent, AxiosResponse } from 'axios';

interface UploadResponse {
  path: string;
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
      'image/gif',
      'audio/mpeg',
      'video/mp4',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPG、PNG、GIF、MP3、MP4、PDF、DOC or DOCX file only');
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
    } catch (err: any) {
      let errorMessage = 'Upload failed';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out, please try again';
      } else if (err.response) {
        // 服务器返回错误
        console.error('Server error response:', err.response.data);
        if (err.response.data?.errors?.file) {
          errorMessage = err.response.data.errors.file[0];
        } else {
          errorMessage = err.response.data?.message || 'Server Error';
        }
      } else if (err.request) {
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
  };
};

export default useImageUpload;