import { MutableRefObject } from "react";

export function handleContentChange(
  value: string | undefined,
  activeTabId: string | null,
  setDraftContent: (id: string, value: string) => void,
  setFileDirty: (id: string, dirty: boolean) => void,
  lastSavedContentRef: MutableRefObject<string>
) {
  if (!activeTabId) return;
  setDraftContent(activeTabId, value ?? "");
  setFileDirty(activeTabId, value !== lastSavedContentRef.current);
}

export async function handleSave(
  activeTabId: string | null,
  monacoRef: MutableRefObject<any>,
  saveFile: (id: string, content: string) => Promise<void>,
  setSavingTabs: React.Dispatch<React.SetStateAction<Set<string>>>,
  setSaveError: (msg: string | null) => void,
  setFileDirty: (id: string, dirty: boolean) => void,
  setDraftContent: (id: string, value: string) => void,
  lastSavedContentRef: MutableRefObject<string>,
  Swal: any
) {
  if (!activeTabId) return;
  const model = monacoRef.current?.editor.getModel(
    monacoRef.current.Uri.parse(activeTabId)
  );
  if (!model) {
    console.log("Cannot save: no model found for tab", activeTabId);
    return;
  }
  const content = model.getValue();
  if (!content) {
    console.log("Cannot save: no content");
    return;
  }
  setSavingTabs((prev) => new Set(prev).add(activeTabId));
  setSaveError(null);
  try {
    await saveFile(activeTabId, content);
    lastSavedContentRef.current = content;
    setFileDirty(activeTabId, false);
    setDraftContent(activeTabId, content);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "File saved successfully!",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "#10B981",
      color: "#ffffff",
      customClass: {
        popup: "rounded-lg shadow-lg",
        title: "text-white text-sm font-medium",
      },
    });
  } catch (error: any) {
    console.error("❌ Save failed:", error);
    setSaveError(error instanceof Error ? error.message : "Failed to save");
  } finally {
    setSavingTabs((prev) => {
      const next = new Set(prev);
      next.delete(activeTabId);
      return next;
    });
  }
}

export async function handleMigrate(
  activeTabId: string | null,
  setIsMigrating: (v: boolean) => void,
  setToast: (t: { message: string; type: "success" | "error" }) => void,
  setShowMigrateModal: (v: boolean) => void,
  executeMigration: (modelName: string) => Promise<void>
) {
  if (!activeTabId) return;
  setIsMigrating(true);
  try {
    const modelName = activeTabId.split("-")[1];
    await executeMigration(modelName);
    setToast({ message: "Migration executed successfully", type: "success" });
  } catch (error: any) {
    setToast({
      message: `Failed to execute migration: ${error instanceof Error ? error.message : "Unknown error"}`,
      type: "error",
    });
  } finally {
    setIsMigrating(false);
    setShowMigrateModal(false);
  }
}

export async function handleAlter(
  activeTabId: string | null,
  setIsAltering: (v: boolean) => void,
  setToast: (t: { message: string; type: "success" | "error" }) => void,
  setShowAlterModal: (v: boolean) => void,
  executeAlterTable: (modelName: string) => Promise<void>
) {
  if (!activeTabId) return;
  setIsAltering(true);
  try {
    const modelName = activeTabId.split("-")[1];
    await executeAlterTable(modelName);
    setToast({ message: "Alter table executed successfully", type: "success" });
  } catch (error: any) {
    setToast({
      message: `Failed to alter table: ${error instanceof Error ? error.message : "Unknown error"}`,
      type: "error",
    });
  } finally {
    setIsAltering(false);
    setShowAlterModal(false);
  }
}

export async function handleMigrationDrop(
  activeTabId: string | null,
  setIsDroppingMigration: (v: boolean) => void,
  setToast: (t: { message: string; type: "success" | "error" }) => void,
  setShowDropMigrationModal: (v: boolean) => void,
  executeMigrationDown: (modelName: string) => Promise<void>
) {
  if (!activeTabId) return;
  setIsDroppingMigration(true);
  try {
    const modelName = activeTabId.split("-")[1];
    await executeMigrationDown(modelName);
    setToast({ message: "Migration rolled back successfully", type: "success" });
  } catch (error: any) {
    setToast({
      message: `Failed to rollback migration: ${error instanceof Error ? error.message : "Unknown error"}`,
      type: "error",
    });
  } finally {
    setIsDroppingMigration(false);
    setShowDropMigrationModal(false);
  }
}
