import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TruncateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modelName: string;
}

const TruncateConfirmModal: React.FC<TruncateConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  modelName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center gap-3 mb-4 text-yellow-500">
          <AlertTriangle size={24} />
          <h2 className="text-lg font-semibold">Confirm Truncate Table</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to truncate <span className="text-white font-medium">{modelName}</span>? 
          This will permanently delete ALL data from the table.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 rounded"
          >
            Yes, Truncate Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruncateConfirmModal;
