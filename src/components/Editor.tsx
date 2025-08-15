import {
  tailwindColors,
  tailwindColorSuggestions,
} from "../script/TailwindColor";
import registerClassCompletion from "../script/registerClassCompletion";
import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { Editor as MonacoEditor, loader } from "@monaco-editor/react";
import { useStore } from "../store";
import {
  executeMigration,
  executeAlterTable,
  executeMigrationDown,
} from "../services/api";
import { Save, RefreshCw, Map, Columns } from "lucide-react";
import SplitEditor from "./SplitEditor";
import ReloadConfirmModal from "./ReloadConfirmModal";
import { fetchBladeFile, fetchCoreFile, fetchJsFile } from "../services/api";
import { createDragAndDropStyles, initializeDragAndDrop } from "../script/dragAndDropStyles";
import {
  getBackgroundImage,
  saveBackgroundImage,
  resetBackgroundImage,

} from "../script/backgroundImageHandler";

// Initialize drag and drop styles
createDragAndDropStyles();
import ActionConfirmModal from "./ActionConfirmModal";
import { useTheme, themes } from "../context/ThemeContext";
import { handleEditorDidMount as handleEditorDidMountFn } from "../script/handleEditorDidMount";
import { useResetEditorEffect } from "../script/useResetEditorEffect";
import { RenderActionButtons } from "../script/RenderActionButtons";
import {
  handleContentChange as handleContentChangeAction,
  handleSave as handleSaveAction,
  handleMigrate as handleMigrateAction,
  handleAlter as handleAlterAction,
  handleMigrationDrop as handleMigrationDropAction,
} from "../script/editorActions";

// Helper function to validate image files
const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return validTypes.includes(file.type);
};

const Editor: React.FC = (): JSX.Element => {
  const {
    activeTabId,
    getFileContent,
    setFileDirty,
    saveFile,
    dirtyFiles,
    setDraftContent,
  } = useStore();
  // Split screen state
  const [isSplit, setIsSplit] = useState(false);
  const [splitTabId, setSplitTabId] = useState<string | null>(null);
  const [activeSplitTab, setActiveSplitTab] = useState<string | null>(null);

  // Handle split editor actions
  const handleSplitEditor = () => {
    Swal.fire({
      icon: 'error',
      title: 'Fitur Split Editor Belum Aktif',
      text: 'Fitur split editor sedang dalam pengembangan. Silakan tunggu update selanjutnya!',
      confirmButtonText: 'OK',
      showClass: {
        popup: 'animate__animated animate__shakeX'
      },
      background: '#1e293b',
      color: '#fff',
    });
  };

  // Reference untuk menyimpan content terakhir yang di-save
  const lastSavedContentRef = useRef<string>("");

  const [isDroppingMigration, setIsDroppingMigration] = useState(false);
  const [showDropMigrationModal, setShowDropMigrationModal] = useState(false);

  const [savingTabs, setSavingTabs] = useState(new Set<string>());
  const [language, setLanguage] = useState("plaintext");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isAltering, setIsAltering] = useState(false);
  // Using Swal.fire directly for notifications
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [showAlterModal, setShowAlterModal] = useState(false);
  // const [pendingAction, setPendingAction] = useState<() => Promise<void>>();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<string, { scrollTop: number; scrollLeft: number }>>({});
  const [fontSize, setFontSize] = useState(14);
  const [showMinimap, setShowMinimap] = useState(false);
  const { currentTheme } = useTheme();
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isTransparentBg, setIsTransparentBg] = useState(true);
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => {
    try {
      const savedBg = getBackgroundImage();
      return savedBg && !savedBg.startsWith('#') ? savedBg : null;
    } catch (error) {
      console.error('Failed to load background image:', error);
      return null;
    }
  });
  const [customBgColor, setCustomBgColor] = useState<string>(() => {
    try {
      const savedBg = getBackgroundImage();
      return savedBg?.startsWith('#') ? savedBg : '#1e1e1e';
    } catch (error) {
      return '#1e1e1e';
    }
  });
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    try {
      const savedOpacity = localStorage.getItem('editorBgOpacity');
      return savedOpacity ? parseFloat(savedOpacity) : 0.8;
    } catch (error) {
      return 0.8;
    }
  });
  // Toast state and setter
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  // const [editorKey, setEditorKey] = useState(0);

  const handleBackgroundImageChange = async (file: File) => {
    if (file && isValidImageFile(file)) {
      try {
        const imageUrl = await saveBackgroundImage(file);
        setCustomBgImage(imageUrl);
        setIsTransparentBg(true);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: '✨ Background berhasil diubah!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      } catch (error) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: '❌ Gagal mengubah background',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: '❌ File harus berupa gambar (JPEG, PNG, atau GIF)',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    setCustomBgColor(color);
    setIsTransparentBg(false);
    saveBackgroundImage(color);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: '🎨 Warna background berhasil diubah!',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const resetBackground = () => {
    if (isTransparentBg) {
      resetBackgroundImage();
      setCustomBgImage(null);
      setBgOpacity(0.8);
      localStorage.setItem('editorBgOpacity', '0.8');
    } else {
      setCustomBgColor('#1e1e1e');
      saveBackgroundImage('#1e1e1e');
    }
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: isTransparentBg ? '🔄 Background direset ke default' : '🔄 Warna direset ke default',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const isDirty = activeTabId ? dirtyFiles.has(activeTabId) : false;
  const isSaving = activeTabId ? savingTabs.has(activeTabId) : false;

  // Handle editor initialization (moved to script/handleEditorDidMount)
  const handleEditorDidMount = (editor: any, monaco: any) => {
    handleEditorDidMountFn({
      editor,
      monaco,
      activeTabId,
      getFileContent,
      getLanguageFromFileId,
      editorRef,
      monacoRef,
      setIsEditorReady,
    });
  };

  // Reset editor when all tabs are closed
  useEffect(
    useResetEditorEffect({
      activeTabId,
      monacoRef,
      setIsEditorReady,
    }),
    [activeTabId]
  );

  // CODE SAKRAL
  useEffect(() => {
    if (
      !activeTabId ||
      !monacoRef.current ||
      !editorRef.current ||
      !isEditorReady
    )
      return;

    const monaco = monacoRef.current;
    const editor = editorRef.current;

    const originalContent = getFileContent(activeTabId);
    const lang = getLanguageFromFileId(activeTabId);

    setLanguage(lang);

    // Register Tailwind color suggestions for Monaco completion
    if (monaco && !monaco.__tailwindCompletionRegistered) {
      registerClassCompletion(monaco, lang, tailwindColorSuggestions);
      monaco.__tailwindCompletionRegistered = true;
    }

    const colorRegex =
      /(bg|text|border)-\[?(#(?:[0-9a-fA-F]{3,8})|rgba?\([^\]]+\))\]?|(?:bg|text|border)-([a-zA-Z0-9\-]+)/g;

    // Inject color decorator CSS only once
    function injectColorDecoratorCSS() {
      if (document.getElementById("color-decorator-style")) return;
      let css = "";
      Object.entries(tailwindColors).forEach(([cls, color]) => {
        css += `.color-decorator-${cls.replace(/[^a-zA-Z0-9]/g, "-")}{
          display:inline-block;width:0.8em;height:0.8em;margin-right:4px;vertical-align:middle;border:1px solid #fff;border-radius:2px;background:${color} !important;
        }\n`;
      });
      // For hex/rgba
      css += `.color-decorator-hex{display:inline-block;width:0.8em;height:0.8em;margin-right:4px;vertical-align:middle;border:1px solid #fff;border-radius:2px;}
      `;
      const style = document.createElement("style");
      style.id = "color-decorator-style";
      style.innerHTML = css;
      document.head.appendChild(style);
    }
    injectColorDecoratorCSS();

    function getColorClass(cls: string | undefined): string | null {
      if (!cls) return null;
      if (cls.startsWith("#") || cls.startsWith("rgb"))
        return "color-decorator-hex";
      if (tailwindColors[cls])
        return `color-decorator-${cls.replace(/[^a-zA-Z0-9]/g, "-")}`;
      return null;
    }

    function addColorDecorators(model: any) {
      const value = model.getValue();
      const decorations = [];
      const lines = value.split("\n");
      for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
        const line = lines[lineNumber - 1];
        let match;
        while ((match = colorRegex.exec(line)) !== null) {
          const colorClass = getColorClass(match[2] || match[3]);
          if (colorClass) {
            const start = match.index + (match[1] ? match[1].length + 1 : 0);
            const end =
              start +
              (match[2] ? match[2].length : match[3] ? match[3].length : 0);
            decorations.push({
              range: new monaco.Range(
                lineNumber,
                start + 1,
                lineNumber,
                end + 1
              ),
              options: {
                beforeContentClassName: colorClass,
              },
            });
          }
        }
      }
      return editor.deltaDecorations([], decorations);
    }

    let colorDecorations: string[] = [];
    try {

      // Dispose old models that are not being used
      monaco.editor.getModels().forEach((m: any) => {
        if (m.uri.toString() !== activeTabId) {
          m.dispose();
        }
      });

      const uri = monaco.Uri.parse(activeTabId);
      let model = monaco.editor
        .getModels()
        .find(
          (m: { uri: { toString: () => string } }) =>
            m.uri.toString() === uri.toString()
        );

      if (!model || model.isDisposed()) {
        model = monaco.editor.createModel(originalContent, lang, uri);
      } else {
        model.setValue(originalContent);
        // Update the model's language if needed
        if (model.getLanguageId() !== lang) {
          monaco.editor.setModelLanguage(model, lang);
        }
      }

      editor.setModel(model);

      // Restore scroll position if we have it saved
      const savedPosition = scrollPositions.current[activeTabId];
      if (savedPosition) {
        editor.setScrollPosition({
          scrollTop: savedPosition.scrollTop,
          scrollLeft: savedPosition.scrollLeft
        });
      }

      // Save scroll position when scrolling
      const scrollListener = editor.onDidScrollChange(() => {
        const scrollTop = editor.getScrollTop();
        const scrollLeft = editor.getScrollLeft();
        scrollPositions.current[activeTabId] = { scrollTop, scrollLeft };
      });

      // Set initial saved content and mark as clean
      lastSavedContentRef.current = originalContent;
      setFileDirty(activeTabId, false);
      setDraftContent(activeTabId, originalContent);

      let changeTimeout: ReturnType<typeof setTimeout> | null = null;

      // Subscribe to model content changes
      const disposable = model.onDidChangeContent(() => {
        const currentContent = model.getValue();
        // Clear existing timeout
        if (changeTimeout) {
          clearTimeout(changeTimeout);
        }
        // Set new timeout to handle changes
        changeTimeout = setTimeout(() => {
          const isDifferent = currentContent !== lastSavedContentRef.current;
          setFileDirty(activeTabId, isDifferent);
          if (isDifferent) {
            setDraftContent(activeTabId, currentContent);
          }
          // Update color decorators
          if (colorDecorations.length)
            editor.deltaDecorations(colorDecorations, []);
          colorDecorations = addColorDecorators(model);
        }, 300);
      });

      // Initial color decorators
      colorDecorations = addColorDecorators(model);

      return () => {
        disposable.dispose();
        scrollListener.dispose();
        if (colorDecorations.length)
          editor.deltaDecorations(colorDecorations, []);
      };
    } catch (error) {
      console.error("Error managing editor model:", error);
    }
  }, [activeTabId, getFileContent, isEditorReady]);

  // Cleanup on unmount
  useEffect(() => {
    // Configure Monaco loader
    loader.config({ monaco: undefined });

    return () => {
      setIsEditorReady(false);

      if (monacoRef.current) {
        try {
          // Dispose all models
          monacoRef.current.editor.getModels().forEach((model: any) => {
            if (model && !model.isDisposed()) {
              model.dispose();
            }
          });
        } catch (error) {
          console.error("Error disposing models on unmount:", error);
        }
      }

      // Clear refs
      editorRef.current = null;
      monacoRef.current = null;

      // Reset Monaco loader
      loader.config({ monaco: undefined });
    };
  }, []);

  // Controlled: update draft content dan dirty flag
  const handleContentChange = (value: string | undefined) =>
    handleContentChangeAction(
      value,
      activeTabId,
      setDraftContent,
      setFileDirty,
      lastSavedContentRef
    );

  const handleSave = async () =>
    handleSaveAction(
      activeTabId,
      monacoRef,
      saveFile,
      setSavingTabs,
      setSaveError,
      setFileDirty,
      setDraftContent,
      lastSavedContentRef,
      Swal
    );

  const handleMigrate = async () =>
    handleMigrateAction(
      activeTabId,
      setIsMigrating,
      setToast,
      setShowMigrateModal,
      executeMigration
    );

  const handleAlter = async () =>
    handleAlterAction(
      activeTabId,
      setIsAltering,
      setToast,
      setShowAlterModal,
      executeAlterTable
    );

  const handleMigrationDrop = async () =>
    handleMigrationDropAction(
      activeTabId,
      setIsDroppingMigration,
      setToast,
      setShowDropMigrationModal,
      executeMigrationDown
    );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        await handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabId]);

  // Helper function to determine language
  const getLanguageFromFileId = (fileId: string): string => {
    const fileType = fileId.split("-")[0];
    const langMap: Record<string, string> = {
      model: "php",
      core: "php",
      blade: "html",
      js: "javascript",
    };

    // Configure language settings for blade files
    if (fileType === "blade") {
      if (monacoRef.current) {
        const monaco = monacoRef.current;

        // Register a new language for Vue/Blade templates
        monaco.languages.register({ id: "vue-template" });

        // Define custom tokenizer for Vue templates
        monaco.languages.setMonarchTokensProvider("vue-template", {
          defaultToken: "invalid",
          tokenizer: {
            root: [
              // Enhanced Vue/Blade attribute handling
              [
                /(:)(\w+[-\w]*)(\s*=\s*["'])/,
                ["keyword.directive", "attribute.name", "delimiter"],
              ], // :attribute handling
              [/@(\w+)(\s*=\s*["'])?/, ["keyword.directive", "delimiter"]], // @directive handling
              [
                /(v-)(\w+[-\w]*)(\s*=\s*["'])/,
                ["keyword.directive", "attribute.name", "delimiter"],
              ], // v-directive handling
              [/(\w+[-\w]*)(\s*=\s*["'])/, ["attribute.name", "delimiter"]], // Regular attributes

              // Vue expressions with enhanced handling
              [/{{/, { token: "delimiter.curly", next: "@vueExpression" }],

              // HTML tags
              [/<\/?[\w\-:.]+/, "tag"],

              // Regular attributes
              [/[\w\-:.]+\s*=/, "attribute.name"],

              // String values
              [/"([^"]*)"/, "string"],
              [/'([^']*)'/, "string"],
            ],

            // Handle complex attribute expressions
            complexExpression: [
              [/["']/, { token: "string", next: "@pop" }],
              [/{/, { token: "delimiter.bracket", next: "@jsExpression" }],
              [/[^}]+/, "variable"],
            ],

            // Handle JavaScript expressions
            jsExpression: [
              [/}/, { token: "delimiter.bracket", next: "@pop" }],
              [/"[^"]*"/, "string"],
              [/'[^']*'/, "string"],
              [
                /\b(true|false|null|undefined)\b/,
                { token: "keyword", fontStyle: "bold" },
              ],
              [
                /\b(var|let|const|if|else|return|function|=>)\b/,
                { token: "keyword", fontStyle: "bold" },
              ],
              [
                /[a-zA-Z_]\w*(?=\s*:)/,
                { token: "property", fontStyle: "italic" },
              ],
              [/\b\d+(\.\d+)?\b/, "number"],
              [/\[|\]|\{|\}|\(|\)/, "delimiter.bracket"],
              [/[.,=<>+\-*\/!?:]+/, { token: "operator", fontStyle: "bold" }],
              [/[a-zA-Z_]\w*/, "variable"],
              [/[\s\r\n]+/, "white"],
            ],

            vueExpression: [
              // Close expression
              [/}}/, { token: "delimiter.curly", next: "@pop" }],

              // Keywords
              [
                /\b(if|else|let|return|const|function|var|new|async|await)\b/,
                "keyword",
              ],

              // Numbers
              [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
              [/0[xX][0-9a-fA-F]+/, "number.hex"],
              [/\d+/, "number"],

              // Operators
              [/[=!<>]=|[<>]|\+|-|\*|\/|\?|:|\|\||&&/, "operator"],

              // Variables
              [
                /[a-zA-Z_]\w*/,
                {
                  cases: {
                    "@default": "variable",
                  },
                },
              ],

              // Strings
              [/'[^']*'/, "string"],
              [/"[^"]*"/, "string"],
            ],
          },
        });

        // Configure HTML language to handle Vue-like syntax with the new tokenizer
        monaco.languages.setLanguageConfiguration("vue-template", {
          wordPattern:
            /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
          comments: {
            blockComment: ["<!--", "-->"],
          },
          brackets: [
            ["<!--", "-->"],
            ["<", ">"],
            ["{{", "}}"],
            ["(", ")"],
            ["[", "]"],
            ["{", "}"],
          ],
          autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
            { open: "`", close: "`" },
            { open: "<!--", close: "-->" },
            { open: "{{", close: "}}" },
          ],
          surroundingPairs: [
            { open: '"', close: '"' },
            { open: "'", close: "'" },
            { open: "`", close: "`" },
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: "<", close: ">" },
          ],
          folding: {
            markers: {
              start: new RegExp("^\\s*<!--\\s*#?region\\b.*-->"),
              end: new RegExp("^\\s*<!--\\s*#?endregion\\b.*-->"),
            },
          },
          onEnterRules: [
            {
              beforeText: new RegExp(
                `<(?!(?:${[
                  "area",
                  "base",
                  "br",
                  "col",
                  "embed",
                  "hr",
                  "img",
                  "input",
                  "keygen",
                  "link",
                  "menuitem",
                  "meta",
                  "param",
                  "source",
                  "track",
                  "wbr",
                ].join("|")}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
                "i"
              ),
              afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
              action: {
                indentAction: monaco.languages.IndentAction.IndentOutdent,
              },
            },
          ],
        });
      }
    }

    return langMap[fileType] || "plaintext";
  };

  const editorOptions: any = {
    fontFamily: "JetBrains Mono, Fira Code, monospace",
    fontSize: fontSize,
    lineHeight: 1.6,
    minimap: {
      enabled: showMinimap,
      scale: 10,
      renderCharacters: false,
    },
    // Enable undo/redo functionality

    enableSnippets: false,
    formatOnPaste: true,
    formatOnType: true,
    // Set undo limit to a higher value
    undoLimit: 100,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorSmoothCaretAnimation: "on",
    cursorBlinking: "blink",
    renderWhitespace: "selection",
    bracketPairColorization: {
      enabled: true,
    },
    automaticLayout: true,
    padding: {
      top: 16,
      bottom: 16,
    },
    tabSize: 2,
    wordWrap: "on",
    guides: {
      bracketPairs: true,
      indentation: true,
    },
    roundedSelection: true,
    renderLineHighlight: "all",
    scrollbar: {
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12,
      useShadows: true,
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    suggestSelection: "first",
    suggestOnTriggerCharacters: true,
    snippetSuggestions: "inline",
    suggest: {
      localityBonus: true,
      showIcons: true,
      showStatusBar: true,
      preview: true,
      snippets: "top",
    },
  };

  useEffect(() => {
    const handlePopState = () => {
      // Cegah navigasi langsung
      window.history.pushState(null, "", window.location.pathname);
      Swal.fire({
        title: "Apakah anda yakin ingin keluar?",
        text: "Pastikan coding mu sudah tersave di editor!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak",
      }).then((result) => {
        if (result.isConfirmed) {
          const store = useStore.getState();
          store.setActiveTab("");
          store.closeAllTabs();
          window.location.href = "/";
        }
      });
    };
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.pathname);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);



  return (
    <div
      className="h-full w-full relative drop-zone"
      ref={containerRef}
      style={{
        backgroundColor: !isTransparentBg ? customBgColor : themes[currentTheme as keyof typeof themes].colors["editor.background"],
      }}
      {...(() => {
        const handleFileDrop = async (fileId: string) => {
          const store = useStore.getState();
          store.setDraftContent(fileId, '');

          try {
            if (fileId.startsWith('core-')) {
              const fileName = fileId.replace('core-', '') + '.php';
              const content = await fetchCoreFile(fileName);
              store.setCoreFileContent(fileName, content);
              store.setDraftContent(fileId, '');
              store.openFile(fileId);
            } else if (fileId.startsWith('blade-')) {
              const fileName = fileId.replace('blade-', '') + '.blade.php';
              const content = await fetchBladeFile(fileName);
              store.setBladeFileContent(fileName, content);
              store.setDraftContent(fileId, '');
              store.openFile(fileId);
            } else if (fileId.startsWith('js-')) {
              const fileName = fileId.replace('js-', '') + '.js';
              const content = await fetchJsFile(fileName);
              store.setJsFileContent(fileName, content);
              store.setDraftContent(fileId, '');
              store.openFile(fileId);
            }

            setToast({
              message: '✨ File berhasil dibuka!',
              type: 'success'
            });
          } catch (error) {
            setToast({
              message: '❌ Gagal membuka file: ' + (error instanceof Error ? error.message : 'Unknown error'),
              type: 'error'
            });
          }
        };

        const { handleDragOver, handleDragLeave, handleDrop } = initializeDragAndDrop(containerRef, handleFileDrop);

        return {
          onDragOver: handleDragOver,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop
        };
      })()}
    >
      {/* Split screen trigger button (bottom right, next to zoom controls) */}
      {/* ...existing code... */}
      {activeTabId ? (
        <>
          {/* Save button and run actions */}
          {/* Tombol aksi utama dipindahkan ke pojok kanan bawah */}
          {/* Editor or SplitEditor */}
          {!isSplit && (
            <div
              className="relative h-full w-full"
              style={{
                ...(isTransparentBg
                  ? {
                    backgroundImage: `url(${customBgImage || '/pict/senja.gif'})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                  : {
                    backgroundColor: customBgImage || '#1e1e1e',
                  }),
              }}
            >
              {isTransparentBg && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `rgba(0,0,0,${bgOpacity})`,
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                />
              )}
              <div className="absolute inset-0 z-10">
                <MonacoEditor
                  height="100%"
                  width="100%"
                  language={language}
                  value={getFileContent(activeTabId)}
                  theme="github-dark"
                  onChange={handleContentChange}
                  options={{
                    ...editorOptions,
                    fixedOverflowWidgets: true,
                  }}
                  onMount={handleEditorDidMount}
                  path={activeTabId}
                  loading={
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-red-400">Loading editor...</div>
                    </div>
                  }
                />
              </div>
            </div>
          )}
          {isSplit && (
            <SplitEditor
              leftTabId={activeTabId}
              rightTabId={splitTabId || ""}
              getFileContent={getFileContent}
              setDraftContent={setDraftContent}
              setFileDirty={setFileDirty}
              getLanguageFromFileId={getLanguageFromFileId}
              editorOptions={editorOptions}
              onMountLeft={handleEditorDidMount}
              onMountRight={handleEditorDidMount}
            />
          )}
          {/* Floating buttons */}
          <div className="absolute bottom-4 left-4 z-10 flex space-x-2">
            <button
              onClick={() => setShowReloadModal(true)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors shadow-lg"
              title="Reload file"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          {/* Zoom controls, Split screen, dan tombol aksi utama di pojok kanan bawah */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <button
                onClick={() => setShowMinimap((prev) => !prev)}
                className="p-2 rounded hover:bg-gray-800"
                title="Toggle Minimap"
              >
                <Map size={16} className={!showMinimap ? "opacity-50" : ""} />
              </button>
              <button
                onClick={() => setFontSize((prev) => Math.max(prev - 2, 8))}
                className="p-2 rounded hover:bg-gray-800"
                title="Zoom Out (Ctrl+-)"
              >
                -
              </button>
              <button
                onClick={() => setFontSize(14)}
                className="p-2 rounded hover:bg-gray-800"
                title="Reset Zoom (Ctrl+0)"
              >
                {fontSize}px
              </button>
              <button
                onClick={() => setFontSize((prev) => Math.min(prev + 2, 32))}
                className="p-2 rounded hover:bg-gray-800"
                title="Zoom In (Ctrl++)"
              >
                +
              </button>
              {/* Split screen trigger button */}
              {activeTabId && (
                <button
                  onClick={handleSplitEditor}
                  className={`ml-2 px-2 py-1 rounded ${
                    isSplit 
                      ? "bg-red-600 text-white" 
                      : "bg-gray-700 text-gray-200 hover:bg-red-700"
                  } transition-colors flex items-center`}
                  title={isSplit ? "Close Split Editor" : "Open Split Editor"}
                >
                  <Columns size={18} className="mr-1" />
                  <span>Split</span>
                  {isSplit && (
                    <span className="ml-1 text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <RenderActionButtons
                activeTabId={activeTabId}
                isMigrating={isMigrating}
                isDroppingMigration={isDroppingMigration}
                isAltering={isAltering}
                setShowMigrateModal={setShowMigrateModal}
                setShowDropMigrationModal={setShowDropMigrationModal}
                setShowAlterModal={setShowAlterModal}
              />
              <button
                onClick={() => activeTabId && handleSave()}
                disabled={!isDirty}
                className={`
                  flex items-center space-x-2 px-3 py-1.5 rounded
                  ${isDirty
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }
                  transition-colors
                `}
              >
                <Save size={16} className={isSaving ? "animate-spin" : ""} />
                <span className="text-sm">{isSaving ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
          {/* Reload confirmation modal */}
          <ReloadConfirmModal
            isOpen={showReloadModal}
            onClose={() => setShowReloadModal(false)}
            onConfirm={() => { }}
          />
          {/* Action confirm modals */}{" "}
          <ActionConfirmModal
            isOpen={showMigrateModal}
            onClose={() => setShowMigrateModal(false)}
            onConfirm={handleMigrate}
            title="Run Migration"
            message="Are you sure you want to run this migration?"
            actionLabel="Run Migration"
          />
          <ActionConfirmModal
            isOpen={showAlterModal}
            onClose={() => setShowAlterModal(false)}
            onConfirm={handleAlter}
            title="Run Alter Table"
            message="Are you sure you want to alter this table?"
            actionLabel="Run Alter"
          />
          <ActionConfirmModal
            isOpen={showDropMigrationModal}
            onClose={() => setShowDropMigrationModal(false)}
            onConfirm={handleMigrationDrop}
            title="Drop Migration"
            message="Are you sure you want to rollback this migration? This will undo the changes made by this migration."
            actionLabel="Drop"
          />
          {/* Status messages */}
          {saveError && (
            <div className="absolute bottom-4 right-4">
              <span className="text-sm text-red-400">{saveError}</span>
            </div>
          )}
          {/* Using Swal.fire for notifications */}
        </>
      ) : (
        <div
          className="h-full w-full flex items-center justify-center relative"
          style={{
            ...(isTransparentBg
              ? {
                backgroundImage: `url(${customBgImage || '/pict/senja.gif'})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
              : {
                backgroundColor: customBgImage || '#1e1e1e',
              }),
          }}
        >
          {/* Overlay hitam transparan */}
          {isTransparentBg && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(0,0,0,${bgOpacity})`,
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
          )}
          <div className="text-center relative z-10 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-600 max-w-md mx-auto">
            <div className="mb-6">
              <div className="space-y-4">
                {/* Background Options Tabs */}
                <div className="flex justify-center space-x-2 mb-4">
                  <button
                    onClick={() => setIsTransparentBg(true)}
                    className={`px-3 py-1.5 rounded-md ${
                      isTransparentBg 
                        ? "bg-red-500 text-white" 
                        : "bg-gray-700 text-gray-300"
                    } transition-all`}
                  >
                    🖼️ Image Background
                  </button>
                  <button
                    onClick={() => setIsTransparentBg(false)}
                    className={`px-3 py-1.5 rounded-md ${
                      !isTransparentBg 
                        ? "bg-red-500 text-white" 
                        : "bg-gray-700 text-gray-300"
                    } transition-all`}
                  >
                    🎨 Solid Color
                  </button>
                </div>

                {/* Image Upload Controls */}
                {isTransparentBg ? (
                  <div className="space-y-4">
                    <div className="flex justify-center items-center space-x-3">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        id="bgImageInput"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleBackgroundImageChange(file);
                          }
                        }}
                      />
                      <button
                        onClick={() => document.getElementById('bgImageInput')?.click()}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md shadow-lg transition-all flex items-center space-x-2 hover:shadow-red-500/20"
                      >
                        <span className="text-lg">🖼️</span>
                        <span>Upload Background</span>
                      </button>
                      <button
                        onClick={resetBackground}
                        className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-md shadow-lg transition-all flex items-center space-x-2 hover:shadow-gray-500/20"
                      >
                        <span className="text-lg">↩️</span>
                        <span>Reset</span>
                      </button>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <label htmlFor="opacitySlider" className="text-gray-300 text-sm">
                        🎚️ Background Opacity: {Math.round(bgOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        id="opacitySlider"
                        min="0"
                        max="1"
                        step="0.1"
                        value={bgOpacity}
                        onChange={(e) => {
                          const newOpacity = parseFloat(e.target.value);
                          setBgOpacity(newOpacity);
                          localStorage.setItem('editorBgOpacity', newOpacity.toString());
                          Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: '🎚️ Opacity berhasil diubah!',
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true
                          });
                        }}
                        className="w-full max-w-xs h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center space-x-3">
                    <input
                      type="color"
                      id="bgColorInput"
                      className="h-10 w-20 cursor-pointer rounded border-2 border-gray-600"
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      value={customBgColor}
                    />
                    <button
                      onClick={resetBackground}
                      className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-md shadow-lg transition-all flex items-center space-x-2 hover:shadow-gray-500/20"
                    >
                      <span className="text-lg">↩️</span>
                      <span>Reset Color</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-red-400 font-semibold text-lg drop-shadow-lg animate-pulse">
                ⚠️ YA AMPUN! Gak ada file yang dibuka 😭
              </p>
              <div className="text-sm bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <p className="text-green-300 mb-1">
                  📁 Cobalah buka file dulu dari 🧭 Sidebarmu itu loh
                </p>
                <p className="text-white mb-1">
                  biar gak cuma bengong 🤡
                </p>
                <p className="text-yellow-300 font-semibold">
                  💥 ayo mulai ngoding, mumpung belum kiamat! 🔥
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
