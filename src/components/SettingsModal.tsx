import React, { useState } from 'react';
import { RefreshCw, PlayCircle, Plus, Archive, FileUp } from 'lucide-react';
import { executeFirstDeploy, generateBasicModel, executeBackupProject, executeGenerateMigration } from '../services/api';
import Toast from './Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  isReloading: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onReload, isReloading }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showMigrationConfirm, setShowMigrationConfirm] = useState(false);
  const [isGeneratingMigration, setIsGeneratingMigration] = useState(false);

  const handleFirstDeploy = async () => {
    setIsDeploying(true);
    try {
      await executeFirstDeploy();
      setToast({
        message: 'First deploy executed successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: `First deploy failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleGenerateClick = () => {
    setShowGenerateConfirm(true);
  };

  const handleGenerateConfirm = async () => {
    setIsGenerating(true);
    try {
      await generateBasicModel();
      setToast({
        message: 'Basic model generated successfully',
        type: 'success'
      });
      setShowGenerateConfirm(false);
    } catch (error) {
      setToast({
        message: `Failed to generate model: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackupConfirm = async () => {
    setIsBackingUp(true);
    try {
      await executeBackupProject();
      setToast({
        message: 'Project backup completed successfully',
        type: 'success'
      });
      setShowBackupConfirm(false);
    } catch (error) {
      setToast({
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleGenerateMigration = async () => {
    setIsGeneratingMigration(true);
    try {
      await executeGenerateMigration();
      setToast({
        message: 'Migration generated successfully',
        type: 'success'
      });
      setShowMigrationConfirm(false);
    } catch (error) {
      setToast({
        message: `Migration generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsGeneratingMigration(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      {showGenerateConfirm ? (
        <div className="bg-gray-800 rounded-lg shadow-xl w-96 p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Generate Basic Model</h3>
          <p className="text-gray-400 mb-4">
            This will generate a new basic model. Are you sure you want to continue?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowGenerateConfirm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateConfirm}
              disabled={isGenerating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center space-x-2"
            >
              <Plus size={16} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>
        </div>
      ) : showBackupConfirm ? (
        <div className="bg-gray-800 rounded-lg shadow-xl w-96 p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Backup Project</h3>
          <p className="text-gray-400 mb-4">
            This will create a backup of your entire project. Continue?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowBackupConfirm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
              disabled={isBackingUp}
            >
              Cancel
            </button>
            <button
              onClick={handleBackupConfirm}
              disabled={isBackingUp}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center space-x-2"
            >
              <Archive size={16} className={isBackingUp ? 'animate-spin' : ''} />
              <span>{isBackingUp ? 'Backing up...' : 'Backup'}</span>
            </button>
          </div>
        </div>
      ) : showMigrationConfirm ? (
        <div className="bg-gray-800 rounded-lg shadow-xl w-96 p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Generate Migration</h3>
          <p className="text-gray-400 mb-4">
            This will generate a new migration based on your models. Continue?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowMigrationConfirm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
              disabled={isGeneratingMigration}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateMigration}
              disabled={isGeneratingMigration}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center space-x-2"
            >
              <FileUp size={16} className={isGeneratingMigration ? 'animate-spin' : ''} />
              <span>{isGeneratingMigration ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-xl w-96">
          <div className="border-b border-gray-700 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-200">Settings</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              &times;
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <button
              onClick={onReload}
              disabled={isReloading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            >
              <RefreshCw size={16} className={isReloading ? 'animate-spin' : ''} />
              <span>{isReloading ? 'Reloading...' : 'Reload Sidebar'}</span>
            </button>

            <button
              onClick={handleFirstDeploy}
              disabled={isDeploying}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
            >
              <PlayCircle size={16} className={isDeploying ? 'animate-spin' : ''} />
              <span>{isDeploying ? 'Deploying...' : 'First Deploy'}</span>
            </button>

            <button
              onClick={handleGenerateClick}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              <Plus size={16} />
              <span>Generate Basic Model</span>
            </button>

            <button
              onClick={() => setShowMigrationConfirm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
            >
              <FileUp size={16} />
              <span>Generate Migration</span>
            </button>

            <button
              onClick={() => setShowBackupConfirm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              <Archive size={16} />
              <span>Backup Project</span>
            </button>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SettingsModal;
