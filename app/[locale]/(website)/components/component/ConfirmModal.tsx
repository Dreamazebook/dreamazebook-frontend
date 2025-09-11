'use client'

import React from 'react';
import { IoCloseOutline } from "react-icons/io5";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({ open, title = 'Important tips', description, cancelText = 'Cancel', confirmText = 'Continue editing', onCancel, onConfirm }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div
        className="relative z-10 bg-white rounded-[4px] shadow-xl flex flex-col box-border gap-4"
        style={{ width: 400, height: 228, padding: '24px 24px 12px 24px' }}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-base font-medium text-[#222222]">{title}</h3>
          <button onClick={onCancel} className="text-2xl leading-none text-[#222222] hover:text-gray-700"><IoCloseOutline /></button>
        </div>

        <div className="text-[#222222] text-base font-normal flex-1 overflow-auto">
          {description}
        </div>

        <div className="flex items-center justify-end gap-4 mt-auto">
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-[4px] border border-[#000000] text-[#222222] bg-white hover:bg-gray-80"
            style={{ width: 120, height: 44, padding: '8px 16px', gap: 10, borderWidth: 1 }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-[4px] bg-[#222222] text-[#F5E3E3] hover:bg-gray-800"
            style={{ width: 160, height: 44, padding: '12px 16px', gap: 10, opacity: 1 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


