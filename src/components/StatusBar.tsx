import React from 'react';
import { useStore, getFileById } from '../store';
import { Smile, GitBranch, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const StatusBar: React.FC = () => {
  const { activeTabId, files } = useStore();
  const { themeColors } = useTheme();
  
  const activeFile = activeTabId ? getFileById(files, activeTabId) : null;
  const totalFiles = files.length;
  const totalTabs = useStore().openTabs.length;
  
  return (
    <div 
      className="flex items-center h-6 px-2 text-xs border-t" 
      style={{ 
        backgroundColor: themeColors['statusBar.background'],
        borderColor: themeColors['statusBar.border'],
        color: themeColors['statusBar.foreground']
      }}
    >
      <div className="flex items-center px-2">
        <GitBranch size={12} className="mr-1" />
        <span>main</span>
      </div>
      
      <div className="flex items-center px-2 border-l" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
        <Smile size={12} className="mr-1" />
        <span>Files: {totalFiles} | Open: {totalTabs}</span>
      </div>
      
      <div className="ml-auto flex items-center">
        {activeFile && (
          <div className="px-2 border-l" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <span>{activeFile.language || 'plaintext'}</span>
          </div>
        )}
        
        <div className="px-2 border-l" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <span>UTF-8</span>
        </div>
        
        <div className="flex items-center px-2 border-l" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <Bell size={12} className="mr-1" />
          <span>{totalTabs}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;