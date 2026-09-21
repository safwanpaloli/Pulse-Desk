import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!user) return <Navigate to="/login" />;
    
    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (user) return <Navigate to="/dashboard" />;
    
    return children;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={
                        <PublicRoute>
                            <Index />
                        </PublicRoute>
                    } />
                    <Route 
                        path="/login" 
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    createRoot(rootElement).render(<App />);
}
