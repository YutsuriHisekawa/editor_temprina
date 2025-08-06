import React, { useState, useEffect } from 'react';
import { useStore, File, LaravelModel } from '../store';
import {
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  Eye,
  Code2,
  AlertTriangle,
  BookOpen,
  Settings,
  TestTube,
  Clock,
  Trash2,
  RefreshCw,
  X as XIcon
} from 'lucide-react';
import { getActiveProject } from '../utils/localStorage';
import { initializeApiConfig } from '../utils/apiConfig';
import { getMockContent } from '../mocks/fileContents';
import { getFileIcon } from './FileIcons';
import { fetchLaravelFiles, fetchCoreFile, fetchBladeFile, fetchJsFile, fetchModelAction, createFile, fetchLast10Rows, executeTruncate } from '../services/api';
import CreateFileModal from './CreateFileModal';
import Last10RowsModal from './Last10RowsModal';
import TruncateConfirmModal from './TruncateConfirmModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Toast from './Toast';
import SettingsModal from './SettingsModal';
import { useTheme } from '../context/ThemeContext';
import { getApiConfig } from '../utils/apiConfig';

const getDisplayName = (filename: string): string => {
  return filename
    .replace('.blade.php', '')
    .replace('.php', '')
    .replace('.js', '')
};

const MODEL_ACTIONS = [
  { id: 'migration', label: 'Migration', icon: Code2, color: 'text-purple-400' },
  { id: 'alter', label: 'Alter', icon: AlertTriangle, color: 'text-yellow-400' },
  { id: 'basic', label: 'Basic', icon: BookOpen, color: 'text-red-400' },
  { id: 'custom', label: 'Custom', icon: Settings, color: 'text-gray-400' },
  { id: 'test', label: 'Test', icon: TestTube, color: 'text-green-400' },
  { id: 'last10', label: 'Last 10 Rows', icon: Clock, color: 'text-cyan-400' },
  { id: 'truncate', label: 'Truncate', icon: RefreshCw, color: 'text-orange-400' },
  { id: 'delete', label: 'Delete', icon: Trash2, color: 'text-red-400' }
];

const deleteFile = async (type: 'model' | 'blade' | 'javascript', filename: string) => {
  const config = getApiConfig();
  const baseUrl = config.baseUrl;

  const endpoints = {
    model: `${baseUrl}/trio/${filename}`,
    blade: `${baseUrl}/blades/${filename}`,
    javascript: `${baseUrl}/javascript/${filename}`
  };

  const response = await fetch(endpoints[type], {
    method: 'DELETE',
    headers: {
      ...config.headers,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
};

interface FileTreeItemProps {
  file: File;
  level: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ file, level }) => {
  const { selectedFileId, openFile } = useStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const { themeColors } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileClick = () => {
    if (file.isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      // Selalu fetch file terbaru dari API sebelum openFile
      const store = useStore.getState();
      // Reset draft content sebelum set file content dan openFile
      store.setDraftContent(file.id, '');
      if (file.id.startsWith('core-')) {
        fetchCoreFile(file.name)
          .then(content => {
            store.setCoreFileContent(file.name, content);
            store.setDraftContent(file.id, '');
            openFile(file.id);
          })
          .catch(console.error);
      } else if (file.id.startsWith('blade-')) {
        fetchBladeFile(file.name)
          .then(content => {
            store.setBladeFileContent(file.name, content);
            store.setDraftContent(file.id, '');
            openFile(file.id);
          })
          .catch(console.error);
      } else if (file.id.startsWith('js-')) {
        fetchJsFile(file.name)
          .then(content => {
            store.setJsFileContent(file.name, content);
            store.setDraftContent(file.id, '');
            openFile(file.id);
          })
          .catch(console.error);
      } else {
        // Untuk file model, selalu fetch dari API juga
        fetchCoreFile(file.name)
          .then(content => {
            store.setCoreFileContent(file.name, content);
            store.setDraftContent(file.id, '');
            openFile(file.id);
          })
          .catch(console.error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      let type: 'model' | 'blade' | 'javascript';
      let filename = file.name.replace('.blade.php', '').replace('.js', '').replace('.php', '');

      if (file.id.startsWith('blade-')) {
        type = 'blade';
      } else if (file.id.startsWith('js-')) {
        type = 'javascript';
      } else {
        type = 'model';
      }

      await deleteFile(type, filename);
      // Refresh file list
      const data = await fetchLaravelFiles();
      useStore.getState().setLaravelFiles(data);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    setShowDeleteModal(false);
  };

  const isSelected = selectedFileId === file.id;

  return (
    <>
      <div>
        <div 
          className={`file-tree-item flex items-center px-2 py-0.5 cursor-pointer select-none transition-colors duration-100 relative ${!file.isDirectory ? 'draggable-file' : ''}`}
          style={{
            paddingLeft: `${level * 12 + 8}px`,
            backgroundColor: isSelected ? themeColors.sidebarSelected : 'transparent',
            color: themeColors.sidebarForeground
          }}
          draggable={!file.isDirectory}
          onDragStart={(e) => {
            if (!file.isDirectory) {
              e.dataTransfer.setData('text/plain', file.id);
              e.dataTransfer.effectAllowed = 'copy';
              // Add a custom class to the body during drag
              document.body.classList.add('dragging-file');
            }
          }}
          onDragEnd={() => {
            document.body.classList.remove('dragging-file');
          }}
          onMouseEnter={(e) => {
            setIsHovered(true);
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = themeColors.sidebarHover;
            }
          }}
          onMouseLeave={(e) => {
            setIsHovered(false);
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          onClick={handleFileClick}
        >
          {file.isDirectory ? (
            <>
              <span className="mr-1 flex items-center">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <FolderOpen size={16} className="mr-2 text-yellow-400" />
            </>
          ) : (
            <span className="mr-2 ml-4">
              {getFileIcon(file.id)}
            </span>
          )}          <span className="truncate text-sm flex-1">{getDisplayName(file.name)}</span>
          {!file.isDirectory && isHovered && (
            <button
              className="p-1 text-gray-400 hover:text-white absolute right-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {file.isDirectory && isExpanded && file.children && (
          <div>
            {file.children.map((child) => (
              <FileTreeItem key={child.id} file={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        fileName={file.name}
        type={file.id.startsWith('blade-') ? 'blade' : file.id.startsWith('js-') ? 'javascript' : 'model'}
      />
    </>
  );
};

const ModelItem: React.FC<{ model: LaravelModel }> = ({ model }) => {
  const { openFile, selectedFileId } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [showLast10Modal, setShowLast10Modal] = useState(false);
  const [last10Data, setLast10Data] = useState<Record<string, any>[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showTruncateModal, setShowTruncateModal] = useState(false);

  const handleActionClick = (action: string) => async (e: React.MouseEvent) => {
    e.stopPropagation();
    const modelName = model.file.replace('.php', '');

    if (action === 'last10') {
      setLoading(action);
      try {
        const data = await fetchLast10Rows(modelName);
        setLast10Data(data);
        setShowLast10Modal(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(null);
      }
      return;
    }

    if (action === 'truncate') {
      setShowTruncateModal(true);
      return;
    }

    const actionFileId = `model-${modelName}-${action}`;
    setLoading(action);
    try {
      const content = await fetchModelAction(modelName, action);
      useStore.getState().setModelActionContent(modelName, action, content);
      openFile(actionFileId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleTruncate = async () => {
    const modelName = model.file.replace('.php', '');
    setLoading('truncate');
    try {
      await executeTruncate(modelName);
      setToast({
        message: `Table ${modelName} truncated successfully`,
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: `Failed to truncate ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading(null);
      setShowTruncateModal(false);
    }
  };

  const fileId = `model-${model.file}`;
  const isSelected = selectedFileId === fileId;

  return (
    <>
      <div
        className={`file-tree-item flex items-center px-2 py-1 cursor-pointer select-none
          ${isSelected ? 'bg-red-800 bg-opacity-30' : 'hover:bg-gray-700'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="mr-1 flex items-center">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <div className="flex items-center space-x-2">
          {model.model && <Database size={16} className="text-green-400" />}
          {model.table && <Table size={16} className="text-red-400" />}
          {model.view && <Eye size={16} className="text-purple-400" />}
        </div>        <span className="ml-2 truncate text-sm font-medium">{getDisplayName(model.file)}</span>
      </div>

      {isExpanded && (
        <div className="border-l border-gray-700 ml-8 py-1">
          {MODEL_ACTIONS.map(action => {
            const Icon = action.icon;
            const isLoading = loading === action.id;
            return (
              <div
                key={action.id} className={`
                  group px-2 py-1 flex items-center space-x-2 text-sm
                  ${isLoading ? 'text-gray-500' : 'text-gray-400 hover:text-white hover:bg-gray-700'} 
                  cursor-pointer
                `}
                onClick={!isLoading ? handleActionClick(action.id) : undefined}
              >
                <Icon size={14} className={`${action.color} ${isLoading ? 'animate-spin' : ''} group-hover:text-white`} />
                <span className="transition-colors">{action.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <Last10RowsModal
        isOpen={showLast10Modal}
        onClose={() => setShowLast10Modal(false)}
        data={last10Data}
        modelName={model.file}
      />

      <TruncateConfirmModal
        isOpen={showTruncateModal}
        onClose={() => setShowTruncateModal(false)}
        onConfirm={handleTruncate}
        modelName={model.file}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};


const Sidebar: React.FC = () => {
  const { laravelFiles, isLoading, hasLoaded, setLoading } = useStore();
  const [activeTab, setActiveTab] = useState<'blade' | 'javascript' | 'core' | 'models'>('blade'); // Default to blade for frontend
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const { themeColors } = useTheme();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setVisible(v => !v);
        // Dispatch custom event for editor fullscreen
        window.dispatchEvent(new Event('editorql:toggleSidebar'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isFrontend = laravelFiles?.role === 'frontend';
  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      console.log('Initializing Sidebar...');
      setLoading(true);
      // Try to initialize API config if not already done
      try {
        const activeProject = getActiveProject();
        console.log('Active Project:', activeProject);
        if (activeProject) {
          initializeApiConfig(activeProject);
        }
        fetchLaravelFiles()
          .then(data => {
            console.log('Fetched Laravel Files:', data);
            useStore.getState().setLaravelFiles(data);
            // If frontend role, ensure we're on a valid tab
            if (data.role === 'frontend' && !['blade', 'javascript'].includes(activeTab)) {
              setActiveTab('blade');
            }
          })
          .catch(error => console.error('Error fetching Laravel files:', error))
          .finally(() => setLoading(false));
      } catch (error) {
        console.error('Error initializing API:', error);
        setLoading(false);
      }
    }
  }, [hasLoaded, isLoading]);

  useEffect(() => {
    if (!laravelFiles) return;
    console.log('laravelFiles or activeTab changed:', { laravelFiles, activeTab });
    if (laravelFiles.role === 'frontend' && !['blade', 'javascript'].includes(activeTab)) {
      setActiveTab('blade');
    }
  }, [laravelFiles, activeTab]);

  useEffect(() => {
    console.log('laravelFiles atau activeTab berubah:', { laravelFiles, activeTab });
    if (laravelFiles?.role === 'frontend' && !['blade', 'javascript'].includes(activeTab)) {
      setActiveTab('blade');
    }

  }, [laravelFiles, activeTab]);

  useEffect(() => {
    console.log('searchQuery berubah:', searchQuery);

    filteredContent();
  }, [searchQuery]);

  useEffect(() => {
    handleReloadSidebar();
  }, []);

  const handleCreateFile = async (filename: string) => {
    await createFile(filename);
    // Refresh file list
    fetchLaravelFiles()
      .then(data => {
        useStore.getState().setLaravelFiles(data);
      })
      .catch(console.error);
  };

  const handleReloadSidebar = async () => {
    setIsReloading(true);
    try {
      const data = await fetchLaravelFiles();
      useStore.getState().setLaravelFiles(data);
    } catch (error) {
      console.error('Error reloading sidebar:', error);
    } finally {
      setIsReloading(false);
      setShowSettingsModal(false);
    }
  };

  const renderContent = () => {
    if (!laravelFiles) return null;

    switch (activeTab) {
      case 'core':
        return (
          <>
            <div className="p-2 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Core Files
            </div>
            {laravelFiles.cores.map((file, index) => (
              <FileTreeItem
                key={index}
                file={{
                  id: `core-${file.replace('.php', '')}`,
                  name: file,
                  isDirectory: false,
                  content: getMockContent(`core-${file.replace('.php', '')}`)
                }}
                level={0}
              />
            ))}
          </>
        );

      case 'blade':
        return laravelFiles.blades.map((file, index) => (
          <FileTreeItem
            key={index}
            file={{
              id: `blade-${file.replace('.blade.php', '')}`,
              name: file,
              isDirectory: false,
              content: getMockContent(`blade-${file.replace('.blade.php', '')}`)
            }}
            level={0}
          />
        ));

      case 'javascript':
        return laravelFiles.js.map((file, index) => (
          <FileTreeItem
            key={index}
            file={{
              id: `js-${file.replace('.js', '')}`,
              name: file,
              isDirectory: false,
              content: getMockContent(`js-${file.replace('.js', '')}`)
            }}
            level={0}
          />
        ));

      case 'models':
        return laravelFiles.models.map((model, index) => (
          <ModelItem
            key={index}
            model={{
              ...model,
              content: getMockContent(`model-${model.file.replace('.php', '')}`)
            }}
          />
        ));

      default:
        return null;
    }
  };

  const filteredContent = () => {
    if (!laravelFiles || !searchQuery.trim()) {
      return renderContent();
    }

    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'core':
        return (
          <>
            <div className="p-2 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Core Files
            </div>
            {laravelFiles.cores
              .filter(file => file.toLowerCase().includes(query))
              .map((file, index) => (
                <FileTreeItem
                  key={index}
                  file={{
                    id: `core-${file.replace('.php', '')}`,
                    name: file,
                    isDirectory: false,
                    content: getMockContent(`core-${file.replace('.php', '')}`)
                  }}
                  level={0}
                />
              ))}
          </>
        );
      case 'blade':
        return laravelFiles.blades
          .filter(file => file.toLowerCase().includes(query))
          .map((file, index) => (
            <FileTreeItem
              key={index}
              file={{
                id: `blade-${file.replace('.blade.php', '')}`,
                name: file,
                isDirectory: false,
                content: getMockContent(`blade-${file.replace('.blade.php', '')}`)
              }}
              level={0}
            />
          ));
      case 'javascript':
        return laravelFiles.js
          .filter(file => file.toLowerCase().includes(query))
          .map((file, index) => (
            <FileTreeItem
              key={index}
              file={{
                id: `js-${file.replace('.js', '')}`,
                name: file,
                isDirectory: false,
                content: getMockContent(`js-${file.replace('.js', '')}`)
              }}
              level={0}
            />
          ));
      case 'models':
        return laravelFiles.models
          .filter(model => model.file.toLowerCase().includes(query))
          .map((model, index) => (
            <ModelItem
              key={index}
              model={{
                ...model,
                content: getMockContent(`model-${model.file.replace('.php', '')}`)
              }}
            />
          ));
      default:
        return null;
    }
  };


  if (!visible) return null;

  return (
    <div className="h-full bg-black flex flex-col border-r" style={{
      backgroundColor: themeColors['sideBar.background'],
      borderColor: themeColors['sideBar.border'],
      color: themeColors['sideBar.foreground']
    }}>
      {/* Header with search */}
      <div
        className="flex bg-black items-center px-3 py-2 border-b"
        style={{ borderColor: themeColors['sideBar.border'] }}
      >
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 rounded text-sm"
            style={{
              backgroundColor: themeColors['input.background'],
              color: themeColors['input.foreground'],
              border: `1px solid ${themeColors['input.border']}`,
            }}
          />
        </div>
      </div>

      {/* Tab navigation */}
      <div
        className="flex bg-black items-center px-2 py-1 border-b"
        style={{ borderColor: themeColors['sideBar.border'] }}
      >
        {isFrontend ? (
          <>
            <button
              className={`px-3 py-1 text-sm rounded ${activeTab === 'blade'
                ? 'bg-red-600'
                : 'hover:bg-opacity-20 hover:bg-white'
                }`}
              onClick={() => setActiveTab('blade')}
              title="Blade"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
              </svg>
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${activeTab === 'javascript'
                  ? 'bg-red-600'
                  : 'hover:bg-opacity-20 hover:bg-white'
                }`}
              onClick={() => setActiveTab('javascript')}
              title="JavaScript"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              className={`px-3 py-1 text-sm rounded ${activeTab === 'blade'
                ? 'bg-red-600'
                : 'hover:bg-opacity-20 hover:bg-white'
                }`}
              onClick={() => setActiveTab('blade')}
              title="Blade"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
              </svg>
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${activeTab === 'javascript'
                  ? 'bg-red-600'
                  : 'hover:bg-opacity-20 hover:bg-white'
                }`}
              onClick={() => setActiveTab('javascript')}
              title="JavaScript"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${activeTab === 'models'
                ? 'bg-red-600'
                : 'hover:bg-opacity-20 hover:bg-white'
                }`}
              onClick={() => setActiveTab('models')}
              title="Models"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${activeTab === 'core'
                ? 'bg-red-600'
                : 'hover:bg-opacity-20 hover:bg-white'
                }`}
              onClick={() => setActiveTab('core')}
              title="Core"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* File tree */}
      <div className="flex-1 bg-black overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-white">Loading...</div>
        ) : (
          filteredContent()
        )}
      </div>

      {/* Bottom actions */}
      <div
        className="border-t p-2 bg-black flex items-center justify-between"
        style={{ borderColor: themeColors['sideBar.border'] }}
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700"
        >
          New File
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="p-1 rounded hover:bg-opacity-20 hover:bg-white"
        >
          <Settings size={16} />
        </button>
      </div>

      <CreateFileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateFile}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onReload={handleReloadSidebar}
        isReloading={isReloading}
      />
    </div>
  );
};

export default Sidebar;