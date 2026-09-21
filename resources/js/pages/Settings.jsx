import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

export default function Settings() {
    const { user, setUser } = useAuth();
    
    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

        try {
            const response = await axios.put('/api/profile', profileData);
            setUser(response.data.user);
            setProfileSuccess(response.data.message);
        } catch (error) {
            setProfileError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        try {
            const response = await axios.put('/api/profile/password', passwordData);
            setPasswordSuccess(response.data.message);
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Account Settings</h2>
                    <p className="text-zinc-600 text-sm">Manage your profile details and security preferences.</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900">Profile Information</h3>
                                <p className="text-sm text-zinc-500">Update your account's profile information and email address.</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {profileSuccess && (
                                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200/50 flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    {profileSuccess}
                                </div>
                            )}
                            {profileError && (
                                <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200/50 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {profileError}
                                </div>
                            )}
                            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address</label>
                                    <input 
                                        type="email"
                                        required
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800 transition-all"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={profileLoading}
                                        className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {profileLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Update Password */}
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900">Update Password</h3>
                                <p className="text-sm text-zinc-500">Ensure your account is using a long, random password to stay secure.</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {passwordSuccess && (
                                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200/50 flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    {passwordSuccess}
                                </div>
                            )}
                            {passwordError && (
                                <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200/50 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {passwordError}
                                </div>
                            )}
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Current Password</label>
                                    <input 
                                        type="password"
                                        required
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">New Password</label>
                                    <input 
                                        type="password"
                                        required
                                        minLength={8}
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Confirm Password</label>
                                    <input 
                                        type="password"
                                        required
                                        minLength={8}
                                        value={passwordData.new_password_confirmation}
                                        onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-800 transition-all"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={passwordLoading}
                                        className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {passwordLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
