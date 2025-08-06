import { MutableRefObject, Dispatch, SetStateAction } from "react";

interface ResetEditorEffectParams {
    activeTabId: string | null;
    monacoRef: MutableRefObject<any>;
    setIsEditorReady: Dispatch<SetStateAction<boolean>>;
}

export function useResetEditorEffect({
    activeTabId,
    monacoRef,
    setIsEditorReady,
}: ResetEditorEffectParams) {
    return () => {
        if (!activeTabId) {
            if (monacoRef.current) {
                try {
                    monacoRef.current.editor.getModels().forEach((model: any) => {
                        if (model && !model.isDisposed()) {
                            model.dispose();
                        }
                    });
                } catch (error) {
                    console.error("Error disposing models:", error);
                }
            }
            setIsEditorReady(false);
        }
    };
}
