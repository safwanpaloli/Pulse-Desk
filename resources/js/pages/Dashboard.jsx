import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">PulseDesk</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700 dark:text-gray-300">
                                {user?.name} 
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                    {user?.role?.toUpperCase()}
                                </span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Dashboard Overview</h2>
                        
                        {user?.role === 'admin' && (
                            <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 mb-4" role="alert">
                                <p className="font-bold">Admin Section</p>
                                <p>You have full access to manage the entire platform. Only admins can see this.</p>
                            </div>
                        )}

                        {(user?.role === 'admin' || user?.role === 'manager') && (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
                                <p className="font-bold">Management Tools</p>
                                <p>You can manage users, view analytics, and respond to support tickets.</p>
                            </div>
                        )}

                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                            <p className="font-bold">Standard Features</p>
                            <p>You can view your own profile, submit support tickets, and view your subscriptions.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
