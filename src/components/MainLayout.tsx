import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { getActiveProject } from '../utils/localStorage';
import { initializeApiConfig } from '../utils/apiConfig';
import { usePageTitle } from '../hooks/usePageTitle';
import Sidebar from './Sidebar';
import Editor from './Editor';
import CommandPalette from './CommandPalette';
import HeaderTabs from './HeaderTabs';

const MainLayout: React.FC = () => {
  usePageTitle();

  const { 
    showCommandPalette,
    sidebarWidth,
    setSidebarWidth,
    isSidebarCollapsed,
  } = useStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    const project = getActiveProject();
    if (!project) {
      navigate('/');
      return;
    }
    
    // Initialize API configuration with project settings
    initializeApiConfig(project);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + e.clientX - startX;
      if (newWidth > 50 && newWidth < window.innerWidth * 0.5) {
        setSidebarWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Local state for sidebar visibility (Ctrl+B)
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  React.useEffect(() => {
    const handleSidebarToggle = () => {
      setSidebarVisible(v => !v);
    };
    window.addEventListener('editorql:toggleSidebar', handleSidebarToggle);
    return () => window.removeEventListener('editorql:toggleSidebar', handleSidebarToggle);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black text-gray-300">
      <HeaderTabs />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`sidebar transition-all${!sidebarVisible ? ' hidden' : ''} ${isSidebarCollapsed ? 'w-0' : ''}`}
          style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }}
        >
          <Sidebar />
        </div>

        {!isSidebarCollapsed && sidebarVisible && (
          <div
            className="resize-handle cursor-col-resize w-1 bg-gray-700 hover:bg-blue-500 transition-colors"
            onMouseDown={handleMouseDown}
          />
        )}

        <div className="flex-1 overflow-hidden">
          <Editor />
        </div>
      </div>
      {showCommandPalette && <CommandPalette />}
    </div>
  );
};

export default MainLayout;
