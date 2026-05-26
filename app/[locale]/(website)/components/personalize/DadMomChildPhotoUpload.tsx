import React, { useRef, useState } from 'react';
import { IoCloudUploadOutline, FaRegTrashAlt } from '@/utils/icons';
import type { UploadedImage } from '../../hooks/useMultiImageUpload';
import type { DadMomChildSlotIndex } from '../../hooks/useDadMomChildPhotoSlots';
import PersonalizePhotoUploadTips from './PersonalizePhotoUploadTips';

type Slot = UploadedImage | null;

export interface DadMomChildPhotoUploadProps {
  slots: [Slot, Slot, Slot];
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  slotDragging: [boolean, boolean, boolean];
  onSlotDragEnter: (slotIndex: DadMomChildSlotIndex, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotDragLeave: (slotIndex: DadMomChildSlotIndex, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotDragOver: (slotIndex: DadMomChildSlotIndex, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotDrop: (slotIndex: DadMomChildSlotIndex, e: React.DragEvent<HTMLDivElement>) => void;
  onSlotFileChosen: (slotIndex: DadMomChildSlotIndex, file: File) => void;
  onDeleteSlot: (slotIndex: DadMomChildSlotIndex) => void;
}

const SLOT_LABELS: [string, string, string] = ['Dad', 'Mom', 'Child'];
const SLOT_INDICES: DadMomChildSlotIndex[] = [0, 1, 2];

const DadMomChildPhotoUpload: React.FC<DadMomChildPhotoUploadProps> = ({
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
  const input2 = useRef<HTMLInputElement>(null);
  const inputRefs = [input0, input1, input2];
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const canUploadToSlot = (slotIndex: DadMomChildSlotIndex) => {
    const slot = slots[slotIndex];
    return !isUploading && !slot?.isUploading && !slot?.dataUrl;
  };

  const triggerInput = (slotIndex: DadMomChildSlotIndex) => {
    if (!canUploadToSlot(slotIndex)) {
      showToast('You can only upload 1 photo');
      return;
    }
    inputRefs[slotIndex].current?.click();
  };

  const handleFileChange = (slotIndex: DadMomChildSlotIndex, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    onSlotFileChosen(slotIndex, f);
  };

  const thumbIndices = SLOT_INDICES.filter(i => Boolean(slots[i]));
  const thumbCount = thumbIndices.length;

  return (
    <div className="space-y-4">
      <PersonalizePhotoUploadTips subtitle="Upload photos of Dad, Mom and Child" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" id="upload-area-photo">
        {SLOT_INDICES.map(slotIndex => {
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
                ref={inputRefs[slotIndex]}
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

      {thumbCount > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
          {thumbIndices.map(slotIndex => {
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
                    onClick={e => {
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

export default DadMomChildPhotoUpload;
