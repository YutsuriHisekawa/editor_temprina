import React from 'react';

interface ReloadConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ReloadConfirmModal: React.FC<ReloadConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Reload File?</h2>
        <p className="text-gray-400 text-sm mb-6">
          Any unsaved changes will be lost. Are you sure you want to reload the file?
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
            Ignore & Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReloadConfirmModal;
