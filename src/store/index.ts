import { create } from 'zustand';

export interface LaravelModel {
  file: string;
  model: boolean;
  table: boolean;
  alias: boolean;
  view: boolean;
}

export interface LaravelFiles {
  models: LaravelModel[];
  js: string[];
  blades: string[];
  cores: string[];
  role?: 'frontend' | 'backend' | 'full';
}

export interface File {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
  isDirectory: boolean;
  children?: File[];
}

interface EditorState {
  // UI State
  showCommandPalette: boolean;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  selectedFileId: string | null;
  activeTabId: string | null;

  // Files and Structure
  files: File[];
  openTabs: string[]; // Array of file IDs
  laravelModels: LaravelModel[];

  // Editor State
  editorTheme: 'vs-dark' | 'light' | 'monokai-dimmed' | 'github-light' | 'github-dark';

  // Commands
  commandHistory: string[];

  // Actions
  toggleCommandPalette: () => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  addFile: (file: File) => void;
  updateFileContent: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  openFile: (id: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  toggleTheme: () => void;
  addCommand: (command: string) => void;
  setLaravelModels: (models: LaravelModel[]) => void;
}

export const useStore = create<EditorState>((set) => ({
  // Initial State
  showCommandPalette: false,
  sidebarWidth: 240,
  isSidebarCollapsed: false,
  selectedFileId: null,
  activeTabId: null,
  files: [],
  openTabs: [],
  laravelModels: [],
  editorTheme: 'monokai-dimmed',
  commandHistory: [],

  // Actions
  toggleCommandPalette: () => set((state) => ({ showCommandPalette: !state.showCommandPalette })),
  setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  addFile: (file: File) => set((state) => ({ files: [...state.files, file] })),

  updateFileContent: (id: string, content: string) => set((state) => {
    const updateContent = (files: File[]): File[] => {
      return files.map(file => {
        if (file.id === id) {
          return { ...file, content };
        }
        if (file.children) {
          return { ...file, children: updateContent(file.children) };
        }
        return file;
      });
    };

    return { files: updateContent(state.files) };
  }),

  deleteFile: (id: string) => set((state) => {
    const removeFile = (files: File[]): File[] => {
      return files.filter(file => {
        if (file.id === id) {
          return false;
        }
        if (file.children) {
          file.children = removeFile(file.children);
        }
        return true;
      });
    };

    const openTabs = state.openTabs.filter(tabId => tabId !== id);
    const activeTabId = state.activeTabId === id ?
      (openTabs.length > 0 ? openTabs[0] : null) : state.activeTabId;

    return {
      files: removeFile(state.files),
      openTabs,
      activeTabId
    };
  }),

  openFile: (id: string) => set((state) => {
    if (!state.openTabs.includes(id)) {
      return {
        openTabs: [...state.openTabs, id],
        activeTabId: id
      };
    }
    return { activeTabId: id };
  }),

  closeTab: (id: string) => set((state) => {
    const openTabs = state.openTabs.filter(tabId => tabId !== id);
    let activeTabId = state.activeTabId;

    if (state.activeTabId === id) {
      const closedIndex = state.openTabs.indexOf(id);
      activeTabId = openTabs.length > 0 ?
        openTabs[Math.min(closedIndex, openTabs.length - 1)] : null;
    }

    return { openTabs, activeTabId };
  }),

  setActiveTab: (id: string) => set({ activeTabId: id }),

  toggleTheme: () => set((state) => ({
    editorTheme: state.editorTheme === 'vs-dark' ? 'light' : 'vs-dark'
  })),

  addCommand: (command: string) => set((state) => ({
    commandHistory: [command, ...state.commandHistory].slice(0, 10)
  })),

  setLaravelModels: (models: LaravelModel[]) => set({ laravelModels: models })
}));

export const flattenFiles = (files: File[]): File[] => {
  let result: File[] = [];
  for (const file of files) {
    result.push(file);
    if (file.children) {
      result = result.concat(flattenFiles(file.children));
    }
  }
  return result;
};

export const getFileById = (files: File[], id: string): File | null => {
  const flatFiles = flattenFiles(files);
  return flatFiles.find(file => file.id === id) || null;
};