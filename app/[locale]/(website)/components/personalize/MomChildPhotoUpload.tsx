import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { IoCloudUploadOutline, FaRegTrashAlt } from '@/utils/icons';
import type { UploadedImage } from '../../hooks/useMultiImageUpload';

type Slot = UploadedImage | null;

export interface MomChildPhotoUploadProps {
  slots: [Slot, Slot];
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  slotDragging: [boolean, boolean];
  onSlotDragEnter: (slotIndex: 0 | 1, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotDragLeave: (slotIndex: 0 | 1, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotDragOver: (slotIndex: 0 | 1, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotDrop: (slotIndex: 0 | 1, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotFileChosen: (slotIndex: 0 | 1, file: File) => void;
  onDeleteSlot: (slotIndex: 0 | 1) => void;
}

const SLOT_LABELS: [string, string] = ['For Mom', 'For Child'];
const SLOT_PLACEHOLDER_SRC: [string, string] = ['/personalize/mom.png', '/personalize/face.png'];

const MomChildPhotoUpload: React.FC<MomChildPhotoUploadProps> = ({
  slots,
  isUploading,
  uploadProgress,
  error,
  slotDragging,
  onSlotDragEnter,
  onSlotDragLeave,
  onSlotDragOver,
  onSlotDrop,
  onSlotFileChosen,
  onDeleteSlot,
}) => {
  const input0 = useRef<HTMLInputElement>(null);
  const input1 = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const canUploadToSlot = (slotIndex: 0 | 1) => {
    const slot = slots[slotIndex];
    return !isUploading && !slot?.isUploading && !slot?.dataUrl;
  };

  const triggerInput = (slotIndex: 0 | 1) => {
    if (!canUploadToSlot(slotIndex)) {
      showToast('You can only upload 1 photo');
      return;
    }
    (slotIndex === 0 ? input0 : input1).current?.click();
  };

  const handleFileChange = (slotIndex: 0 | 1, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    onSlotFileChosen(slotIndex, f);
  };

  const thumbIndices = ([0, 1] as const).filter(i => Boolean(slots[i]));
  const thumbCount = thumbIndices.length;

  return (
    <div className="space-y-4" id="upload-area-photo">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="font-medium text-[#222222] text-[16px] leading-[24px] tracking-[0.15px]">
          Upload photos of Mom and child 🎨
        </h2>
        <span className="text-[#999999] text-[14px] leading-[20px] tracking-[0.5px]">(Upload up to 2)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {([0, 1] as const).map(slotIndex => {
          const slot = slots[slotIndex];
          const dragging = slotDragging[slotIndex];
          const busy = Boolean(slot?.isUploading) || isUploading;
          const canUpload = canUploadToSlot(slotIndex);

          return (
            <div key={slotIndex} className="flex flex-col">
              <div
                className={`rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center text-center transition-colors relative ${
                  !canUpload
                    ? 'bg-[#F3F3F3] cursor-not-allowed text-[#999999]'
                    : busy
                      ? 'bg-[#F3F3F3] cursor-wait'
                      : dragging
                        ? 'bg-[rgba(1,44,206,0.06)] border-2 border-[#012CCE]'
                        : 'bg-[#F3F3F3] cursor-pointer'
                }`}
                onDragEnter={e => {
                  if (!canUpload) {
                    e.preventDefault();
                    showToast('You can only upload 1 photo');
                    return;
                  }
                  onSlotDragEnter(slotIndex, e);
                }}
                onDragLeave={e => onSlotDragLeave(slotIndex, e)}
                onDragOver={e => {
                  if (!canUpload) {
                    e.preventDefault();
                    return;
                  }
                  onSlotDragOver(slotIndex, e);
                }}
                onDrop={e => {
                  if (!canUpload) {
                    e.preventDefault();
                    showToast('You can only upload 1 photo');
                    return;
                  }
                  onSlotDrop(slotIndex, e);
                }}
                onClick={() => {
                  if (!canUpload) {
                    showToast('You can only upload 1 photo');
                    return;
                  }
                  if (busy) return;
                  triggerInput(slotIndex);
                }}
                role="presentation"
              >
                <div className="mb-2 flex-shrink-0 pointer-events-none">
                  <Image
                    src={SLOT_PLACEHOLDER_SRC[slotIndex]}
                    alt=""
                    width={72}
                    height={72}
                    className="w-[72px] h-auto object-contain"
                    sizes="72px"
                  />
                </div>
                <p className="text-[#222222] text-[15px] font-medium mb-2 pointer-events-none">{SLOT_LABELS[slotIndex]}</p>

                <IoCloudUploadOutline className={`mx-auto text-2xl mb-1 ${canUpload ? 'text-[#222222]' : 'text-[#999999]'}`} />
                <p className={`text-[15px] ${canUpload ? 'text-[#222222]' : 'text-[#999999]'}`}>
                  Drag photo here or{' '}
                  <button
                    type="button"
                    className={`${canUpload ? 'text-[#012CCE]' : 'text-[#999999] cursor-not-allowed'}`}
                    disabled={!canUpload || busy}
                    onClick={e => {
                      e.stopPropagation();
                      if (!canUpload || busy) {
                        showToast('You can only upload 1 photo');
                        return;
                      }
                      triggerInput(slotIndex);
                    }}
                  >
                    Browse
                  </button>
                </p>
                <p className="text-[#999999] text-sm mt-2 pointer-events-none">Supports: jpeg, png, webp</p>
              </div>
              <input
                ref={slotIndex === 0 ? input0 : input1}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFileChange(slotIndex, e)}
              />
            </div>
          );
        })}
      </div>

      {isUploading && uploadProgress > 0 && (
        <div className="text-center w-full max-w-md mx-auto">
          <div className="w-[80%] mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#012CCE] transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* 已上传图片预览（统一显示在底部，沿用 Good Night 风格） */}
      {thumbCount > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
          {thumbIndices.map((slotIndex) => {
              const slot = slots[slotIndex]!;
              return (
                <div key={slot.id} className="relative flex flex-shrink-0">
                  <div className="relative w-[172px] h-[172px] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={slot.previewUrl}
                      alt={`Uploaded image ${slotIndex + 1}`}
                      className="block w-full h-full object-cover"
                    />
                    {slot.isUploading && (
                      <div
                        className="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
                        style={{ backgroundColor: 'rgba(248, 248, 248, 0.4)' }}
                      >
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#012CCE] border-t-transparent" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlot(slotIndex);
                      }}
                      type="button"
                      className="absolute top-0 right-0 z-20 flex items-center justify-center bg-white shadow-md"
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
              );
            })}
        </div>
      )}

      {error && <p className="text-[#CF0F02] text-sm">{error}</p>}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
          {toast}
        </div>
      )}
    </div>
  );
};

export default MomChildPhotoUpload;
