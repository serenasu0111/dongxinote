import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './hooks/useStore';
import { authAPI } from './services/api';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InventoriesPage } from './pages/InventoriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { NewInventoryPage } from './pages/NewInventoryPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { NewNotePage } from './pages/NewNotePage';
import { SearchPage } from './pages/SearchPage';
import { TimelinePage } from './pages/TimelinePage';
import { SettingsPage } from './pages/SettingsPage';
import { EditNotePage } from './pages/EditNotePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAppStore();
  const [loading, setLoading] = useState(true);
  const { setUser, setToken } = useAppStore();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
          setToken(storedToken);
        } catch (error) {
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Navbar />
              <HomePage />
            </ProtectedRoute>
          } />
          
          <Route path="/inventories" element={
            <ProtectedRoute>
              <Navbar />
              <InventoriesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/inventory/:id" element={
            <ProtectedRoute>
              <Navbar />
              <InventoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="/new-inventory" element={
            <ProtectedRoute>
              <Navbar />
              <NewInventoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="/edit-inventory/:id" element={
            <ProtectedRoute>
              <Navbar />
              <NewInventoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="/note/:id" element={
            <ProtectedRoute>
              <Navbar />
              <NoteDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/new-note" element={
            <ProtectedRoute>
              <Navbar />
              <NewNotePage />
            </ProtectedRoute>
          } />
          
          <Route path="/search" element={
            <ProtectedRoute>
              <Navbar />
              <SearchPage />
            </ProtectedRoute>
          } />
          
          <Route path="/timeline" element={
            <ProtectedRoute>
              <Navbar />
              <TimelinePage />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Navbar />
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/edit-note/:id" element={
            <ProtectedRoute>
              <Navbar />
              <EditNotePage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
