import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import EditCustomer from './pages/EditCustomer';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to a common page if unauthorized
        return <Navigate to="/dashboard" />;
    }

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
                    <Route 
                        path="/customers" 
                        element={
                            <RoleRoute allowedRoles={['admin', 'manager']}>
                                <Customers />
                            </RoleRoute>
                        } 
                    />
                    <Route 
                        path="/customers/add" 
                        element={
                            <RoleRoute allowedRoles={['admin', 'manager']}>
                                <AddCustomer />
                            </RoleRoute>
                        } 
                    />
                    <Route 
                        path="/customers/edit/:id" 
                        element={
                            <RoleRoute allowedRoles={['admin', 'manager']}>
                                <EditCustomer />
                            </RoleRoute>
                        } 
                    />
                    <Route 
                        path="/subscriptions" 
                        element={
                            <RoleRoute allowedRoles={['admin', 'manager']}>
                                <Subscriptions />
                            </RoleRoute>
                        } 
                    />
                    <Route 
                        path="/invoices" 
                        element={
                            <RoleRoute allowedRoles={['admin', 'manager']}>
                                <Invoices />
                            </RoleRoute>
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
