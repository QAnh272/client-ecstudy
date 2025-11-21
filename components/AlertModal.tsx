'use client';

import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined className="text-5xl text-green-500" />;
      case 'error':
        return <CloseCircleOutlined className="text-5xl text-red-500" />;
      case 'warning':
        return <ExclamationCircleOutlined className="text-5xl text-orange-500" />;
      default:
        return <ExclamationCircleOutlined className="text-5xl text-blue-500" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Lỗi';
      case 'warning':
        return 'Cảnh báo';
      default:
        return 'Thông báo';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-[slideIn_0.3s_ease-out]">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
          {getTitle()}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
          {message}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
        >
          OK
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
