// ./components/custom/Modal.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

type ModalProps = {
  children: React.ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
};

export function Modal({ children, title, open, onClose }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "max-h-[85vh] w-[90vw] max-w-[450px]",
            "bg-white rounded-md shadow-lg focus:outline-none",
            // Add overflow to handle large content
            "overflow-auto flex flex-col",
            // Animation classes
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]"
          )}
        >
          <Dialog.Title className="text-lg font-semibold m-0 p-6 pb-0">
            {title}
          </Dialog.Title>
          <div className="p-6 flex-1 overflow-auto">
            {children}
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}