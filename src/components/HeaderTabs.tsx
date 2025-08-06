import React from "react";
import kawaiGif from "../pict/kawai.gif";
import { X } from "lucide-react";
import { useStore } from "../store";
import { getFileIcon } from "./FileIcons";
import { useTheme } from "../context/ThemeContext";

const HeaderTabs: React.FC = () => {
  const {
    openTabs,
    activeTabId,
    closeTab,
    setActiveTab,
    sidebarWidth,
    dirtyFiles,
  } = useStore();
  const { themeColors } = useTheme();

  const getFileName = (fileId: string) => {
    const [type, ...nameParts] = fileId.split("-");
    const name = nameParts.join("-");

    // Add file extensions based on type
    switch (type) {
      case "model":
        return `${name}.php`;
      case "blade":
        return `${name}.blade.php`;
      case "js":
        return `${name}.js`;
      case "core":
        return `${name}.php`;
      default:
        return name;
    }
  };

  // Local state for sidebar visibility (Ctrl+B)
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  React.useEffect(() => {
    const handleSidebarToggle = () => {
      setSidebarVisible((v) => !v);
    };
    window.addEventListener("editorql:toggleSidebar", handleSidebarToggle);
    return () =>
      window.removeEventListener("editorql:toggleSidebar", handleSidebarToggle);
  }, []);

  return (
    <div
      className="flex h-10 border-b"
      style={{
        backgroundColor: themeColors["titleBar.activeBackground"],
        borderColor: themeColors["titleBar.border"],
      }}
    >
      {/* Sidebar width placeholder */}
      {sidebarVisible && (
        <div
          className="shrink-0 bg-black border-r flex items-center justify-between relative overflow-hidden"
          style={{
            width: sidebarWidth,
            borderColor: themeColors["titleBar.border"],
          }}
        >
          {/* Running text (marquee) on the left */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "calc(100% - 40px)", // leave space for gif
              whiteSpace: "nowrap",
              overflow: "hidden",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <span
              style={{
                display: "inline-block",
                color: "#facc15",
                fontWeight: 600,
                fontSize: "14px",
                textShadow: "1px 1px 2px #000",
                animation: "marquee-left 10s linear infinite",
              }}
            >
              💻 Ngoding sampai jatuh sakit? 😵‍💫 Katanya sih dedikasi 💪 Padahal
              mah... lupa cara hidup sehat 🚑🥴
            </span>
            <style>{`
              @keyframes marquee-left {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </div>
          {/* GIF on the right side of the placeholder */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              height: "32px",
              display: "flex",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <img
              src={kawaiGif}
              alt="kawai gif"
              style={{ height: "32px", width: "auto", borderRadius: "4px" }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex-1 bg-black overflow-x-auto">
        <div className="flex h-full">
          {openTabs.map((tabId) => {
            const isDirty = dirtyFiles.has(tabId);

            return (
              <div
                key={tabId}
                className={`group flex items-center min-w-[120px] max-w-[200px] h-full px-3 border-r
                  ${
                    activeTabId === tabId ? "border-t-2 border-t-red-500" : ""
                  }`}
                style={{
                  backgroundColor:
                    activeTabId === tabId
                      ? themeColors["editor.background"]
                      : themeColors["titleBar.activeBackground"],
                  borderColor: themeColors["titleBar.border"],
                  color:
                    activeTabId === tabId
                      ? themeColors["titleBar.activeForeground"]
                      : themeColors["titleBar.inactiveForeground"],
                }}
                onClick={() => setActiveTab(tabId)}
              >
                <span className="mr-2">{getFileIcon(tabId)}</span>
                <span className="truncate text-sm" title={getFileName(tabId)}>
                  {getFileName(tabId)}
                </span>
                {isDirty && (
                  <span className="ml-2 text-xs text-blue-400">●</span>
                )}
                <button
                  className="ml-2 p-1 rounded-sm opacity-0 group-hover:opacity-100
                    hover:bg-opacity-20 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tabId);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeaderTabs;
