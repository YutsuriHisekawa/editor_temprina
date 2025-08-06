import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
    `}>
      {type === 'success' ? (
        <CheckCircle size={20} className="text-white" />
      ) : (
        <XCircle size={20} className="text-white" />
      )}
      <span className="text-white">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
