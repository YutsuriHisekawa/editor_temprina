import React, { useState, useRef, useCallback } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";

interface SplitEditorProps {
  leftTabId: string;
  rightTabId: string;
  getFileContent: (id: string) => string;
  setDraftContent: (id: string, value: string) => void;
  setFileDirty: (id: string, dirty: boolean) => void;
  getLanguageFromFileId: (id: string) => string;
  editorOptions: any;
  onMountLeft?: (editor: any, monaco: any) => void;
  onMountRight?: (editor: any, monaco: any) => void;
}

const SplitEditor: React.FC<SplitEditorProps> = ({
  leftTabId,
  rightTabId,
  getFileContent,
  setDraftContent,
  setFileDirty,
  getLanguageFromFileId,
  editorOptions,
  onMountLeft,
  onMountRight,
}) => {
  return (
    <div className="flex h-full w-full gap-0 md:gap-2">
      <div className="w-1/2 h-full border-r border-gray-700">
        <MonacoEditor
          height="100%"
          language={getLanguageFromFileId(leftTabId)}
          value={getFileContent(leftTabId)}
          theme="github-dark"
          options={editorOptions}
          onMount={onMountLeft}
          path={leftTabId}
          loading={
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-red-400">Loading editor...</div>
            </div>
          }
          onChange={value => {
            setDraftContent(leftTabId, value ?? "");
            setFileDirty(leftTabId, value !== getFileContent(leftTabId));
          }}
        />
      </div>
      <div className="w-1/2 h-full">
        <MonacoEditor
          height="100%"
          language={getLanguageFromFileId(rightTabId)}
          value={getFileContent(rightTabId)}
          theme="github-dark"
          options={editorOptions}
          onMount={onMountRight}
          path={rightTabId}
          loading={
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-red-400">Loading editor...</div>
            </div>
          }
          onChange={value => {
            setDraftContent(rightTabId, value ?? "");
            setFileDirty(rightTabId, value !== getFileContent(rightTabId));
          }}
        />
      </div>
    </div>
  );
};

export default SplitEditor;
