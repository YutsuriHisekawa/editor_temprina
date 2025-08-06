import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProjectSelector from './components/ProjectSelector';
import MainLayout from './components/MainLayout';
import { getActiveProject } from './utils/localStorage';
import { ThemeProvider } from './context/ThemeContext';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProjectSelector />} />
          <Route
            path="/editor/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const activeProject = getActiveProject();
  
  if (!activeProject) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default App;