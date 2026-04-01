import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  headerActions?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-[550px]', headerActions }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex justify-center items-end md:items-center z-[1000] backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-card-bg p-6 md:p-10 rounded-t-3xl md:rounded-3xl w-full ${maxWidth} shadow-[0_25px_50px_rgba(0,0,0,0.15)] max-h-[90vh] md:max-h-[85vh] overflow-y-auto relative border border-border-color animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 duration-300`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-grow">
            {typeof title === 'string' ? <h2 className="font-serif text-[1.8rem] text-primary m-0">{title}</h2> : title}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <button onClick={onClose} className="bg-transparent border-none text-[1.4rem] cursor-pointer text-text-light transition-all hover:text-danger hover:scale-110 p-1">
              <X size={24} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
