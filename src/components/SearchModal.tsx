import React, { useState, useEffect } from 'react';
import { Search, File, X } from 'lucide-react';
import { useStore } from '../store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; type: string }[]>([]);
  const { laravelFiles, openFile } = useStore();

  useEffect(() => {
    if (!search.trim() || !laravelFiles) {
      setResults([]);
      return;
    }

    const searchLower = search.toLowerCase();
    const matches = [
      ...laravelFiles.cores.map(file => ({ id: `core-${file.replace('.php', '')}`, name: file, type: 'Core' })),
      ...laravelFiles.blades.map(file => ({ id: `blade-${file.replace('.blade.php', '')}`, name: file, type: 'Blade' })),
      ...laravelFiles.js.map(file => ({ id: `js-${file.replace('.js', '')}`, name: file, type: 'JavaScript' })),
      ...laravelFiles.models.map(model => ({ id: `model-${model.file}`, name: model.file, type: 'Model' }))
    ].filter(item => item.name.toLowerCase().includes(searchLower));

    setResults(matches);
  }, [search, laravelFiles]);

  const handleSelect = (result: typeof results[0]) => {
    openFile(result.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[20vh]">
      <div className="bg-gray-800 rounded-lg w-[600px] max-h-[60vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent border-none outline-none text-white"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X size={16} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-4 py-2 hover:bg-gray-700 flex items-center text-left"
              onClick={() => handleSelect(result)}
            >
              <File size={16} className="mr-2 text-gray-400" />
              <span className="flex-1">{result.name}</span>
              <span className="text-xs text-gray-500">{result.type}</span>
            </button>
          ))}
          {search && !results.length && (
            <div className="p-4 text-gray-500 text-center">
              No matches found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
