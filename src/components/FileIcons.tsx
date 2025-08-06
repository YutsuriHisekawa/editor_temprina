import React from 'react';
import { 
  FileType2, 
  FileCode, 
  Database,
  Sheet,
  FileJson,
  Settings,
  Layout
} from 'lucide-react';

export const getFileIcon = (fileId: string) => {
  const [type] = fileId.split('-');
  
  switch (type) {
    case 'model':
      return <Database size={16} className="text-green-400" />;
    case 'blade':
      return <Layout size={16} className="text-orange-400" />;
    case 'js':
      return <FileCode size={16} className="text-yellow-400" />;
    case 'core':
      return <Settings size={16} className="text-blue-400" />;
    case 'json':
      return <FileJson size={16} className="text-purple-400" />;
    case 'css':
      return <Sheet size={16} className="text-pink-400" />;
    default:
      return <FileType2 size={16} className="text-gray-400" />;
  }
};
