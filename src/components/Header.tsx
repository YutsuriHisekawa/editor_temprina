import React from 'react';
import { useStore } from '../store';
import { Search, PlusCircle } from 'lucide-react';

const Header: React.FC = () => {
  const { openTabs } = useStore();
  
  return (
    <div className="grid grid-cols-[auto_1fr] h-10 bg-gray-900 border-b border-gray-700">
      {/* Left side - File actions */}
      <div className="w-[240px] flex items-center px-4 border-r border-gray-700">
        <div className="flex items-center space-x-3">
          <button 
            className="p-1.5 rounded hover:bg-gray-700 transition-colors flex items-center"
            title="New file"
          >
            <PlusCircle size={20} />
          </button>
          
          <button 
            className="p-1.5 rounded hover:bg-gray-700 transition-colors flex items-center"
            title="Search files"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Right side - Empty space for tabs */}
      <div className="flex-1"></div>
    </div>
  );
};

export default Header;