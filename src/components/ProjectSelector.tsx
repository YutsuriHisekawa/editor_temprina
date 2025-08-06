import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Project } from "../types/project";
import {
  getProjects,
  saveProject,
  setActiveProject,
} from "../utils/localStorage";

// Helper to delete project by id from localStorage
function deleteProjectById(id: string) {
  const key = "ql_generator_projects";
  const raw = localStorage.getItem(key);
  if (!raw) return;
  let arr = [];
  try {
    arr = JSON.parse(raw);
  } catch {}
  if (!Array.isArray(arr)) return;
  const filtered = arr.filter((p: any) => p.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
}
import {
  Plus,
  Server,
  Globe,
  Key,
  Lock,
  X,
  Clock,
  LayoutGrid,
  List,
  Sun,
  Moon,
} from "lucide-react";
// import noraGif from "../pict/Nora.gif"; // Ganti ke path public
import { connectToBackend } from "../services/api";
import { initializeApiConfig } from "../utils/apiConfig";
import { usePageTitle } from "../hooks/usePageTitle";

const ProjectSelector: React.FC = () => {
  usePageTitle();

  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or prefer-color-scheme
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) return savedMode === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    rootAddress: "",
    developerToken: "",
    backendPassword: "",
  });

  useEffect(() => {
    setProjects(getProjects());
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);

    try {
      // Test connection using Root Address as base URL
      await connectToBackend(
        formData.rootAddress,
        formData.developerToken,
        formData.backendPassword
      );

      // If connection successful, save project
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };

      saveProject(newProject);
      setProjects(getProjects());
      setShowAddForm(false);
      setFormData({
        name: "",
        rootAddress: "",
        developerToken: "",
        backendPassword: "",
      });
    } catch (err) {
      setError(
        "Failed to connect to backend. Please check your credentials and server address."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setActiveProject(project);
    document.title = `${project.name} - Developer`; // Update title when selecting project
    initializeApiConfig(project); // Initialize API config before navigation
    navigate("/editor");
  };

  // Delete project handler
  const handleDeleteProject = async (id: string) => {
    const result = await Swal.fire({
      title: "Buang Proyek Ini?",
      text: "Tenang aja... cuma kerja keras berbulan-bulan yang bakal lenyap. Gak sakit kok, cuma perih batin.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, buang aja.",
      cancelButtonText: "Eh, tahan dulu deh",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      deleteProjectById(id);
      setProjects(getProjects());

      await Swal.fire({
        title: "Done. 🗑️",
        text: "Proyek sudah dimusnahkan. Seakan tak pernah ada. Seperti kontribusimu di rapat mingguan.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-200 relative" style={{
      backgroundImage: `url('/pict/kota.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Overlay hitam transparan */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      {/* Konten utama, pastikan di atas overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-black/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/pict/Nora.gif"
                alt="nora gif"
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 6,
                  objectFit: "cover",
                }}
              />
              <h1 className="text-xl font-bold text-black dark:text-white">
                🖥️ Developer Workspace,
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        className={`flex-1 mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
          viewMode === "grid" ? "max-w-7xl" : "w-full"
        }`}
      >
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }`}
        >
          {projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <Server
                size={48}
                className="mb-4 text-gray-400 dark:text-gray-500"
              />
              <h3 className="text-xl font-medium mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                New Project
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`group relative w-full transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-black/60 shadow-xl hover:bg-white/15 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-400/10"
                    : "flex items-center bg-white hover:bg-gray-50 dark:hover:bg-[#2d2e40] dark:bg-[#1a1b26] rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-red-400/50"
                }`}
              >
                {/* Status indicator (optional) */}
                <div className="absolute top-3 right-3 flex items-center">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>

                <div
                  className={`w-full ${
                    viewMode === "list"
                      ? "flex items-center justify-between"
                      : ""
                  }`}
                >
                  <div className="flex items-center w-full space-x-4">
                    {/* Project icon with gradient background */}
                    <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex-shrink-0 shadow-sm">
                      <Server size={20} className="text-white" />
                    </div>

                    <div
                      className="flex-1 min-w-0"
                      onClick={() => handleProjectSelect(project)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {project.name}
                          </h3>
                        </div>

                        {/* Last accessed time for list view */}
                        {viewMode === "list" && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-4">
                            <Clock size={14} className="mr-1.5 flex-shrink-0" />
                            <span>
                              {new Date(
                                project.lastAccessed || project.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">
                        {project.rootAddress}
                      </p>

                      {/* Additional project info (only shown in grid view) */}
                      {viewMode === "grid" && (
                        <>
                          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={14} className="mr-1.5 flex-shrink-0" />
                            <span>
                              Last accessed:{" "}
                              {new Date(
                                project.lastAccessed || project.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Settings button */}

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 transition-colors"
                        title="Delete project"
                        style={{ minWidth: 32, minHeight: 32 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-[#1a1b26] p-6 rounded-xl w-full max-w-lg shadow-lg relative">
              <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl text-gray-800 dark:text-white font-semibold">
                    Connect to Your Backend Server
                  </h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-500 rounded-md text-red-700 dark:text-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
                        Server Name
                      </label>
                      <div className="relative">
                        <Server
                          size={18}
                          className="absolute left-3 top-2.5 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="eg: My Super Project"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Root Address
                      </label>
                      <div className="relative">
                        <Globe
                          size={18}
                          className="absolute left-3 top-2.5 text-gray-400"
                        />
                        <input
                          type="url"
                          placeholder="eg: https://www.example.com"
                          value={formData.rootAddress}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              rootAddress: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
                        Developer Token
                      </label>
                      <div className="relative">
                        <Key
                          size={18}
                          className="absolute left-3 top-2.5 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Token"
                          value={formData.developerToken}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              developerToken: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
                        Backend Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-2.5 text-gray-400"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={formData.backendPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              backendPassword: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className={`
              w-full py-2 rounded-md transition-colors text-white
              ${
                isConnecting
                  ? "bg-red-800 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }
            `}
                  >
                    {isConnecting ? "Connecting..." : "Connect"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {/* <footer className="bg-white dark:bg-[#1a1b26] border-t border-gray-200 dark:border-gray-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>2025 | Contact Developer:</span>
            <a
              href="https://instagram.com/amin.nur.azziz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center space-x-1"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </footer> */}
      </div>
    </div>
  );
};

export default ProjectSelector;
