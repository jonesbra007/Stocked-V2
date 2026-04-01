import React from 'react';
import Modal from '@/components/ui/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="mt-4 mb-8 text-text-main text-[0.95rem] leading-relaxed">
        {message}
      </div>
      <div className="flex justify-end gap-4">
        <button 
          onClick={onCancel}
          className="bg-hover-bg text-text-main border-none py-2.5 px-6 rounded-lg font-semibold text-[0.9rem] hover:bg-border-color transition-colors"
        >
          {cancelText}
        </button>
        <button 
          onClick={() => {
            onConfirm();
            onCancel();
          }}
          className={`border-none py-2.5 px-6 rounded-lg font-semibold text-[0.9rem] text-white transition-colors ${
            isDestructive 
              ? 'bg-danger hover:bg-red-600' 
              : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
