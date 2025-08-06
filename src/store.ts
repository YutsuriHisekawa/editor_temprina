import { create } from 'zustand';
import { mockLaravelFiles } from './mocks/laravelFiles';
import { getMockContent } from './mocks/fileContents';
import { saveFile as apiSaveFile } from './services/api';

export interface LaravelModel {
    file: string;
    model?: boolean;
    table?: boolean;
    view?: boolean;
    content?: string;
}

export interface File {
    id: string;
    name: string;
    content?: string;
    isDirectory: boolean;
    children?: File[];
    language?: string;
}

// Add utility function
export const flattenFiles = (files: File[]): File[] => {
    let result: File[] = [];

    files.forEach(file => {
        result.push(file);
        if (file.children) {
            result = result.concat(flattenFiles(file.children));
        }
    });

    return result;
}

interface Store {
    files: File[];
    openTabs: string[];
    selectedFileId: string | null;
    activeTabId: string | null;
    sidebarWidth: number;
    isSidebarCollapsed: boolean;
    showCommandPalette: boolean;
    laravelFiles: typeof mockLaravelFiles | null;
    isLoading: boolean;
    hasLoaded: boolean;
    coreFiles: Record<string, string>;
    bladeFiles: Record<string, string>;  // Fixed syntax error
    jsFiles: Record<string, string>;  // Add this
    modelActions: Record<string, Record<string, string>>;
    dirtyFiles: Set<string>; // Add this
    draftContents: Record<string, string>; // Add this
    undoStacks: Record<string, string[]>;  // Add this
    redoStacks: Record<string, string[]>;  // Add this

    // Methods
    openFile: (fileId: string) => void;
    closeTab: (fileId: string) => void;
    setActiveTab: (fileId: string) => void;
    setSidebarWidth: (width: number) => void;
    toggleSidebar: () => void;
    toggleCommandPalette: () => void;
    getFileContent: (fileId: string) => string;
    setLaravelFiles: (files: typeof mockLaravelFiles) => void;
    setLoading: (loading: boolean) => void;
    setCoreFileContent: (filename: string, content: string) => void;
    setBladeFileContent: (filename: string, content: string) => void;
    setJsFileContent: (filename: string, content: string) => void;  // Add this
    setModelActionContent: (modelName: string, action: string, content: string) => void;
    setFileDirty: (fileId: string, isDirty: boolean) => void; // Add this
    setDraftContent: (fileId: string, content: string) => void; // Add this
    getDraftContent: (fileId: string) => string | null; // Add this
    clearDraftContent: (fileId: string) => void; // Add this
    getUndoStack: (fileId: string) => string[];  // Add this
    getRedoStack: (fileId: string) => string[];  // Add this
    setUndoStack: (fileId: string, stack: string[]) => void;  // Add this
    setRedoStack: (fileId: string, stack: string[]) => void;  // Add this
    saveFile: (fileId: string, content: string) => Promise<void>; // Updated
    closeAllTabs: () => void; // Add this
}

export const useStore = create<Store>((set, get) => ({
    files: [],
    openTabs: [],
    selectedFileId: null,
    activeTabId: null,
    sidebarWidth: 240,
    isSidebarCollapsed: false,
    showCommandPalette: false,
    laravelFiles: mockLaravelFiles,
    isLoading: false,
    hasLoaded: false,
    coreFiles: {},
    bladeFiles: {},
    jsFiles: {},
    modelActions: {},
    dirtyFiles: new Set(), // Add this
    draftContents: {},
    undoStacks: {},  // Add this
    redoStacks: {},  // Add this

    openFile: (fileId: string) => {
        set(state => {
            if (!state.openTabs.includes(fileId)) {
                return {
                    openTabs: [...state.openTabs, fileId],
                    selectedFileId: fileId,
                    activeTabId: fileId
                };
            }
            return {
                selectedFileId: fileId,
                activeTabId: fileId
            };
        });
    },

    closeTab: (fileId: string) => {
        set(state => {
            const newTabs = state.openTabs.filter(id => id !== fileId);
            return {
                openTabs: newTabs,
                activeTabId: newTabs.length ? newTabs[newTabs.length - 1] : null,
                selectedFileId: newTabs.length ? newTabs[newTabs.length - 1] : null
            };
        });
    },

    setActiveTab: (fileId: string) => set({ activeTabId: fileId, selectedFileId: fileId }),
    setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
    toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    toggleCommandPalette: () => set(state => ({ showCommandPalette: !state.showCommandPalette })),
    getFileContent: (fileId: string) => {
        const state = get();
        // Check for draft content first
        const draft = state.getDraftContent(fileId);
        if (draft !== null) {
            return draft;
        }

        // If no draft, get the original content
        if (fileId.startsWith('core-')) {
            const filename = fileId.split('core-')[1] + '.php';
            return state.coreFiles[filename] || '';
        }
        if (fileId.startsWith('blade-')) {
            const filename = fileId.split('blade-')[1] + '.blade.php';
            return state.bladeFiles[filename] || '';
        }
        if (fileId.startsWith('js-')) {
            const filename = fileId.split('js-')[1] + '.js';
            return state.jsFiles[filename] || '';
        }
        if (fileId.startsWith('model-')) {
            const [_, modelName, action] = fileId.split('-');
            if (action && state.modelActions[modelName]?.[action]) {
                return state.modelActions[modelName][action];
            }
        }
        return getMockContent(fileId);
    },
    setLaravelFiles: (files) => set({
        laravelFiles: files,
        hasLoaded: true
    }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setCoreFileContent: (filename: string, content: string) =>
        set(state => ({
            coreFiles: { ...state.coreFiles, [filename]: content }
        })),
    setBladeFileContent: (filename: string, content: string) =>
        set(state => ({
            bladeFiles: { ...state.bladeFiles, [filename]: content }
        })),
    setJsFileContent: (filename: string, content: string) =>
        set(state => ({
            jsFiles: { ...state.jsFiles, [filename]: content }
        })),
    setModelActionContent: (modelName: string, action: string, content: string) =>
        set(state => ({
            modelActions: {
                ...state.modelActions,
                [modelName]: {
                    ...state.modelActions[modelName],
                    [action]: content
                }
            }
        })),
    setFileDirty: (fileId: string, isDirty: boolean) =>
        set(state => ({
            dirtyFiles: isDirty
                ? new Set(state.dirtyFiles).add(fileId)
                : new Set([...state.dirtyFiles].filter(id => id !== fileId))
        })),
setDraftContent: (fileId: string, content: string) =>
    set(state => ({
        draftContents: { ...state.draftContents, [fileId]: content }
    })),
    getDraftContent: (fileId: string) => get().draftContents[fileId] || null,
    clearDraftContent: (fileId: string) =>
        set(state => {
            const { [fileId]: _, ...rest } = state.draftContents;
            return { draftContents: rest };
        }),
    getUndoStack: (fileId: string) => get().undoStacks[fileId] || [],
    getRedoStack: (fileId: string) => get().redoStacks[fileId] || [],
    setUndoStack: (fileId: string, stack: string[]) =>
        set(state => ({
            undoStacks: { ...state.undoStacks, [fileId]: stack }
        })),
    setRedoStack: (fileId: string, stack: string[]) =>
        set(state => ({
            redoStacks: { ...state.redoStacks, [fileId]: stack }
        })),
    saveFile: async (fileId: string, content: string) => {
        if (!fileId || !fileId.includes('-')) {
            console.error(`Invalid fileId: ${fileId}`);
            return;
        }

        await apiSaveFile(fileId, content);

        // Update the appropriate content store after successful save
        const [type, name] = fileId.split('-');

        switch (type) {
            case 'core':
                get().setCoreFileContent(`${name}.php`, content);
                break;
            case 'blade':
                get().setBladeFileContent(`${name}.blade.php`, content);
                break;
            case 'js':
                get().setJsFileContent(`${name}.js`, content);
                break;
            case 'model':
                const [modelName, action] = name.split('-');
                if (action) {
                    get().setModelActionContent(modelName, action, content);
                } else {
                    console.error(`Invalid model fileId: ${fileId}`);
                }
                break;
            default:
                console.error(`Unsupported file type: ${type}`);
                return;
        }

        get().setFileDirty(fileId, false);
        get().clearDraftContent(fileId); // Clear draft after successful save
    },
    closeAllTabs: () => {
        set({
            openTabs: [],
            activeTabId: null,
            selectedFileId: null
        });
    },
}));

export function getFileById(files: File[], id: string) {
    return files.find(file => file.id === id);
}

export const getDraftContent = (fileId: string) => useStore.getState().draftContents[fileId] || null;
