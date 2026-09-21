import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function AddCustomer() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/customers', formData);
            navigate('/customers');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                        <Link to="/customers" className="hover:text-zinc-900 transition-colors">Customers</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">Add Customer</span>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Add Customer</h2>
                    <p className="text-zinc-600 text-sm">Create a new customer account for the platform.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-100">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Account Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 focus:bg-white text-zinc-800 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                            <Link 
                                to="/customers"
                                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm disabled:opacity-70"
                            >
                                {loading ? 'Creating...' : 'Create Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
