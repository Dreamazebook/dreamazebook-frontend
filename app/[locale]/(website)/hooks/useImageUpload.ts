import { useState } from 'react';

const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPG or PNG files only');
      return false;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError('Pictures cannot exceed 2M');
      return false;
    }

    setError(null);
    return true;
  };

  const handleUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      setIsUploading(false);
      const uploadedImageUrl = URL.createObjectURL(file);
      setImageUrl(uploadedImageUrl);
    });

    xhr.addEventListener('error', () => {
      setIsUploading(false);
      setError('Failed to upload the image.');
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  const handleDrop = (e: React.DragEvent, onFileSelect: (file: File) => void) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
      handleUpload(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, onFileSelect: (file: File) => void) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      onFileSelect(file);
      handleUpload(file);
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