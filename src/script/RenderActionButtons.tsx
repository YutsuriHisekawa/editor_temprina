import React from "react";
import { Play, RefreshCw } from "lucide-react";

interface RenderActionButtonsProps {
  activeTabId: string | null;
  isMigrating: boolean;
  isDroppingMigration: boolean;
  isAltering: boolean;
  setShowMigrateModal: (v: boolean) => void;
  setShowDropMigrationModal: (v: boolean) => void;
  setShowAlterModal: (v: boolean) => void;
}

export const RenderActionButtons: React.FC<RenderActionButtonsProps> = ({
  activeTabId,
  isMigrating,
  isDroppingMigration,
  isAltering,
  setShowMigrateModal,
  setShowDropMigrationModal,
  setShowAlterModal,
}) => {
  if (!activeTabId) return null;
  if (activeTabId.includes("-migration")) {
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => setShowMigrateModal(true)}
          className={`
            flex items-center space-x-2 px-3 py-1.5 rounded 
            ${
              isMigrating ? "bg-gray-700" : "bg-green-600 hover:bg-green-700"
            } 
            text-white transition-colors
          `}
          disabled={isMigrating || isDroppingMigration}
        >
          <Play size={16} className={isMigrating ? "animate-spin" : ""} />
          <span className="text-sm">
            {isMigrating ? "Running..." : "Run Migration"}
          </span>
        </button>
        <button
          onClick={() => setShowDropMigrationModal(true)}
          className={`
            flex items-center space-x-2 px-3 py-1.5 rounded 
            ${
              isDroppingMigration
                ? "bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            } 
            text-white transition-colors
          `}
          disabled={isMigrating || isDroppingMigration}
        >
          <RefreshCw
            size={16}
            className={isDroppingMigration ? "animate-spin" : ""}
          />
          <span className="text-sm">
            {isDroppingMigration ? "Rolling Back..." : "Drop"}
          </span>
        </button>
      </div>
    );
  }
  if (activeTabId.includes("-alter")) {
    return (
      <button
        onClick={() => setShowAlterModal(true)}
        className={`
          flex items-center space-x-2 px-3 py-1.5 rounded
          ${isAltering ? "bg-gray-700" : "bg-yellow-600 hover:bg-yellow-700"}
          text-white transition-colors mr-2
        `}
        disabled={isAltering}
      >
        <Play size={16} className={isAltering ? "animate-spin" : ""} />
        <span className="text-sm">
          {isAltering ? "Running..." : "Run Alter"}
        </span>
      </button>
    );
  }
  return null;
};
