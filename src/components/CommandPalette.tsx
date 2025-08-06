import React, { useState, useEffect, useRef } from 'react';
import { useStore, flattenFiles } from '../store';
import { Search, File, Command as CommandIcon } from 'lucide-react';

interface CommandItem {
  id: string;
  type: 'file' | 'command';
  title: string;
  action: () => void;
}

const CommandPalette: React.FC = () => {
  const { 
    files, 
    toggleCommandPalette, 
    openFile,
    commandHistory
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const flatFiles = flattenFiles(files).filter(file => !file.isDirectory);
  
  // Built-in commands
  const builtInCommands: CommandItem[] = [
    {
      id: 'new-file',
      type: 'command',
      title: 'New File',
      action: () => {
        console.log('New file command');
        toggleCommandPalette();
      }
    },
    {
      id: 'toggle-theme',
      type: 'command',
      title: 'Toggle Theme',
      action: () => {
        useStore.getState().toggleTheme();
        toggleCommandPalette();
      }
    },
    {
      id: 'toggle-sidebar',
      type: 'command',
      title: 'Toggle Sidebar',
      action: () => {
        useStore.getState().toggleSidebar();
        toggleCommandPalette();
      }
    }
  ];
  
  // File commands
  const fileCommands: CommandItem[] = flatFiles.map(file => ({
    id: file.id,
    type: 'file',
    title: file.path,
    action: () => {
      openFile(file.id);
      toggleCommandPalette();
    }
  }));
  
  // Combine all commands
  const allCommands = [...builtInCommands, ...fileCommands];
  
  // Filter commands based on search term
  const filteredCommands = allCommands.filter(command => 
    command.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        toggleCommandPalette();
        break;
    }
  };
  
  return (
    <div 
      className="fixed inset-0 flex items-start justify-center pt-20 bg-black bg-opacity-50 z-50"
      onClick={() => toggleCommandPalette()}
    >
      <div 
        className="command-palette w-2/3 max-w-2xl bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center p-3 border-b border-gray-700 bg-gray-900">
          <Search size={16} className="mr-2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type to search files or commands..."
            className="flex-grow bg-transparent border-none outline-none text-white"
            autoFocus
          />
        </div>
        
        {/* Results list */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`
                  flex items-center px-4 py-2 cursor-pointer
                  ${index === activeIndex ? 'bg-blue-800 bg-opacity-30' : 'hover:bg-gray-700'}
                `}
                onClick={() => command.action()}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {command.type === 'file' ? (
                  <File size={16} className="mr-2 text-blue-400" />
                ) : (
                  <CommandIcon size={16} className="mr-2 text-purple-400" />
                )}
                <span className="text-sm text-gray-300">{command.title}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;