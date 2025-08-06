import React, { createContext, useContext, useState } from 'react';

export const themes = {
  'vs-dark': {
    base: 'vs-dark',
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#2d2d2d',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editor.selectionHighlightBackground': '#253b76',
      'list.activeSelectionBackground': '#094771',
      'list.hoverBackground': '#2a2d2e',
      'sideBar.background': '#252526',
      'sideBar.foreground': '#cccccc',
      'sideBar.border': '#333333',
      'sidebarSectionHeader.background': '#00000000',
      'sidebarSectionHeader.border': '#cccccc33',
      'activityBar.background': '#333333',
      'activityBar.foreground': '#ffffff',
      'statusBar.background': '#007acc',
      'statusBar.foreground': '#ffffff',
      'statusBar.border': '#333333',
      'titleBar.activeBackground': '#3c3c3c',
      'titleBar.activeForeground': '#cccccc',
      'titleBar.border': '#333333',
      'input.background': '#3c3c3c',
      'input.foreground': '#cccccc',
      'input.border': '#00000000',
      'button.background': '#0e639c',
      'button.foreground': '#ffffff',
      'button.hoverBackground': '#1177bb',
      'scrollbarSlider.background': '#79797966',
      'scrollbarSlider.hoverBackground': '#646464b3',
      'scrollbarSlider.activeBackground': '#bfbfbf66'
    }
  },
  'monokai-dimmed': {
    base: 'vs-dark',
colors: {
  // === Editor Background & Foreground ===
  'editor.background': '#1E1E1E',          // Lebih gelap, biar warna teks lebih kontras
  'editor.foreground': '#D4D4D4',          // Default text, netral abu terang

  // === Editor Syntax Highlighting ===
  'editorLineNumber.foreground': '#858585',
  'editorLineNumber.activeForeground': '#FFFFFF',
  'editorCursor.foreground': '#AEAFAD',
  'editor.lineHighlightBackground': '#2A2A2A',
  'editor.selectionBackground': '#264F78',
  'editor.selectionHighlightBackground': '#314365',
  'editor.inactiveSelectionBackground': '#3A3D41',

  // === Bracket Match ===
  'editorBracketMatch.background': '#515C6A',
  'editorBracketMatch.border': '#C586C0',

  // === Whitespace & Indent Guides ===
  'editorWhitespace.foreground': '#3B3A32',
  'editorIndentGuide.background': '#404040',
  'editorIndentGuide.activeBackground': '#707070',

  // === Gutter ===
  'editorGutter.background': '#1E1E1E',

  // === Side Bar & Panel ===
  'sideBar.background': '#252526',
  'sideBar.foreground': '#CCCCCC',
  'sideBar.border': '#2D2D2D',
  'sidebarSectionHeader.background': '#2D2D2D',
  'sidebarSectionHeader.foreground': '#FFFFFF',

  // === Activity Bar ===
  'activityBar.background': '#333333',
  'activityBar.foreground': '#FFFFFF',

  // === Status Bar ===
  'statusBar.background': '#007ACC',
  'statusBar.foreground': '#FFFFFF',

  // === Title Bar ===
  'titleBar.activeBackground': '#3C3C3C',
  'titleBar.activeForeground': '#FFFFFF',

  // === Input ===
  'input.background': '#3C3C3C',
  'input.foreground': '#FFFFFF',
  'input.border': '#555555',

  // === Buttons ===
  'button.background': '#0E639C',
  'button.foreground': '#FFFFFF',
  'button.hoverBackground': '#1177BB',

  // === List & Tree Views ===
  'list.activeSelectionBackground': '#094771',
  'list.hoverBackground': '#2A2D2E',

  // === Scrollbars ===
  'scrollbarSlider.background': '#79797933',
  'scrollbarSlider.hoverBackground': '#64646459',
  'scrollbarSlider.activeBackground': '#BFBFBF80'
}

  }
};

interface ThemeContextType {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  themeColors: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'monokai-dimmed',
  setCurrentTheme: () => {},
  themeColors: themes['monokai-dimmed'].colors
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('monokai-dimmed');

  const value = {
    currentTheme,
    setCurrentTheme,
    themeColors: themes[currentTheme as keyof typeof themes].colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
