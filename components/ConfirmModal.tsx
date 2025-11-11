import React from 'react';
import { XIcon } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText: string;
  confirmColor?: 'blue' | 'green' | 'red' | 'yellow';
  icon?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  confirmColor = 'blue', 
  icon 
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    blue: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    red: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    yellow: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" aria-label="Close modal">
            <XIcon className="w-6 h-6"/>
          </button>
        </div>
        <div className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${colorClasses[confirmColor]}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;